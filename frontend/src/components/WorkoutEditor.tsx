import { useState, useCallback, useEffect, useRef } from "react";
import { parseWorkout } from "@/lib/api";
import type { WorkoutParseResult } from "@/lib/types";
import { ExerciseBlock } from "./ExerciseBlock";

const DEFAULT_INPUT = `Variables:
  Max_Added_Weight = 50lbs
  Progression = +2.5lbs/week

Hangboard 20mm Half Crimp:
  Load: 80% Max_Added_Weight + Progression
  Volume: 10s hang, 3m rest x 5 sets

Moonboard 2016:
  Grade: V7
  Volume: 4 attempts, RPE 8`;

export function WorkoutEditor() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [parsed, setParsed] = useState<WorkoutParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doParse = useCallback(async (text: string) => {
    if (!text.trim()) {
      setParsed(null);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      const res = await parseWorkout(text);
      if (res.success && res.data) {
        setParsed(res.data);
        setError(null);
      } else {
        setError(res.error ?? "Unknown parse error");
        setParsed(null);
      }
    } catch {
      setError("Failed to reach backend. Is the Rust server running on :8000?");
      setParsed(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doParse(input);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, doParse]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            DSL Editor
          </h2>
          {loading && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Parsing...
            </span>
          )}
        </div>
        <textarea
          className="flex-1 w-full rounded-md border border-input bg-card p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write your workout DSL here..."
          spellCheck={false}
        />
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Workout Preview
          </h2>
          {parsed && (
            <span className="text-xs text-muted-foreground">
              {parsed.exercises.length} exercise
              {parsed.exercises.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {parsed?.exercises.map((exercise, i) => (
            <ExerciseBlock key={i} exercise={exercise} />
          ))}
          {!parsed && !error && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Start typing to see your workout...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
