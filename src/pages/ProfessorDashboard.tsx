import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MissionStop, LatLng, Mission } from '@/types/mission';
import { SAMPLE_MISSION } from '@/data/sampleMission';
import QuestionCard from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Play, MapPin, ArrowLeft } from 'lucide-react';

const ProfessorDashboard = () => {
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission>(SAMPLE_MISSION);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionEs, setNewQuestionEs] = useState('');
  const [newHint, setNewHint] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);

  const handleAddStop = () => {
    if (!newQuestion || !newQuestionEs) return;

    const newStop: MissionStop = {
      id: `stop-${Date.now()}`,
      question: newQuestion,
      questionEs: newQuestionEs,
      hint: newHint || 'No hint provided',
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
    setSelectedLocation(null);
  };

  const handleRemoveStop = (id: string) => {
    setMission((prev) => ({
      ...prev,
      stops: prev.stops.filter((s) => s.id !== id),
    }));
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
              <p className="text-xs text-muted-foreground font-body">Crea y gestiona misiones</p>
            </div>
          </div>
          <Button variant="default" size="lg" onClick={() => navigate('/student')}>
            <Play className="h-4 w-4 mr-2" />
            Previsualizar
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Questions */}
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
            </CardContent>
          </Card>

          {/* Add question */}
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
            <div className="h-full bg-muted flex flex-col items-center justify-center p-6 text-center">
              <MapPin className="h-16 w-16 text-primary/30 mb-4" />
              <h3 className="font-display font-bold text-foreground mb-2">Mapa del Barrio</h3>
              <p className="text-sm text-muted-foreground font-body mb-4 max-w-xs">
                Add a Google Maps API key to enable interactive map for placing mission stops.
              </p>
              {/* Show pins on a simple grid for demo */}
              <div className="w-full max-w-sm bg-card rounded-lg p-4 border space-y-2">
                {mission.stops.map((stop, i) => (
                  <div
                    key={stop.id}
                    className="flex items-center gap-2 text-xs font-body text-foreground"
                  >
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-display font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="truncate">{stop.questionEs}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
