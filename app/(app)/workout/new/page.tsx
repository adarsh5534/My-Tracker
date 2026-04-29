import { WorkoutBuilder } from "@/components/workout-builder";
import { requireUser } from "@/lib/auth";
import {
  getExerciseCatalog,
  getLastPerformanceMap,
  getWorkoutPlans,
} from "@/lib/workouts";

export default async function NewWorkoutPage() {
  const user = await requireUser();
  const [exercises, lastPerformanceMap, workoutPlans] = await Promise.all([
    getExerciseCatalog(),
    getLastPerformanceMap(user.id),
    getWorkoutPlans(user.id),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-line bg-surface-strong p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted">
          New workout
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Log it while the bar is still warm.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          Pick the muscles you trained, add exercises, and use quick actions to reuse or nudge your last set without retyping everything.
        </p>
      </section>

      <WorkoutBuilder
        exercises={exercises}
        lastPerformanceMap={lastPerformanceMap}
        workoutPlans={workoutPlans}
      />
    </div>
  );
}
