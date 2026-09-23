import { useState } from "react";
import type { Exercise, VolumeSpec } from "@/lib/types";
import { CountdownTimer } from "./CountdownTimer";
import { Button } from "./ui/button";
import { Check, X, Timer, ChevronDown, ChevronUp } from "lucide-react";

type SetOutcome = "completed" | "failed";
type TimerPhase = "hang" | "rest";

interface Props {
  exercise: Exercise;
}

export function ExerciseBlock({ exercise }: Props) {
  const { name, properties } = exercise;
  const [setOutcomes, setSetOutcomes] = useState<Map<number, SetOutcome>>(new Map());
  const [timerActive, setTimerActive] = useState(false);
  const [timerPhase, setTimerPhase] = useState<TimerPhase>("rest");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerForSet, setTimerForSet] = useState(-1);
  const [collapsed, setCollapsed] = useState(false);
  const [confirmRevertIdx, setConfirmRevertIdx] = useState<number | null>(null);

  const totalSets = getSetCount(properties.volume);
  const currentSet = getCurrentSet(setOutcomes, totalSets);
  const isTimeBased = properties.volume?.type === "TimeBased";

  const completeSet = (idx: number) => {
    setSetOutcomes((prev) => {
      const next = new Map(prev);
      next.set(idx, "completed");
      return next;
    });
  };

  const markSetFailed = (idx: number) => {
    setSetOutcomes((prev) => {
      const next = new Map(prev);
      next.set(idx, "failed");
      return next;
    });
  };

  const revertSet = (idx: number) => {
    setSetOutcomes((prev) => {
      const next = new Map<number, SetOutcome>();
      for (const [k, v] of prev) {
        if (k < idx) next.set(k, v);
      }
      return next;
    });
    setTimerActive(false);
    setTimerRunning(false);
    setTimerForSet(-1);
  };

  const handleSetClick = (idx: number) => {
    const outcome = setOutcomes.get(idx);
    if (outcome !== undefined) {
      setConfirmRevertIdx(idx);
      return;
    }
    if (idx !== currentSet) return;
    if (timerActive) return;

    if (isTimeBased) {
      // TimeBased: enter hang waiting state
      const hangSec = getHangSeconds(properties.volume);
      setTimerSeconds(hangSec);
      setTimerPhase("hang");
      setTimerRunning(false);
      setTimerActive(true);
      setTimerForSet(idx);
    } else {
      // RepBased: immediately complete and start rest
      completeSet(idx);
      startRestTimer(idx);
    }
  };

  const confirmRevert = () => {
    if (confirmRevertIdx !== null) {
      revertSet(confirmRevertIdx);
      setConfirmRevertIdx(null);
    }
  };

  const cancelRevert = () => {
    setConfirmRevertIdx(null);
  };

  const startRestTimer = (setIdx?: number) => {
    const restSec = getRestSeconds(properties.volume);
    if (restSec > 0) {
      setTimerSeconds(restSec);
      setTimerPhase("rest");
      setTimerRunning(true);
      setTimerActive(true);
      if (setIdx !== undefined) {
        setTimerForSet(setIdx);
      }
    }
  };

  const handleStartHang = () => {
    setTimerRunning(true);
  };

  const handleHangComplete = () => {
    // Hang finished - mark set as completed and start rest
    if (timerForSet >= 0) {
      completeSet(timerForSet);
    }
    startRestTimer(timerForSet >= 0 ? timerForSet : undefined);
  };

  const handleHangCancel = () => {
    // User cancelled hang - mark set as failed and start rest
    if (timerForSet >= 0) {
      markSetFailed(timerForSet);
    }
    startRestTimer(timerForSet >= 0 ? timerForSet : undefined);
  };

  const handleRestComplete = () => {
    setTimerActive(false);
    setTimerRunning(false);
    setTimerForSet(-1);
    
    // Auto-start next set's hang timer for TimeBased exercises
    const nextSetIndex = currentSet;
    if (isTimeBased && nextSetIndex < totalSets) {
      const hangSec = getHangSeconds(properties.volume);
      setTimerSeconds(hangSec);
      setTimerPhase("hang");
      setTimerRunning(false);
      setTimerActive(true);
      setTimerForSet(nextSetIndex);
    }
  };

  const handleRestIncomplete = () => {
    // Mark the set as failed, but keep timer running
    if (timerForSet >= 0) {
      markSetFailed(timerForSet);
    }
  };

  const handleRestSkip = () => {
    setTimerActive(false);
    setTimerRunning(false);
    setTimerForSet(-1);
    
    // Auto-start next set's hang timer for TimeBased exercises
    const nextSetIndex = currentSet;
    if (isTimeBased && nextSetIndex < totalSets) {
      const hangSec = getHangSeconds(properties.volume);
      setTimerSeconds(hangSec);
      setTimerPhase("hang");
      setTimerRunning(false);
      setTimerActive(true);
      setTimerForSet(nextSetIndex);
    }
  };

  const isHangWaiting = timerActive && timerPhase === "hang" && !timerRunning;
  const isHanging = timerActive && timerPhase === "hang" && timerRunning;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <h3 className="font-semibold text-foreground">{name}</h3>
        <div className="flex items-center gap-2">
          {totalSets > 0 && (
            <span className="text-xs text-muted-foreground">
              {setOutcomes.size}/{totalSets} sets
            </span>
          )}
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {properties.load && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Load:</span>
              <code className="px-2 py-0.5 rounded bg-secondary text-primary font-mono text-xs">
                {properties.load.expression}
              </code>
            </div>
          )}

          {properties.grade && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Grade:</span>
              <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-semibold text-xs">
                {properties.grade}
              </span>
            </div>
          )}

          {properties.rpe && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">RPE:</span>
              <span className="text-foreground font-semibold">
                {properties.rpe}
              </span>
            </div>
          )}

          {properties.volume && (
            <VolumeDisplay volume={properties.volume} />
          )}

          {totalSets > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {Array.from({ length: totalSets }, (_, i) => (
                <SetButton
                  key={i}
                  index={i}
                  outcome={setOutcomes.get(i)}
                  isCurrent={i === currentSet}
                  isTimerActive={timerActive}
                  isHangWaiting={isHangWaiting && i === timerForSet}
                  isHanging={isHanging && i === timerForSet}
                  onClick={() => handleSetClick(i)}
                />
              ))}
            </div>
          )}

          {timerActive && timerPhase === "hang" && (
            <CountdownTimer
              totalSeconds={timerSeconds}
              label="HANG"
              running={timerRunning}
              onComplete={handleHangComplete}
              onStart={handleStartHang}
              onCancel={handleHangCancel}
            />
          )}

          {timerActive && timerPhase === "rest" && (
            <CountdownTimer
              totalSeconds={timerSeconds}
              label="REST"
              running={timerRunning}
              onComplete={handleRestComplete}
              onIncomplete={handleRestIncomplete}
              onSkip={handleRestSkip}
            />
          )}

          {!timerActive && totalSets > 0 && setOutcomes.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startRestTimer()}
              className="gap-1"
            >
              <Timer className="w-3 h-3" />
              Rest Timer
            </Button>
          )}
        </div>
      )}

      {confirmRevertIdx !== null && (
        <div
          role="dialog"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={cancelRevert}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-sm mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-foreground">
              Clear Set {confirmRevertIdx + 1}?
            </h3>
            <p className="text-sm text-muted-foreground">
              This will clear the marking for Set {confirmRevertIdx + 1} and all subsequent sets.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={cancelRevert}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={confirmRevert}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SetButtonProps {
  index: number;
  outcome: SetOutcome | undefined;
  isCurrent: boolean;
  isTimerActive: boolean;
  isHangWaiting: boolean;
  isHanging: boolean;
  onClick: () => void;
}

function SetButton({
  index,
  outcome,
  isCurrent,
  isTimerActive,
  isHangWaiting,
  isHanging,
  onClick,
}: SetButtonProps) {
  const isDisabled =
    (!isCurrent && outcome === undefined) ||
    (isCurrent && isTimerActive) ||
    isHangWaiting ||
    isHanging;

  let className = "w-10 h-10 rounded-md border-2 flex items-center justify-center text-sm font-bold transition-all ";

  if (outcome === "completed") {
    className += "bg-primary border-primary text-primary-foreground cursor-pointer hover:opacity-80";
  } else if (outcome === "failed") {
    className += "bg-destructive border-destructive text-destructive-foreground cursor-pointer hover:opacity-80";
  } else if (isHanging) {
    className += "border-primary bg-primary/20 text-primary animate-pulse";
  } else if (isHangWaiting) {
    className += "border-primary bg-secondary/50 text-primary cursor-pointer hover:bg-primary/10 animate-pulse";
  } else if (isCurrent) {
    className += "border-primary bg-secondary/50 text-foreground cursor-pointer hover:bg-primary/10";
  } else {
    className += "border-border bg-secondary/50 text-muted-foreground cursor-not-allowed opacity-50";
  }

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={isDisabled}
      data-outcome={outcome}
      aria-label={`Set ${index + 1}${outcome ? ` (${outcome})` : ""}`}
    >
      {outcome === "completed" && <Check className="w-4 h-4" />}
      {outcome === "failed" && <X className="w-4 h-4" />}
      {outcome === undefined && index + 1}
    </button>
  );
}

function VolumeDisplay({ volume }: { volume: VolumeSpec }) {
  if (volume.type === "TimeBased") {
    return (
      <div className="text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Hang:</span>
          <span className="text-foreground">
            {volume.hang_duration.value}
            {volume.hang_duration.unit}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Rest:</span>
          <span className="text-foreground">
            {volume.rest_duration.value}
            {volume.rest_duration.unit}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Sets:</span>
          <span className="text-foreground font-semibold">
            {volume.sets}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Volume:</span>
        <span className="text-foreground font-semibold">
          {volume.count} {volume.rep_type}
        </span>
      </div>
    </div>
  );
}

function getCurrentSet(outcomes: Map<number, SetOutcome>, total: number): number {
  for (let i = 0; i < total; i++) {
    if (!outcomes.has(i)) return i;
  }
  return total;
}

function getSetCount(volume: VolumeSpec | null): number {
  if (!volume) return 0;
  if (volume.type === "TimeBased") return volume.sets;
  if (volume.type === "RepBased") return volume.count;
  return 0;
}

function getHangSeconds(volume: VolumeSpec | null): number {
  if (!volume || volume.type !== "TimeBased") return 10;
  const { value, unit } = volume.hang_duration;
  switch (unit) {
    case "s":
    case "sec":
      return value;
    case "m":
    case "min":
      return value * 60;
    default:
      return value;
  }
}

function getRestSeconds(volume: VolumeSpec | null): number {
  if (!volume || volume.type !== "TimeBased") return 180;
  const { value, unit } = volume.rest_duration;
  switch (unit) {
    case "s":
    case "sec":
      return value;
    case "m":
    case "min":
      return value * 60;
    default:
      return value;
  }
}
