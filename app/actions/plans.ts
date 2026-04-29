"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type FormState, getFormString } from "@/lib/utils";
import { type WorkoutPlanDraft } from "@/types";

function parseJsonField<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function isValidPlanDraft(draft: WorkoutPlanDraft) {
  return (
    draft.name.trim().length > 0 &&
    draft.bodyParts.length > 0 &&
    draft.exercises.length > 0 &&
    draft.exercises.every(
      (exercise) =>
        exercise.name.trim().length > 0 && exercise.bodyPart.trim().length > 0,
    )
  );
}

export async function createWorkoutPlanAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const draft = parseJsonField<WorkoutPlanDraft>(
    getFormString(formData, "planDraft"),
    { bodyParts: [], exercises: [], name: "" },
  );

  if (!isValidPlanDraft(draft)) {
    return {
      error: "Add a plan name, body parts, and at least one exercise.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: plan, error: planError } = await supabase
    .from("workout_plans")
    .insert({
      body_parts: draft.bodyParts,
      name: draft.name.trim(),
      user_id: user.id,
    })
    .select("id")
    .single();

  if (planError || !plan) {
    return {
      error: planError?.message ?? "Unable to create the workout plan.",
    };
  }

  for (const [index, exerciseDraft] of draft.exercises.entries()) {
    const exerciseName = exerciseDraft.name.trim();

    const { data: existingExercise } = await supabase
      .from("exercises")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", exerciseName)
      .maybeSingle();

    let exerciseId = existingExercise?.id;

    if (!exerciseId) {
      const { data: insertedExercise, error: insertExerciseError } = await supabase
        .from("exercises")
        .insert({
          body_part: exerciseDraft.bodyPart,
          name: exerciseName,
          user_id: user.id,
        })
        .select("id")
        .single();

      if (insertExerciseError || !insertedExercise) {
        return {
          error:
            insertExerciseError?.message ??
            `Unable to save exercise "${exerciseName}".`,
        };
      }

      exerciseId = insertedExercise.id;
    }

    const { error: linkError } = await supabase
      .from("workout_plan_exercises")
      .insert({
        exercise_id: exerciseId,
        plan_id: plan.id,
        position: index + 1,
      });

    if (linkError) {
      return { error: linkError.message };
    }
  }

  revalidatePath("/plans");
  revalidatePath("/workout/new");

  return { error: null };
}
