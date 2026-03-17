import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MissionStop, LatLng, Mission, StartingPlace } from '@/types/mission';
import { SAMPLE_MISSION } from '@/data/sampleMission';
import QuestionCard from '@/components/QuestionCard';
import MapPicker from '@/components/MapPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Play, MapPin, ArrowLeft, Navigation, Trash2, RefreshCw } from 'lucide-react';
import { APP_VERSION } from '@/version';

const CITY_PRESETS = [
  { label: 'Buenos Aires, Argentina', neighborhood: 'Buenos Aires', center: { lat: -34.6037, lng: -58.3816 } },
  { label: 'Barcelona, España',       neighborhood: 'Barcelona',    center: { lat: 41.3833,  lng: 2.1777  } },
  { label: 'Madrid, España',          neighborhood: 'Madrid',       center: { lat: 40.4168,  lng: -3.7038 } },
  { label: 'México D.F., México',     neighborhood: 'Ciudad de México', center: { lat: 19.4326, lng: -99.1332 } },
  { label: 'Lima, Perú',              neighborhood: 'Lima',         center: { lat: -12.0464, lng: -77.0428 } },
  { label: 'Bogotá, Colombia',        neighborhood: 'Bogotá',       center: { lat: 4.7110,   lng: -74.0721 } },
  { label: 'Santiago, Chile',         neighborhood: 'Santiago',     center: { lat: -33.4489, lng: -70.6693 } },
  { label: 'Sevilla, España',         neighborhood: 'Sevilla',      center: { lat: 37.3891,  lng: -5.9845  } },
];

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const STORAGE_KEY = 'viajando_mission';

function loadMission(): Mission {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Mission;
  } catch {
    // ignore parse errors
  }
  return SAMPLE_MISSION;
}

const ProfessorDashboard = () => {
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission>(loadMission);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionEs, setNewQuestionEs] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newDirections, setNewDirections] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);

  // Starting places form state
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceNameEs, setNewPlaceNameEs] = useState('');
  const [newPlaceEmoji, setNewPlaceEmoji] = useState('📍');
  const [newPlaceLat, setNewPlaceLat] = useState('');
  const [newPlaceLng, setNewPlaceLng] = useState('');

  // Persist mission to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mission));
  }, [mission]);

  // Auto-fill lat/lng fields when professor clicks on the map
  useEffect(() => {
    if (selectedLocation) {
      setNewPlaceLat(selectedLocation.lat.toFixed(6));
      setNewPlaceLng(selectedLocation.lng.toFixed(6));
    }
  }, [selectedLocation]);

  const handleAddStop = () => {
    if (!newQuestion || !newQuestionEs) return;

    const newStop: MissionStop = {
      id: `stop-${Date.now()}`,
      question: newQuestion,
      questionEs: newQuestionEs,
      hint: newHint || 'No hint provided',
      directions: newDirections || undefined,
      location: selectedLocation || {
        lat: mission.center.lat + (Math.random() - 0.5) * 0.005,
        lng: mission.center.lng + (Math.random() - 0.5) * 0.005,
      },
      answer: '',
    };

    setMission((prev) => ({
      ...prev,
      stops: [...prev.stops, newStop],
    }));
    setNewQuestion('');
    setNewQuestionEs('');
    setNewHint('');
    setNewDirections('');
    setSelectedLocation(null);
  };

  const handleRemoveStop = (id: string) => {
    setMission((prev) => ({
      ...prev,
      stops: prev.stops.filter((s) => s.id !== id),
    }));
  };

  const handleAddStartingPlace = () => {
    if (!newPlaceName || !newPlaceNameEs) return;
    if (mission.startingPlaces.length >= 4) return;

    const lat = parseFloat(newPlaceLat);
    const lng = parseFloat(newPlaceLng);

    const newPlace: StartingPlace = {
      id: `start-${Date.now()}`,
      name: newPlaceName,
      nameEs: newPlaceNameEs,
      emoji: newPlaceEmoji || '📍',
      location: {
        lat: isNaN(lat) ? mission.center.lat + (Math.random() - 0.5) * 0.003 : lat,
        lng: isNaN(lng) ? mission.center.lng + (Math.random() - 0.5) * 0.003 : lng,
      },
    };

    setMission((prev) => ({
      ...prev,
      startingPlaces: [...prev.startingPlaces, newPlace],
    }));
    setNewPlaceName('');
    setNewPlaceNameEs('');
    setNewPlaceEmoji('📍');
    setNewPlaceLat('');
    setNewPlaceLng('');
  };

  const handleRemoveStartingPlace = (id: string) => {
    setMission((prev) => ({
      ...prev,
      startingPlaces: prev.startingPlaces.filter((p) => p.id !== id),
    }));
  };

  const handleNewMission = () => {
    const blank: Mission = {
      id: `mission-${Date.now()}`,
      title: 'Nueva Misión',
      neighborhood: '',
      center: mission.center, // keep current map position
      zoom: 17,
      stops: [],
      startingPlaces: [],
    };
    setMission(blank);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">Panel del Profesor</h1>
              <p className="text-xs text-muted-foreground font-body">
                Crea y gestiona misiones · <span className="font-mono">{APP_VERSION}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNewMission}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Nueva misión
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(mission));
                navigate('/student');
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              Previsualizar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Questions & Settings */}
        <div className="space-y-4">
          {/* Mission info */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-display">Información de la Misión</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Título</label>
                <Input
                  value={mission.title}
                  onChange={(e) => setMission((prev) => ({ ...prev, title: e.target.value }))}
                  className="font-body"
                />
              </div>
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Barrio</label>
                <Input
                  value={mission.neighborhood}
                  onChange={(e) => setMission((prev) => ({ ...prev, neighborhood: e.target.value }))}
                  className="font-body"
                />
              </div>
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Ciudad</label>
                <select
                  className="w-full text-xs font-body border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={CITY_PRESETS.find(
                    (c) =>
                      Math.abs(c.center.lat - mission.center.lat) < 0.01 &&
                      Math.abs(c.center.lng - mission.center.lng) < 0.01
                  )?.label ?? ''}
                  onChange={(e) => {
                    const preset = CITY_PRESETS.find((c) => c.label === e.target.value);
                    if (!preset) return;
                    setMission((prev) => ({
                      ...prev,
                      center: preset.center,
                      neighborhood: preset.neighborhood,
                      stops: [],
                      startingPlaces: [],
                    }));
                  }}
                >
                  <option value="">— Seleccionar ciudad —</option>
                  {CITY_PRESETS.map((c) => (
                    <option key={c.label} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Starting Places */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Lugares de Inicio
                <span className="text-xs font-body font-normal text-muted-foreground ml-auto">
                  {mission.startingPlaces.length}/4
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              {/* Existing starting places */}
              {mission.startingPlaces.length > 0 && (
                <div className="space-y-2">
                  {mission.startingPlaces.map((place, i) => (
                    <div
                      key={place.id}
                      className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                    >
                      <span className="text-xl">{place.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display font-bold text-foreground truncate">
                          {place.nameEs}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-body truncate">
                          {place.name} — {place.location.lat.toFixed(4)}, {place.location.lng.toFixed(4)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveStartingPlace(place.id)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new starting place */}
              {mission.startingPlaces.length < 4 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-muted-foreground font-body">
                    Añade hasta 4 lugares donde los estudiantes pueden comenzar (al hacer clic, el mapa hace zoom a esa ubicación).
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-body text-muted-foreground mb-1 block">Nombre (ES)</label>
                      <Input
                        placeholder="Plaza Central"
                        value={newPlaceNameEs}
                        onChange={(e) => setNewPlaceNameEs(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-body text-muted-foreground mb-1 block">Name (EN)</label>
                      <Input
                        placeholder="Central Square"
                        value={newPlaceName}
                        onChange={(e) => setNewPlaceName(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-body text-muted-foreground mb-1 block">Emoji</label>
                      <Input
                        placeholder="📍"
                        value={newPlaceEmoji}
                        onChange={(e) => setNewPlaceEmoji(e.target.value)}
                        className="text-xs text-center"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-body text-muted-foreground mb-1 block">Latitud</label>
                      <Input
                        placeholder="41.3833"
                        value={newPlaceLat}
                        onChange={(e) => setNewPlaceLat(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-body text-muted-foreground mb-1 block">Longitud</label>
                      <Input
                        placeholder="2.1777"
                        value={newPlaceLng}
                        onChange={(e) => setNewPlaceLng(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddStartingPlace}
                    disabled={!newPlaceName || !newPlaceNameEs}
                    className="w-full"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Añadir lugar de inicio
                  </Button>
                </div>
              )}
              {mission.startingPlaces.length === 0 && (
                <p className="text-xs text-muted-foreground font-body text-center py-2">
                  Sin lugares de inicio todavía.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Add stop */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Añadir Parada
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Pregunta (Español)</label>
                <Input
                  placeholder="Encuentra la catedral..."
                  value={newQuestionEs}
                  onChange={(e) => setNewQuestionEs(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Question (English)</label>
                <Input
                  placeholder="Find the cathedral..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">Pista / Hint</label>
                <Input
                  placeholder="Look for the large spires..."
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block flex items-center gap-1">
                  <Navigation className="h-3 w-3" />
                  Indicaciones para el estudiante (opcional)
                </label>
                <textarea
                  placeholder="Head north from the main square. Look for the tall stone spires..."
                  value={newDirections}
                  onChange={(e) => setNewDirections(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {selectedLocation
                  ? `Location: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
                  : 'Click on the map to set location (or one will be auto-assigned)'}
              </p>
              <Button
                variant="default"
                onClick={handleAddStop}
                disabled={!newQuestion || !newQuestionEs}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir parada
              </Button>
            </CardContent>
          </Card>

          {/* Question list */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-sm text-foreground">
              Paradas ({mission.stops.length})
            </h3>
            {mission.stops.map((stop, i) => (
              <QuestionCard
                key={stop.id}
                stop={stop}
                index={i}
                onRemove={() => handleRemoveStop(stop.id)}
              />
            ))}
            {mission.stops.length === 0 && (
              <p className="text-sm text-muted-foreground font-body text-center py-8">
                No hay paradas todavía. Añade una arriba.
              </p>
            )}
          </div>
        </div>

        {/* Right: Map */}
        <div className="lg:sticky lg:top-20 h-[calc(100vh-6rem)]">
          <Card className="h-full overflow-hidden">
            {API_KEY ? (
              <MapPicker
                center={mission.center}
                stops={mission.stops}
                startingPlaces={mission.startingPlaces}
                onLocationSelect={(pos) => {
                  setSelectedLocation(pos);
                  // Every click updates the mission center so student always
                  // starts near where the professor is working
                  setMission((prev) => ({ ...prev, center: pos }));
                }}
                apiKey={API_KEY}
              />
            ) : (
              <div className="h-full bg-muted flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="h-16 w-16 text-primary/30 mb-4" />
                <h3 className="font-display font-bold text-foreground mb-2">Mapa del Barrio</h3>
                <p className="text-sm text-muted-foreground font-body max-w-xs">
                  Set <code className="text-xs bg-muted-foreground/20 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to enable the interactive map.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
