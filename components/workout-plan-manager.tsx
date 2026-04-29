"use client";

import { useActionState, useState } from "react";

import { createWorkoutPlanAction } from "@/app/actions/plans";
import { BODY_PART_OPTIONS } from "@/lib/constants";
import { formatCompactDate } from "@/lib/format";
import { INITIAL_FORM_STATE, cn, formatBodyPartList } from "@/lib/utils";
import { type WorkoutPlan, type WorkoutPlanDraft } from "@/types";

import { SubmitButton } from "./submit-button";

type WorkoutPlanManagerProps = {
  plans: WorkoutPlan[];
};

type DraftExercise = {
  bodyPart: string;
  id: string;
  name: string;
};

function createDraftExercise(): DraftExercise {
  return {
    bodyPart: "chest",
    id: crypto.randomUUID(),
    name: "",
  };
}

export function WorkoutPlanManager({ plans }: WorkoutPlanManagerProps) {
  const [state, formAction] = useActionState(
    createWorkoutPlanAction,
    INITIAL_FORM_STATE,
  );
  const [planName, setPlanName] = useState("");
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [exercises, setExercises] = useState<DraftExercise[]>([
    createDraftExercise(),
  ]);

  const planDraft: WorkoutPlanDraft = {
    bodyParts,
    exercises: exercises
      .filter((exercise) => exercise.name.trim().length > 0)
      .map((exercise) => ({
        bodyPart: exercise.bodyPart,
        name: exercise.name.trim(),
      })),
    name: planName.trim(),
  };

  const toggleBodyPart = (bodyPart: string) => {
    setBodyParts((current) =>
      current.includes(bodyPart)
        ? current.filter((value) => value !== bodyPart)
        : [...current, bodyPart],
    );
  };

  const updateExercise = (
    rowId: string,
    field: "bodyPart" | "name",
    value: string,
  ) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === rowId ? { ...exercise, [field]: value } : exercise,
      ),
    );
  };

  const addExercise = () => {
    setExercises((current) => [...current, createDraftExercise()]);
  };

  const removeExercise = (rowId: string) => {
    setExercises((current) =>
      current.length === 1
        ? [createDraftExercise()]
        : current.filter((exercise) => exercise.id !== rowId),
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <section className="rounded-[1.75rem] border border-line bg-surface p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Create a workout plan
          </h2>
          <p className="text-sm leading-7 text-muted">
            Build templates like Push, Pull, Legs, or a chest day with the exact exercises you want to see later in the workout logger.
          </p>
        </div>

        <form action={formAction} className="mt-6 space-y-5">
          <input type="hidden" name="planDraft" value={JSON.stringify(planDraft)} />

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Plan name</span>
            <input
              value={planName}
              onChange={(event) => setPlanName(event.target.value)}
              placeholder="Push day"
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
            />
          </label>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Body parts</p>
            <div className="flex flex-wrap gap-2">
              {BODY_PART_OPTIONS.map((bodyPart) => {
                const isSelected = bodyParts.includes(bodyPart);

                return (
                  <button
                    key={bodyPart}
                    type="button"
                    onClick={() => toggleBodyPart(bodyPart)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium capitalize transition",
                      isSelected
                        ? "border-accent bg-accent text-white"
                        : "border-line bg-white text-foreground hover:border-accent hover:text-accent",
                    )}
                  >
                    {bodyPart}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Exercises</p>
              <button
                type="button"
                onClick={addExercise}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
              >
                Add exercise
              </button>
            </div>

            {exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="grid gap-3 rounded-2xl border border-line bg-white/80 p-4 sm:grid-cols-[0.9fr_1.5fr_auto]"
              >
                <select
                  value={exercise.bodyPart}
                  onChange={(event) =>
                    updateExercise(exercise.id, "bodyPart", event.target.value)
                  }
                  className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                >
                  {BODY_PART_OPTIONS.map((bodyPart) => (
                    <option key={bodyPart} value={bodyPart}>
                      {bodyPart}
                    </option>
                  ))}
                </select>
                <input
                  value={exercise.name}
                  onChange={(event) =>
                    updateExercise(exercise.id, "name", event.target.value)
                  }
                  placeholder={`Exercise ${index + 1} e.g. Cable Fly`}
                  className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => removeExercise(exercise.id)}
                  className="rounded-2xl border border-line px-4 py-3 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {state.error ? (
            <p className="rounded-2xl border border-[rgba(185,28,28,0.14)] bg-[rgba(254,242,242,0.8)] px-4 py-3 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <SubmitButton className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">
            Save workout plan
          </SubmitButton>
        </form>
      </section>

      <section className="rounded-[1.75rem] border border-line bg-surface p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Saved plans
          </h2>
          <p className="text-sm leading-7 text-muted">
            These templates will appear on the New Workout page so you can load them with one tap.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <article
                key={plan.id}
                className="rounded-2xl border border-line bg-white/80 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {formatBodyPartList(plan.bodyParts)}
                    </p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {formatCompactDate(plan.createdAt)}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {plan.exercises.map((exercise) => (
                    <span
                      key={exercise.id}
                      className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-foreground"
                    >
                      {exercise.name} - {exercise.bodyPart}
                    </span>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-white/60 p-5 text-sm text-muted">
              No plans yet. Create your first Push, Pull, Legs, or custom split.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
