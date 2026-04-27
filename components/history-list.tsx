import { formatCompactDate, formatSetsPreview } from "@/lib/format";
import { formatBodyPartList } from "@/lib/utils";
import { type WorkoutRecord } from "@/types";

type HistoryListProps = {
  workouts: WorkoutRecord[];
};

export function HistoryList({ workouts }: HistoryListProps) {
  if (workouts.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-line bg-surface p-6 text-sm text-muted">
        No workouts logged yet. Start with a new workout to build your history.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <details
          key={workout.id}
          className="group rounded-[1.75rem] border border-line bg-surface p-5 shadow-sm backdrop-blur"
        >
          <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-foreground">
                {formatCompactDate(workout.date)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {formatBodyPartList(workout.body_parts)}
              </p>
            </div>
            <span className="text-sm font-medium text-accent transition group-open:text-accent-strong">
              Expand details
            </span>
          </summary>

          <div className="mt-5 grid gap-3">
            {workout.exerciseLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-line bg-white/80 px-4 py-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-foreground">{log.exercise.name}</p>
                  <p className="text-sm text-muted">
                    {formatSetsPreview(log.sets)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
