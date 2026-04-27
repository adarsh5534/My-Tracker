import { type BodyPart } from "@/lib/constants";

export type FormState = {
  error: string | null;
};

export const INITIAL_FORM_STATE: FormState = {
  error: null,
};

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export function formatBodyPartList(bodyParts: string[]) {
  return bodyParts
    .map((bodyPart) => bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1))
    .join(" • ");
}

export function isBodyPart(value: string): value is BodyPart {
  return [
    "chest",
    "back",
    "legs",
    "shoulders",
    "biceps",
    "triceps",
  ].includes(value);
}
