import { type LoggedSet } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatCompactDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatSetsPreview(sets: LoggedSet[]) {
  return sets
    .slice()
    .sort((first, second) => first.setNumber - second.setNumber)
    .map((set) => `${set.weight}kg × ${set.reps}`)
    .join(", ");
}
