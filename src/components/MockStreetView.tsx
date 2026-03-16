import { LatLng } from '@/types/mission';
import { MapPin, Navigation } from 'lucide-react';

interface MockStreetViewProps {
  position: LatLng;
  heading: number;
}

const STREET_SCENES = [
  { label: 'Calle Mayor', buildings: '🏛️ 🏪 🏠 🏢' },
  { label: 'Calle del Sol', buildings: '🍽️ ☕ 🏪 🏠' },
  { label: 'Avenida de la Paz', buildings: '🏥 💊 🏦 🏫' },
  { label: 'Plaza Central', buildings: '⛪ 🏛️ ⛲ 🌳' },
];

const MockStreetView = ({ position, heading }: MockStreetViewProps) => {
  const sceneIndex = Math.abs(Math.floor(position.lat * 1000 + position.lng * 1000)) % STREET_SCENES.length;
  const scene = STREET_SCENES[sceneIndex];

  return (
    <div className="w-full h-full bg-muted flex flex-col items-center justify-center relative">
      {/* Sky */}
      <div className="absolute inset-x-0 top-0 h-1/3 bg-primary/20" />
      
      {/* Compass */}
      <div className="absolute top-4 right-4 z-10 bg-card/80 backdrop-blur rounded-full p-2 shadow-md">
        <Navigation 
          className="h-6 w-6 text-primary transition-transform" 
          style={{ transform: `rotate(${heading}deg)` }} 
        />
      </div>

      {/* Street label */}
      <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur rounded-lg px-3 py-1.5 shadow-md">
        <p className="text-xs font-display font-bold text-foreground">{scene.label}</p>
      </div>

      {/* Buildings */}
      <div className="relative z-10 text-6xl tracking-widest mb-8 select-none">
        {scene.buildings}
      </div>

      {/* Road */}
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-muted-foreground/20">
        <div className="absolute inset-x-0 top-1/2 flex justify-center">
          <div className="w-2 h-8 bg-warning mx-8" />
          <div className="w-2 h-8 bg-warning mx-8" />
          <div className="w-2 h-8 bg-warning mx-8" />
        </div>
      </div>

      {/* Location pin */}
      <div className="absolute bottom-8 z-10 flex flex-col items-center">
        <MapPin className="h-8 w-8 text-destructive drop-shadow-md" />
        <span className="text-xs font-body text-foreground bg-card/80 rounded px-2 py-0.5 mt-1">
          {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
        </span>
      </div>

      {/* Demo banner */}
      <div className="absolute bottom-2 right-2 z-10">
        <span className="text-[10px] font-body bg-card/60 text-muted-foreground rounded px-2 py-0.5">
          Demo Mode — Add Google Maps API key for real Street View
        </span>
      </div>
    </div>
  );
};

export default MockStreetView;
