import { MissionStop } from '@/types/mission';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
  stop: MissionStop;
  stopNumber: number;
  totalStops: number;
  onFound: () => void;
  showDirections: boolean;
}

const TaskCard = ({ stop, stopNumber, totalStops, onFound, showDirections }: TaskCardProps) => {
  const [showHint, setShowHint] = useState(false);

  return (
    <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-display font-bold">
                {stopNumber}
              </span>
              <span className="text-xs text-muted-foreground font-body">
                Parada {stopNumber} de {totalStops}
              </span>
            </div>
            <p className="font-display font-bold text-foreground text-sm leading-snug mb-1">
              {stop.questionEs}
            </p>
            <p className="text-xs text-muted-foreground font-body">
              {stop.question}
            </p>
            {showHint && (
              <p className="text-xs text-warning mt-2 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                {stop.hint}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <Button
              variant="success"
              size="sm"
              onClick={onFound}
              className="text-xs"
            >
              <MapPin className="h-3 w-3 mr-1" />
              ¡Encontrado!
            </Button>
            {!showHint && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(true)}
                className="text-xs text-muted-foreground"
              >
                <Lightbulb className="h-3 w-3 mr-1" />
                Pista
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
