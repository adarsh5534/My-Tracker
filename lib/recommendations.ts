import {
  RECOMMENDATION_ROTATION,
  type RecommendationBodyPart,
} from "@/lib/constants";
import { type WorkoutRecord, type WorkoutRecommendation } from "@/types";

function normaliseBodyPart(bodyPart: string): RecommendationBodyPart {
  if (bodyPart === "biceps" || bodyPart === "triceps") {
    return "arms";
  }

  if (
    bodyPart === "chest" ||
    bodyPart === "back" ||
    bodyPart === "legs" ||
    bodyPart === "shoulders" ||
    bodyPart === "arms"
  ) {
    return bodyPart as RecommendationBodyPart;
  }

  return "full body";
}

function hoursSince(dateIso: string) {
  const diffMs = Date.now() - new Date(dateIso).getTime();

  return diffMs / (1000 * 60 * 60);
}

function bodyPartsForRecommendation(
  group: RecommendationBodyPart,
): string[] {
  if (group === "arms") {
    return ["biceps", "triceps"];
  }

  if (group === "full body") {
    return ["chest", "back", "legs", "shoulders", "biceps", "triceps"];
  }

  return [group];
}

export function getRecommendedWorkout(
  lastWorkout: WorkoutRecord | null,
): WorkoutRecommendation {
  if (!lastWorkout) {
    return {
      bodyParts: ["chest"],
      message:
        "Start with chest today. Once you log the first workout, LiftLog will rotate suggestions based on your actual sessions.",
    };
  }

  const elapsedHours = hoursSince(lastWorkout.date);

  if (elapsedHours > 96) {
    return {
      bodyParts: bodyPartsForRecommendation("full body"),
      message:
        "It has been more than four days since the last session, so a full-body workout is the best reset before returning to a split.",
    };
  }

  const recentGroups = new Set(lastWorkout.body_parts.map(normaliseBodyPart));
  const lastPrimaryGroup = normaliseBodyPart(lastWorkout.body_parts[0] ?? "chest");
  const startingIndex = Math.max(
    RECOMMENDATION_ROTATION.indexOf(
      lastPrimaryGroup === "full body" ? "chest" : lastPrimaryGroup,
    ),
    0,
  );

  for (let offset = 1; offset <= RECOMMENDATION_ROTATION.length; offset += 1) {
    const candidate =
      RECOMMENDATION_ROTATION[
        (startingIndex + offset) % RECOMMENDATION_ROTATION.length
      ];

    if (elapsedHours < 48 && recentGroups.has(candidate)) {
      continue;
    }

    return {
      bodyParts: bodyPartsForRecommendation(candidate),
      message:
        elapsedHours < 48
          ? `Your last workout was within 48 hours, so LiftLog is steering you away from the same muscle group and onto ${candidate}.`
          : `You have recovered enough to keep the rotation moving, so ${candidate} is next up.`,
    };
  }

  return {
    bodyParts: ["legs"],
    message:
      "Everything in the usual rotation was recently touched, so legs are a safe fallback for the next session.",
  };
}
