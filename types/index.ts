export type Exercise = {
  bodyPart: string;
  id: string;
  name: string;
  userId?: string | null;
};

export type LoggedSet = {
  id: string;
  reps: number;
  setNumber: number;
  weight: number;
};

export type ExerciseLogRecord = {
  exercise: Exercise;
  exerciseId: string;
  id: string;
  sets: LoggedSet[];
};

export type WorkoutRecord = {
  body_parts: string[];
  date: string;
  exerciseLogs: ExerciseLogRecord[];
  id: string;
};

export type WorkoutRecommendation = {
  bodyParts: string[];
  message: string;
};

export type ExerciseSession = {
  date: string;
  sets: LoggedSet[];
};

export type ExerciseProgress = {
  bodyPart: string;
  exerciseId: string;
  improvement: string | null;
  isNewPr: boolean;
  lastSets: LoggedSet[];
  lastWorkoutDate: string;
  name: string;
  personalRecord: number;
};

export type ExerciseLastPerformance = {
  exerciseId: string;
  sets: Array<{
    reps: number;
    weight: number;
  }>;
  workoutDate: string;
};

export type ExerciseLastPerformanceMap = Record<
  string,
  ExerciseLastPerformance
>;

export type WorkoutPayload = Array<{
  exerciseId: string;
  sets: Array<{
    reps: number;
    setNumber: number;
    weight: number;
  }>;
}>;

export type WorkoutPlanExercise = {
  bodyPart: string;
  exerciseId: string;
  id: string;
  name: string;
  position: number;
};

export type WorkoutPlan = {
  bodyParts: string[];
  createdAt: string;
  exercises: WorkoutPlanExercise[];
  id: string;
  name: string;
};

export type WorkoutPlanDraft = {
  bodyParts: string[];
  exercises: Array<{
    bodyPart: string;
    name: string;
  }>;
  name: string;
};
