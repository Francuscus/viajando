import { MissionStop } from '@/types/mission';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2 } from 'lucide-react';

interface QuestionCardProps {
  stop: MissionStop;
  index: number;
  onRemove: () => void;
  isActive?: boolean;
}

const QuestionCard = ({ stop, index, onRemove, isActive }: QuestionCardProps) => {
  return (
    <Card className={`transition-all ${isActive ? 'ring-2 ring-primary shadow-lg' : ''}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-display">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold mr-2">
              {index + 1}
            </span>
            Parada {index + 1}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-7 w-7">
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-1">
        <p className="text-sm font-body font-medium text-foreground">{stop.questionEs}</p>
        <p className="text-xs text-muted-foreground">{stop.question}</p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
          <MapPin className="h-3 w-3" />
          {stop.location.lat.toFixed(4)}, {stop.location.lng.toFixed(4)}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
