import { HistoryList } from "@/components/history-list";
import { requireUser } from "@/lib/auth";
import { getUserWorkoutHistory } from "@/lib/workouts";

export default async function HistoryPage() {
  const user = await requireUser();
  const workouts = await getUserWorkoutHistory(user.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-line bg-surface-strong p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted">
          History
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Every workout in one scroll.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          Expand each workout to see exercises and exact sets so the next session starts with context.
        </p>
      </section>

      <HistoryList workouts={workouts} />
    </div>
  );
}
