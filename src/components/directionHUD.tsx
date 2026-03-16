import { DIRECTION_OPTIONS, Direction } from '@/types/mission';
import { Button } from '@/components/ui/button';

interface DirectionHUDProps {
  onChoose: (direction: Direction) => void;
  disabled?: boolean;
}

const DirectionHUD = ({ onChoose, disabled }: DirectionHUDProps) => {
  return (
    <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur rounded-xl px-3 py-2 shadow-lg border border-border/50">
      <span className="text-[10px] font-display font-bold text-muted-foreground mr-1 hidden sm:block">
        ¿Dirección?
      </span>
      {DIRECTION_OPTIONS.map((opt) => (
        <Button
          key={opt.direction}
          variant="direction"
          size="sm"
          disabled={disabled}
          onClick={() => onChoose(opt.direction)}
          className="flex flex-col h-auto py-1.5 px-2 gap-0 min-w-[3rem]"
          title={opt.labelEs}
        >
          <span className="text-base leading-none">{opt.icon}</span>
          <span className="text-[9px] leading-tight mt-0.5 hidden sm:block">{opt.labelEs.split(' ').slice(-1)[0]}</span>
        </Button>
      ))}
    </div>
  );
};

export default DirectionHUD;
