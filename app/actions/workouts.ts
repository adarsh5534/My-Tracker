"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { type BodyPart } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type FormState, getFormString } from "@/lib/utils";
import { type WorkoutPayload } from "@/types";

function parseJsonField<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function isValidWorkoutPayload(payload: WorkoutPayload): boolean {
  return payload.length > 0 && payload.every((exercise) => {
    return (
      Boolean(exercise.exerciseId) &&
      exercise.sets.length > 0 &&
      exercise.sets.every((set, index) => {
        return (
          set.setNumber === index + 1 &&
          Number.isFinite(set.weight) &&
          set.weight >= 0 &&
          Number.isInteger(set.reps) &&
          set.reps > 0
        );
      })
    );
  });
}

export async function saveWorkoutAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();

  const bodyParts = parseJsonField<BodyPart[]>(
    getFormString(formData, "bodyParts"),
    [],
  );
  const payload = parseJsonField<WorkoutPayload>(
    getFormString(formData, "payload"),
    [],
  );

  if (bodyParts.length === 0) {
    return { error: "Pick at least one body part for this workout." };
  }

  if (!isValidWorkoutPayload(payload)) {
    return {
      error:
        "Add at least one exercise with valid sets before saving the workout.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_workout_with_sets", {
    p_body_parts: bodyParts,
    p_payload: payload,
    p_workout_date: new Date().toISOString(),
  });

  if (error || !data) {
    return {
      error: error?.message ?? "Unable to save workout. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/workout/new");

  redirect("/history");
}
