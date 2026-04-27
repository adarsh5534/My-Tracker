export const BODY_PART_OPTIONS = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "biceps",
  "triceps",
] as const;

export const RECOMMENDATION_ROTATION = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
] as const;

export type BodyPart = (typeof BODY_PART_OPTIONS)[number];
export type RecommendationBodyPart =
  | (typeof RECOMMENDATION_ROTATION)[number]
  | "full body";
