import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_MISSION } from '@/data/sampleMission';
import { Direction, LatLng } from '@/types/mission';
import TourProgressBar from '@/components/TourProgressBar';
import TaskCard from '@/components/TaskCard';
import DirectionHUD from '@/components/directionHUD';
import FeedbackOverlay from '@/components/FeedbackOverlay';
import MockStreetView from '@/components/MockStreetView';
import StreetViewExplorer from '@/components/StreetViewExplorer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const StudentMission = () => {
  const navigate = useNavigate();
  const mission = SAMPLE_MISSION;
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [position, setPosition] = useState<LatLng>(mission.stops[0].location);
  const [heading, setHeading] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'recalculating' | null>(null);
  const [showDirections, setShowDirections] = useState(true);
  const [completed, setCompleted] = useState(false);

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

    // Check proximity to target
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

      {/* Back button */}
      <div className="absolute top-3 left-3 z-30">
        <Button variant="outline" size="sm" onClick={() => navigate('/')} className="bg-card/90 backdrop-blur shadow-md">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Salir
        </Button>
      </div>

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

      {/* Floating bottom panel */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-3 pb-safe">
        <div className="max-w-lg mx-auto space-y-3">
          {showDirections && (
            <DirectionHUD onChoose={handleDirection} />
          )}
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
