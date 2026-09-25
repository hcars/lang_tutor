export interface WorkoutParseResult {
  variables: Variable[];
  exercises: Exercise[];
}

export interface Variable {
  name: string;
  value: number;
  unit: string | null;
  rate: string | null;
  sign: string | null;
}

export interface Exercise {
  name: string;
  properties: ExerciseProperties;
}

export interface ExerciseProperties {
  load: LoadSpec | null;
  volume: VolumeSpec | null;
  grade: string | null;
  rpe: number | null;
}

export interface LoadSpec {
  expression: string;
  terms: LoadTerm[];
}

export type LoadTerm =
  | { type: "PercentageRef"; percentage: number; variable: string }
  | { type: "VariableRef"; name: string }
  | { type: "Literal"; value: number; unit: string | null }
  | { type: "Operator"; op: string };

export type VolumeSpec =
  | {
      type: "TimeBased";
      hang_duration: Duration;
      rest_duration: Duration;
      sets: number;
    }
  | {
      type: "RepBased";
      count: number;
      rep_type: string;
      rpe: number | null;
    };

export interface Duration {
  value: number;
  unit: string;
}

export interface ParseResponse {
  success: boolean;
  data: WorkoutParseResult | null;
  error: string | null;
}
