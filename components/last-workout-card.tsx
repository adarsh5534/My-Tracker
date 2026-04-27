import Link from "next/link";

import { formatCompactDate } from "@/lib/format";
import { formatBodyPartList } from "@/lib/utils";
import { type WorkoutRecord } from "@/types";

type LastWorkoutCardProps = {
  workout: WorkoutRecord | null;
};

export function LastWorkoutCard({ workout }: LastWorkoutCardProps) {
  if (!workout) {
    return (
      <section className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-sm backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
          Last workout
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          No sessions yet
        </h2>
        <p className="mt-3 max-w-md text-sm leading-7 text-muted">
          Log your first workout and LiftLog will start remembering your numbers and suggesting what to train next.
        </p>
        <Link
          href="/workout/new"
          className="mt-5 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
        >
          Create first workout
        </Link>
      </section>
    );
  }

  const exerciseNames = workout.exerciseLogs.map((log) => log.exercise.name).slice(0, 3);

  return (
    <section className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-sm backdrop-blur">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
        Last workout
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {formatCompactDate(workout.date)}
      </h2>
      <p className="mt-2 text-sm text-muted">{formatBodyPartList(workout.body_parts)}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white/75 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Exercises
          </p>
          <p className="mt-2 text-sm text-foreground">{workout.exerciseLogs.length}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white/75 px-4 py-4 sm:col-span-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Key lifts
          </p>
          <p className="mt-2 text-sm text-foreground">
            {exerciseNames.join(", ")}
          </p>
        </div>
      </div>
    </section>
  );
}
