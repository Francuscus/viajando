import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_MISSION } from '@/data/sampleMission';
import { Direction, LatLng, Mission, StartingPlace } from '@/types/mission';
import TourProgressBar from '@/components/TourProgressBar';
import TaskCard from '@/components/TaskCard';
import DirectionHUD from '@/components/directionHUD';
import FeedbackOverlay from '@/components/FeedbackOverlay';
import MockStreetView from '@/components/MockStreetView';
import StreetViewExplorer from '@/components/StreetViewExplorer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, MapPin, X, Download } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function loadMission(): Mission {
  try {
    const stored = localStorage.getItem('viajando_mission');
    if (stored) return JSON.parse(stored) as Mission;
  } catch {
    // ignore
  }
  return SAMPLE_MISSION;
}

// Draws a simplified snapshot of the current view to a canvas and downloads it
function downloadSceneSnapshot(
  position: LatLng,
  heading: number,
  stopLabel: string
): void {
  const width = 600;
  const height = 400;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.55);
  skyGrad.addColorStop(0, '#87CEEB');
  skyGrad.addColorStop(1, '#d0eaf8');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height * 0.55);

  // Ground
  ctx.fillStyle = '#c8c8c8';
  ctx.fillRect(0, height * 0.55, width, height * 0.45);

  // Road
  ctx.fillStyle = '#a0a0a0';
  const roadY = height * 0.65;
  ctx.fillRect(width * 0.3, roadY, width * 0.4, height - roadY);

  // Road dashes
  ctx.fillStyle = '#f5c518';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(width / 2 - 4, roadY + 20 + i * 40, 8, 24);
  }

  // Scene label
  const STREET_SCENES = [
    { label: 'Calle Mayor', buildings: '🏛️ 🏪 🏠 🏢' },
    { label: 'Calle del Sol', buildings: '🍽️ ☕ 🏪 🏠' },
    { label: 'Avenida de la Paz', buildings: '🏥 💊 🏦 🏫' },
    { label: 'Plaza Central', buildings: '⛪ 🏛️ ⛲ 🌳' },
  ];
  const sceneIndex = Math.abs(Math.floor(position.lat * 1000 + position.lng * 1000)) % STREET_SCENES.length;
  const scene = STREET_SCENES[sceneIndex];

  // Buildings (emoji row)
  ctx.font = '48px serif';
  ctx.textAlign = 'center';
  ctx.fillText(scene.buildings, width / 2, height * 0.52);

  // Street label chip
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.roundRect(12, 12, 160, 30, 6);
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(scene.label, 22, 32);

  // Coordinates chip
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.roundRect(12, height - 44, 220, 28, 6);
  ctx.fill();
  ctx.fillStyle = '#555';
  ctx.font = '11px sans-serif';
  ctx.fillText(`${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`, 22, height - 25);

  // Mission stop label
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, height - 26, width, 26);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(stopLabel, width / 2, height - 9);

  // Trigger download
  const link = document.createElement('a');
  link.download = `viaje-foto-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

const StudentMission = () => {
  const navigate = useNavigate();
  const mission = loadMission();
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [position, setPosition] = useState<LatLng>(
    mission.startingPlaces.length > 0
      ? mission.startingPlaces[0].location
      : mission.stops[0].location
  );
  const [heading, setHeading] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'recalculating' | null>(null);
  const [showDirections, setShowDirections] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [showStartingPlaces, setShowStartingPlaces] = useState(mission.startingPlaces.length > 0);
  const [cameraPrompt, setCameraPrompt] = useState(false);

  const currentStop = mission.stops[currentStopIndex];

  const handleDirection = useCallback((direction: Direction) => {
    const offsets: Record<Direction, { lat: number; lng: number; heading: number }> = {
      straight: { lat: 0.0003, lng: 0, heading: 0 },
      left: { lat: 0, lng: -0.0003, heading: -90 },
      right: { lat: 0, lng: 0.0003, heading: 90 },
      back: { lat: -0.0003, lng: 0, heading: 180 },
    };

    const offset = offsets[direction];
    const newPos = {
      lat: position.lat + offset.lat,
      lng: position.lng + offset.lng,
    };
    setPosition(newPos);
    setHeading((prev) => (prev + offset.heading) % 360);

    const dist = Math.sqrt(
      Math.pow(newPos.lat - currentStop.location.lat, 2) +
      Math.pow(newPos.lng - currentStop.location.lng, 2)
    );

    if (dist < 0.001) {
      setFeedback('correct');
    } else if (dist > 0.005) {
      setFeedback('recalculating');
    }
  }, [position, currentStop]);

  const handleFound = useCallback(() => {
    setFeedback('correct');
    setTimeout(() => {
      if (currentStopIndex < mission.stops.length - 1) {
        const nextIndex = currentStopIndex + 1;
        setCurrentStopIndex(nextIndex);
        setPosition(mission.stops[nextIndex].location);
        setHeading(0);
      } else {
        setCompleted(true);
      }
    }, 1500);
  }, [currentStopIndex, mission.stops]);

  const handleDismissFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const handleStartingPlace = useCallback((place: StartingPlace) => {
    setPosition(place.location);
    setHeading(0);
    setShowStartingPlaces(false);
  }, []);

  const handleCameraClick = () => {
    setCameraPrompt(true);
  };

  const handleDownloadPhoto = () => {
    const stopLabel = `Parada ${currentStopIndex + 1}: ${currentStop.questionEs}`;
    downloadSceneSnapshot(position, heading, stopLabel);
    setCameraPrompt(false);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          ¡Misión Completada!
        </h1>
        <p className="text-muted-foreground font-body mb-6">
          Has explorado todo el barrio. ¡Excelente trabajo!
        </p>
        <Button variant="default" size="lg" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col">
      <TourProgressBar current={currentStopIndex} total={mission.stops.length} />

      {/* Top bar: back button | direction HUD | camera button */}
      <div className="absolute top-8 inset-x-0 z-30 flex items-start justify-between px-3 gap-2">
        {/* Left: back */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="bg-card/90 backdrop-blur shadow-md shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Salir
        </Button>

        {/* Center: direction controls */}
        <DirectionHUD onChoose={handleDirection} />

        {/* Right: camera + starting places */}
        <div className="flex flex-col gap-1.5 items-end shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCameraClick}
            className="bg-card/90 backdrop-blur shadow-md"
            title="Tomar foto"
          >
            <Camera className="h-4 w-4" />
          </Button>
          {mission.startingPlaces.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStartingPlaces((v) => !v)}
              className="bg-card/90 backdrop-blur shadow-md"
              title="Lugares de inicio"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Starting places panel */}
      {showStartingPlaces && (
        <div className="absolute top-28 right-3 z-30 bg-card/95 backdrop-blur rounded-xl shadow-xl border border-border p-3 w-52">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-display font-bold text-foreground">Lugares de inicio</p>
            <button onClick={() => setShowStartingPlaces(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {mission.startingPlaces.map((place) => (
              <button
                key={place.id}
                onClick={() => handleStartingPlace(place)}
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-2"
              >
                <span className="text-lg">{place.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-display font-bold text-foreground leading-none truncate">
                    {place.nameEs}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-body truncate">
                    {place.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Camera save prompt */}
      {cameraPrompt && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
          <div className="bg-card rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <h2 className="font-display font-bold text-foreground">Guardar foto</h2>
              </div>
              <button onClick={() => setCameraPrompt(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm font-body text-muted-foreground">
              Se descargará una foto de la escena actual. Puedes subirla después a tu Google Drive o Docs.
            </p>
            <p className="text-xs font-body text-muted-foreground bg-muted rounded-lg p-2">
              📍 <strong>Parada {currentStopIndex + 1}:</strong> {currentStop.questionEs}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setCameraPrompt(false)}>
                Cancelar
              </Button>
              <Button variant="default" size="sm" className="flex-1" onClick={handleDownloadPhoto}>
                <Download className="h-4 w-4 mr-1" />
                Descargar foto
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Street View area */}
      <div className="flex-1 relative">
        {API_KEY ? (
          <StreetViewExplorer
            position={position}
            onPositionChange={setPosition}
            apiKey={API_KEY}
          />
        ) : (
          <MockStreetView position={position} heading={heading} />
        )}
      </div>

      {/* Floating bottom panel: task card only (no direction HUD here anymore) */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-3 pb-safe">
        <div className="max-w-lg mx-auto">
          <TaskCard
            stop={currentStop}
            stopNumber={currentStopIndex + 1}
            totalStops={mission.stops.length}
            onFound={handleFound}
            showDirections={showDirections}
          />
        </div>
      </div>

      <FeedbackOverlay type={feedback} onDismiss={handleDismissFeedback} />
    </div>
  );
};

export default StudentMission;
