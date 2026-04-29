import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  type Exercise,
  type ExerciseLastPerformanceMap,
  type ExerciseProgress,
  type ExerciseSession,
  type LoggedSet,
  type WorkoutPlan,
  type WorkoutRecord,
} from "@/types";

function normaliseSet(rawSet: {
  id: string;
  reps: number;
  set_number: number;
  weight: number | string;
}): LoggedSet {
  return {
    id: rawSet.id,
    reps: rawSet.reps,
    setNumber: rawSet.set_number,
    weight: Number(rawSet.weight),
  };
}

function sortSets(sets: LoggedSet[]) {
  return sets.slice().sort((first, second) => first.setNumber - second.setNumber);
}

function getTopSet(sets: LoggedSet[]) {
  return sets.reduce((best, current) => {
    if (!best) {
      return current;
    }

    if (current.weight > best.weight) {
      return current;
    }

    if (current.weight === best.weight && current.reps > best.reps) {
      return current;
    }

    return best;
  }, sets[0]);
}

function buildImprovementMessage(
  currentSession: ExerciseSession,
  previousSession: ExerciseSession | undefined,
) {
  if (!previousSession) {
    return null;
  }

  const currentTopSet = getTopSet(currentSession.sets);
  const previousTopSet = getTopSet(previousSession.sets);

  if (currentTopSet.weight > previousTopSet.weight) {
    return `+${(currentTopSet.weight - previousTopSet.weight).toFixed(1)}kg from last time`;
  }

  if (
    currentTopSet.weight === previousTopSet.weight &&
    currentTopSet.reps > previousTopSet.reps
  ) {
    const repDiff = currentTopSet.reps - previousTopSet.reps;
    return `+${repDiff} rep${repDiff === 1 ? "" : "s"} from last time`;
  }

  const currentTotalReps = currentSession.sets.reduce(
    (total, set) => total + set.reps,
    0,
  );
  const previousTotalReps = previousSession.sets.reduce(
    (total, set) => total + set.reps,
    0,
  );

  if (currentTotalReps > previousTotalReps) {
    return `+${currentTotalReps - previousTotalReps} total reps from last time`;
  }

  return null;
}

export async function getExerciseCatalog(): Promise<Exercise[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("id,name,body_part,user_id")
    .order("body_part", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((exercise) => ({
    bodyPart: exercise.body_part,
    id: exercise.id,
    name: exercise.name,
    userId: exercise.user_id,
  }));
}

export async function getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("workout_plans")
    .select(
      `
        id,
        name,
        body_parts,
        created_at,
        workout_plan_exercises (
          id,
          position,
          exercise:exercises (
            id,
            name,
            body_part
          )
        )
      `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((plan) => ({
    bodyParts: plan.body_parts ?? [],
    createdAt: plan.created_at,
    exercises: (plan.workout_plan_exercises ?? [])
      .map((item) => {
        const rawExercise = Array.isArray(item.exercise)
          ? item.exercise[0]
          : item.exercise;

        return {
          bodyPart: rawExercise?.body_part ?? "unknown",
          exerciseId: rawExercise?.id ?? "",
          id: item.id,
          name: rawExercise?.name ?? "Unknown exercise",
          position: item.position ?? 0,
        };
      })
      .sort((first, second) => first.position - second.position),
    id: plan.id,
    name: plan.name,
  }));
}

export async function getUserWorkoutHistory(userId: string): Promise<WorkoutRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("workouts")
    .select(
      `
        id,
        date,
        body_parts,
        exercise_logs (
          id,
          exercise_id,
          exercise:exercises (
            id,
            name,
            body_part
          ),
          sets (
            id,
            weight,
            reps,
            set_number
          )
        )
      `,
    )
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((workout) => ({
    body_parts: workout.body_parts ?? [],
    date: workout.date,
    exerciseLogs: (workout.exercise_logs ?? []).map((log) => {
      const rawExercise = Array.isArray(log.exercise)
        ? log.exercise[0]
        : log.exercise;

      return {
        exercise: {
          bodyPart: rawExercise?.body_part ?? "unknown",
          id: rawExercise?.id ?? log.exercise_id,
          name: rawExercise?.name ?? "Unknown exercise",
        },
        exerciseId: log.exercise_id,
        id: log.id,
        sets: sortSets((log.sets ?? []).map(normaliseSet)),
      };
    }),
    id: workout.id,
  }));
}

export async function getLastPerformanceMap(
  userId: string,
): Promise<ExerciseLastPerformanceMap> {
  const workouts = await getUserWorkoutHistory(userId);
  const result: ExerciseLastPerformanceMap = {};

  for (const workout of workouts) {
    for (const log of workout.exerciseLogs) {
      if (result[log.exerciseId]) {
        continue;
      }

      result[log.exerciseId] = {
        exerciseId: log.exerciseId,
        sets: log.sets.map((set) => ({
          reps: set.reps,
          weight: set.weight,
        })),
        workoutDate: workout.date,
      };
    }
  }

  return result;
}

export function getExerciseProgress(workouts: WorkoutRecord[]): ExerciseProgress[] {
  const sessionsByExercise = new Map<
    string,
    {
      bodyPart: string;
      name: string;
      sessions: ExerciseSession[];
    }
  >();

  workouts.forEach((workout) => {
    workout.exerciseLogs.forEach((log) => {
      const current = sessionsByExercise.get(log.exerciseId);
      const session: ExerciseSession = {
        date: workout.date,
        sets: log.sets,
      };

      if (!current) {
        sessionsByExercise.set(log.exerciseId, {
          bodyPart: log.exercise.bodyPart,
          name: log.exercise.name,
          sessions: [session],
        });
        return;
      }

      current.sessions.push(session);
    });
  });

  return Array.from(sessionsByExercise.entries())
    .map(([exerciseId, value]) => {
      const [lastSession, previousSession, ...olderSessions] = value.sessions;
      const allSets = value.sessions.flatMap((session) => session.sets);
      const historicalPr = Math.max(...allSets.map((set) => set.weight));
      const previousPr = Math.max(
        0,
        ...[previousSession, ...olderSessions]
          .filter(Boolean)
          .flatMap((session) => session.sets.map((set) => set.weight)),
      );

      return {
        bodyPart: value.bodyPart,
        exerciseId,
        improvement: buildImprovementMessage(lastSession, previousSession),
        isNewPr: historicalPr > previousPr,
        lastSets: lastSession.sets,
        lastWorkoutDate: lastSession.date,
        name: value.name,
        personalRecord: historicalPr,
      };
    })
    .sort((first, second) => first.name.localeCompare(second.name));
}
