import { useEffect } from 'react';

interface FeedbackOverlayProps {
  type: 'correct' | 'recalculating' | null;
  onDismiss: () => void;
}

const FeedbackOverlay = ({ type, onDismiss }: FeedbackOverlayProps) => {
  useEffect(() => {
    if (type) {
      const timer = setTimeout(onDismiss, 2000);
      return () => clearTimeout(timer);
    }
  }, [type, onDismiss]);

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div
        className={`px-8 py-4 rounded-2xl font-display font-bold text-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
          type === 'correct'
            ? 'bg-success text-success-foreground'
            : 'bg-warning text-warning-foreground'
        }`}
      >
        {type === 'correct' ? '¡Correcto! 🎉' : 'Recalculando... 🔄'}
      </div>
    </div>
  );
};

export default FeedbackOverlay;
