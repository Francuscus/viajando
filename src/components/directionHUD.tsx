import { DIRECTION_OPTIONS, Direction } from '@/types/mission';
import { Button } from '@/components/ui/button';

interface DirectionHUDProps {
  onChoose: (direction: Direction) => void;
  disabled?: boolean;
}

const DirectionHUD = ({ onChoose, disabled }: DirectionHUDProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-display font-bold text-primary mb-1">
        ¿Qué dirección tomas?
      </p>
      <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
        {DIRECTION_OPTIONS.map((opt) => (
          <Button
            key={opt.direction}
            variant="direction"
            size="lg"
            disabled={disabled}
            onClick={() => onChoose(opt.direction)}
            className="flex flex-col h-auto py-3 gap-0.5"
          >
            <span className="text-xl">{opt.icon}</span>
            <span className="text-xs leading-tight">{opt.labelEs}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DirectionHUD;
