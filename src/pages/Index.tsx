import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, GraduationCap, BookOpen, Navigation } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-6">
            <Navigation className="h-4 w-4 text-primary" />
            <span className="text-sm font-display font-bold text-primary">CaminaConmigo</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4 leading-tight">
            Aprende español
            <br />
            <span className="text-primary">explorando calles</span>
          </h1>

          <p className="text-lg text-muted-foreground font-body mb-10 max-w-md mx-auto">
            An immersive language learning experience. Navigate real neighborhoods using Spanish directions and discover landmarks along the way.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 border-2 hover:border-primary/30"
              onClick={() => navigate('/student')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <h2 className="font-display font-bold text-foreground mb-1">Estudiante</h2>
                <p className="text-xs text-muted-foreground font-body">
                  Start a mission and explore
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 border-2 hover:border-primary/30"
              onClick={() => navigate('/professor')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-display font-bold text-foreground mb-1">Profesor</h2>
                <p className="text-xs text-muted-foreground font-body">
                  Create & manage missions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16">
          {[
            { icon: MapPin, label: 'Street View', desc: 'Real neighborhoods' },
            { icon: Navigation, label: 'Directions', desc: 'Practice in Spanish' },
            { icon: BookOpen, label: 'Missions', desc: 'Guided learning' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="text-center">
              <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-display font-bold text-xs text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground font-body">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Changelog */}
      <div className="w-full max-w-lg mx-auto mt-12 px-4 pb-4">
        <h3 className="text-xs font-display font-bold text-muted-foreground uppercase tracking-widest mb-3 text-center">
          Changelog
        </h3>
        <div className="space-y-2">
          {[
            {
              version: 'v1.3',
              label: 'City sync',
              desc: 'Professor missions save automatically; students see the configured city and choose a starting place.',
            },
            {
              version: 'v1.2',
              label: 'Map picker',
              desc: 'Professors click the map to place stops and starting places instead of entering coordinates by hand.',
            },
            {
              version: 'v1.1',
              label: 'Direction controls',
              desc: 'Navigation HUD moved to the top bar; camera capture added; professors can write per-stop directions.',
            },
          ].map(({ version, label, desc }) => (
            <div key={version} className="flex items-start gap-3 text-left">
              <span className="shrink-0 font-mono text-[10px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5 mt-0.5">
                {version}
              </span>
              <div>
                <span className="text-xs font-display font-bold text-foreground">{label} </span>
                <span className="text-xs text-muted-foreground font-body">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground font-body">
          CaminaConmigo — Interactive Spanish Field Trip
        </p>
      </footer>
    </div>
  );
};

export default Index;
