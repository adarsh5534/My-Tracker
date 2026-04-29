import Link from "next/link";

import { WorkoutPlanManager } from "@/components/workout-plan-manager";
import { requireUser } from "@/lib/auth";
import { getWorkoutPlans } from "@/lib/workouts";

export default async function PlansPage() {
  const user = await requireUser();
  const plans = await getWorkoutPlans(user.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-line bg-surface-strong p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted">
              Workout plans
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Build your own Push, Pull, Legs templates.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Add the exact exercises you want in each plan, like Dumbbell Hammer Press, Cable Fly, Lat Pulldown, or Romanian Deadlift.
            </p>
          </div>

          <Link
            href="/workout/new"
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            Use a plan in workout log
          </Link>
        </div>
      </section>

      <WorkoutPlanManager plans={plans} />
    </div>
  );
}
