import { formatBodyPartList } from "@/lib/utils";
import { type WorkoutRecommendation } from "@/types";

type RecommendationCardProps = {
  recommendation: WorkoutRecommendation;
};

export function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-line bg-[#1e2a24] p-6 text-white shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">
        Recommended next workout
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">
        {formatBodyPartList(recommendation.bodyParts)}
      </h2>
      <p className="mt-4 max-w-md text-sm leading-7 text-white/78">
        {recommendation.message}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {recommendation.bodyParts.map((bodyPart) => (
          <span
            key={bodyPart}
            className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-sm"
          >
            {bodyPart}
          </span>
        ))}
      </div>
    </section>
  );
}
