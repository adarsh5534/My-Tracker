import Link from "next/link";

import { ExerciseProgressCard } from "@/components/exercise-progress-card";
import { LastWorkoutCard } from "@/components/last-workout-card";
import { RecommendationCard } from "@/components/recommendation-card";
import { requireUser } from "@/lib/auth";
import { getRecommendedWorkout } from "@/lib/recommendations";
import { getExerciseProgress, getUserWorkoutHistory } from "@/lib/workouts";

export default async function DashboardPage() {
  const user = await requireUser();
  const workouts = await getUserWorkoutHistory(user.id);
  const lastWorkout = workouts[0] ?? null;
  const recommendation = getRecommendedWorkout(lastWorkout);
  const progress = getExerciseProgress(workouts);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-[2rem] border border-line bg-surface-strong p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Keep the next workout obvious.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Review your last session, see where you improved, and head into the gym with a plan already waiting.
            </p>
          </div>

          <Link
            href="/workout/new"
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Log new workout
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <LastWorkoutCard workout={lastWorkout} />
        <RecommendationCard recommendation={recommendation} />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Exercise progress
            </h2>
            <p className="text-sm text-muted">
              Last-session performance, PRs, and what moved since the previous session.
            </p>
          </div>
          <Link className="text-sm font-medium text-accent hover:text-accent-strong" href="/history">
            View full history
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {progress.length > 0 ? (
            progress.map((item) => <ExerciseProgressCard key={item.exerciseId} item={item} />)
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-line bg-surface p-6 text-sm text-muted">
              No workouts yet. Your exercise progress cards will appear after the first session.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
