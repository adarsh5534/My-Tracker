import { formatCompactDate, formatSetsPreview } from "@/lib/format";
import { type ExerciseProgress } from "@/types";

type ExerciseProgressCardProps = {
  item: ExerciseProgress;
};

export function ExerciseProgressCard({ item }: ExerciseProgressCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-line bg-surface p-5 shadow-sm backdrop-blur sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-foreground">{item.name}</p>
          <p className="mt-1 text-sm text-muted">
            Last logged {formatCompactDate(item.lastWorkoutDate)}
          </p>
        </div>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {item.bodyPart}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white/75 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Last performance
          </p>
          <p className="mt-2 text-sm text-foreground">
            {formatSetsPreview(item.lastSets)}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white/75 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Personal record
          </p>
          <p className="mt-2 text-sm text-foreground">{item.personalRecord} kg</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.improvement ? (
          <span className="rounded-full bg-[rgba(22,101,52,0.1)] px-3 py-1 text-sm font-medium text-success">
            {item.improvement}
          </span>
        ) : (
          <span className="rounded-full bg-white/80 px-3 py-1 text-sm text-muted">
            No prior comparison yet
          </span>
        )}
        {item.isNewPr ? (
          <span className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-white">
            New PR
          </span>
        ) : null}
      </div>
    </article>
  );
}
