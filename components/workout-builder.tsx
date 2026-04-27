"use client";

import { useActionState, useMemo, useState } from "react";

import { saveWorkoutAction } from "@/app/actions/workouts";
import { BODY_PART_OPTIONS } from "@/lib/constants";
import { formatCompactDate } from "@/lib/format";
import { INITIAL_FORM_STATE, cn } from "@/lib/utils";
import { type Exercise, type ExerciseLastPerformanceMap, type WorkoutPayload } from "@/types";

import { SubmitButton } from "./submit-button";

type WorkoutBuilderProps = {
  exercises: Exercise[];
  lastPerformanceMap: ExerciseLastPerformanceMap;
};

type DraftSet = {
  id: string;
  reps: string;
  weight: string;
};

type DraftExercise = {
  exerciseId: string;
  id: string;
  sets: DraftSet[];
};

function createEmptySet(): DraftSet {
  return {
    id: crypto.randomUUID(),
    reps: "",
    weight: "",
  };
}

function createDraftExercise(exerciseId = ""): DraftExercise {
  return {
    id: crypto.randomUUID(),
    exerciseId,
    sets: [createEmptySet()],
  };
}

function toWeightString(weight: number): string {
  return Number.isInteger(weight) ? `${weight}` : weight.toFixed(1);
}

export function WorkoutBuilder({
  exercises,
  lastPerformanceMap,
}: WorkoutBuilderProps) {
  const [state, formAction] = useActionState(saveWorkoutAction, INITIAL_FORM_STATE);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([
    createDraftExercise(),
  ]);

  const selectedExerciseIds = useMemo(
    () =>
      new Set(
        draftExercises
          .map((exercise) => exercise.exerciseId)
          .filter((exerciseId) => exerciseId.length > 0),
      ),
    [draftExercises],
  );

  const serialisedPayload: WorkoutPayload = draftExercises
    .filter((exercise) => exercise.exerciseId)
    .map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: exercise.sets
        .filter((set) => set.weight && set.reps)
        .map((set, index) => ({
          reps: Number.parseInt(set.reps, 10),
          setNumber: index + 1,
          weight: Number.parseFloat(set.weight),
        })),
    }))
    .filter((exercise) => exercise.sets.length > 0);

  const toggleBodyPart = (bodyPart: string) => {
    setSelectedBodyParts((current) =>
      current.includes(bodyPart)
        ? current.filter((value) => value !== bodyPart)
        : [...current, bodyPart],
    );
  };

  const addExercise = () => {
    setDraftExercises((current) => [...current, createDraftExercise()]);
  };

  const removeExercise = (draftExerciseId: string) => {
    setDraftExercises((current) =>
      current.length === 1
        ? [createDraftExercise()]
        : current.filter((exercise) => exercise.id !== draftExerciseId),
    );
  };

  const updateExercise = (draftExerciseId: string, exerciseId: string) => {
    setDraftExercises((current) =>
      current.map((exercise) => {
        if (exercise.id !== draftExerciseId) {
          return exercise;
        }

        const lastPerformance = lastPerformanceMap[exerciseId];
        const prefilledSets =
          lastPerformance?.sets.length
            ? lastPerformance.sets.map((set) => ({
                id: crypto.randomUUID(),
                reps: `${set.reps}`,
                weight: toWeightString(set.weight),
              }))
            : [createEmptySet()];

        return {
          ...exercise,
          exerciseId,
          sets: prefilledSets,
        };
      }),
    );
  };

  const updateSet = (
    draftExerciseId: string,
    draftSetId: string,
    field: "weight" | "reps",
    value: string,
  ) => {
    setDraftExercises((current) =>
      current.map((exercise) => {
        if (exercise.id !== draftExerciseId) {
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.map((set) =>
            set.id === draftSetId ? { ...set, [field]: value } : set,
          ),
        };
      }),
    );
  };

  const addSet = (draftExerciseId: string, nextSet?: { reps: number; weight: number }) => {
    setDraftExercises((current) =>
      current.map((exercise) => {
        if (exercise.id !== draftExerciseId) {
          return exercise;
        }

        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            nextSet
              ? {
                  id: crypto.randomUUID(),
                  reps: `${nextSet.reps}`,
                  weight: toWeightString(nextSet.weight),
                }
              : createEmptySet(),
          ],
        };
      }),
    );
  };

  const removeSet = (draftExerciseId: string, draftSetId: string) => {
    setDraftExercises((current) =>
      current.map((exercise) => {
        if (exercise.id !== draftExerciseId) {
          return exercise;
        }

        if (exercise.sets.length === 1) {
          return {
            ...exercise,
            sets: [createEmptySet()],
          };
        }

        return {
          ...exercise,
          sets: exercise.sets.filter((set) => set.id !== draftSetId),
        };
      }),
    );
  };

  const addSuggestedSet = (
    draftExerciseId: string,
    variant: "repeat" | "weight" | "rep",
  ) => {
    const selectedExercise = draftExercises.find((item) => item.id === draftExerciseId);
    if (!selectedExercise?.exerciseId) {
      return;
    }

    const lastPerformance = lastPerformanceMap[selectedExercise.exerciseId];
    const lastSet = lastPerformance?.sets[lastPerformance.sets.length - 1];

    if (!lastSet) {
      addSet(draftExerciseId);
      return;
    }

    if (variant === "repeat") {
      addSet(draftExerciseId, lastSet);
      return;
    }

    if (variant === "weight") {
      addSet(draftExerciseId, {
        reps: lastSet.reps,
        weight: Number((lastSet.weight + 2.5).toFixed(1)),
      });
      return;
    }

    addSet(draftExerciseId, {
      reps: lastSet.reps + 1,
      weight: lastSet.weight,
    });
  };

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="bodyParts"
        value={JSON.stringify(selectedBodyParts)}
      />
      <input
        type="hidden"
        name="payload"
        value={JSON.stringify(serialisedPayload)}
      />

      <section className="rounded-[1.75rem] border border-line bg-surface p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Body parts
            </h2>
            <p className="mt-1 text-sm text-muted">
              Select every muscle group trained in this session.
            </p>
          </div>
          <p className="text-sm text-muted">{selectedBodyParts.length} selected</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {BODY_PART_OPTIONS.map((bodyPart) => {
            const isSelected = selectedBodyParts.includes(bodyPart);

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
      </section>

      <section className="space-y-4">
        {draftExercises.map((draftExercise, exerciseIndex) => {
          const availableExercises = exercises.filter((exercise) => {
            return (
              exercise.id === draftExercise.exerciseId ||
              !selectedExerciseIds.has(exercise.id)
            );
          });
          const lastPerformance = draftExercise.exerciseId
            ? lastPerformanceMap[draftExercise.exerciseId]
            : undefined;

          return (
            <article
              key={draftExercise.id}
              className="rounded-[1.75rem] border border-line bg-surface p-5 shadow-sm backdrop-blur sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                    Exercise {exerciseIndex + 1}
                  </p>
                  <select
                    value={draftExercise.exerciseId}
                    onChange={(event) =>
                      updateExercise(draftExercise.id, event.target.value)
                    }
                    className="min-w-[220px] rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                  >
                    <option value="">Select exercise</option>
                    {availableExercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name} · {exercise.bodyPart}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeExercise(draftExercise.id)}
                  className="rounded-full border border-line px-4 py-2 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
                >
                  Remove exercise
                </button>
              </div>

              {lastPerformance ? (
                <div className="mt-5 rounded-2xl border border-line bg-white/75 px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Last session
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {formatCompactDate(lastPerformance.workoutDate)} ·{" "}
                        {lastPerformance.sets
                          .map((set) => `${set.weight}kg × ${set.reps}`)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => addSuggestedSet(draftExercise.id, "repeat")}
                        className="rounded-full bg-accent-soft px-3 py-2 text-sm font-medium text-accent transition hover:bg-[rgba(201,107,59,0.18)]"
                      >
                        Repeat last set
                      </button>
                      <button
                        type="button"
                        onClick={() => addSuggestedSet(draftExercise.id, "weight")}
                        className="rounded-full bg-accent-soft px-3 py-2 text-sm font-medium text-accent transition hover:bg-[rgba(201,107,59,0.18)]"
                      >
                        +2.5kg
                      </button>
                      <button
                        type="button"
                        onClick={() => addSuggestedSet(draftExercise.id, "rep")}
                        className="rounded-full bg-accent-soft px-3 py-2 text-sm font-medium text-accent transition hover:bg-[rgba(201,107,59,0.18)]"
                      >
                        +1 rep
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-5 space-y-3">
                {draftExercise.sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className="grid gap-3 rounded-2xl border border-line bg-white/70 p-4 sm:grid-cols-[0.7fr_1fr_1fr_auto]"
                  >
                    <div className="flex items-center text-sm font-medium text-muted">
                      Set {setIndex + 1}
                    </div>
                    <label className="space-y-2">
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                        Weight (kg)
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        min="0"
                        value={set.weight}
                        onChange={(event) =>
                          updateSet(
                            draftExercise.id,
                            set.id,
                            "weight",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                        Reps
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        value={set.reps}
                        onChange={(event) =>
                          updateSet(
                            draftExercise.id,
                            set.id,
                            "reps",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent"
                      />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeSet(draftExercise.id, set.id)}
                        className="w-full rounded-2xl border border-line px-4 py-3 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => addSet(draftExercise.id)}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
                >
                  Add blank set
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {state.error ? (
        <p className="rounded-2xl border border-[rgba(185,28,28,0.14)] bg-[rgba(254,242,242,0.8)] px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={addExercise}
          className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
        >
          Add exercise
        </button>
        <SubmitButton className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong">
          Save workout
        </SubmitButton>
      </div>
    </form>
  );
}
