import { useEffect, useRef } from 'react';

interface CorrectionTooltipProps {
  word: string;
  suggestions: string[];
  position: { x: number; y: number };
  onSelectSuggestion: (suggestion: string) => void;
  onClose: () => void;
}

export function CorrectionTooltip({
  word,
  suggestions,
  position,
  onSelectSuggestion,
  onClose
}: CorrectionTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={tooltipRef}
      className="absolute z-50 bg-card border border-border rounded-md shadow-lg p-2 min-w-[150px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      role="dialog"
      aria-label="Correction suggestions"
    >
      <div className="text-xs text-muted-foreground mb-2 px-1">
        Suggestions for "{word}"
      </div>
      <div className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className="w-full text-left px-2 py-1 text-sm rounded hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
