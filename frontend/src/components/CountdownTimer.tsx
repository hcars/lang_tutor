import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { X, SkipForward, Play } from "lucide-react";

interface Props {
  totalSeconds: number;
  label: string;
  running: boolean;
  onComplete: () => void;
  onStart?: () => void;
  onCancel?: () => void;
  onIncomplete?: () => void;
  onSkip?: () => void;
}

export function CountdownTimer({
  totalSeconds,
  label,
  running,
  onComplete,
  onStart,
  onCancel,
  onIncomplete,
  onSkip,
}: Props) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  const tick = useCallback(() => {
    if (!running) return;
    setRemaining((prev) => {
      if (prev <= 1) {
        onComplete();
        return 0;
      }
      return prev - 1;
    });
  }, [running, onComplete]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, tick]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;

  return (
    <div className="rounded-md bg-secondary/50 border border-border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="text-2xl font-mono font-bold text-primary tabular-nums">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          role="progressbar"
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex gap-2">
        {!running && onStart && (
          <Button
            variant="default"
            size="sm"
            onClick={onStart}
            className="flex-1 gap-1"
          >
            <Play className="w-3 h-3" />
            Start
          </Button>
        )}
        {running && onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="flex-1 gap-1"
          >
            <X className="w-3 h-3" />
            Cancel
          </Button>
        )}
        {running && onIncomplete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onIncomplete}
            className="flex-1 gap-1"
          >
            <X className="w-3 h-3" />
            Mark as Incomplete
          </Button>
        )}
        {running && onSkip && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSkip}
            className="flex-1 gap-1"
          >
            <SkipForward className="w-3 h-3" />
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
