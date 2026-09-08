import RecommendedTour from "./RecommendedTour";

export default function BlogPostBody({
  content,
  recommendedTourId,
  showRecommendedTour,
  recommendedLabel,
}: {
  content: string;
  recommendedTourId: string;
  showRecommendedTour?: boolean;
  recommendedLabel?: string;
}) {
  return (
    <div className="mt-8 text-[17px] leading-relaxed text-stone-900/80">
      <div className="rich-content max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      {showRecommendedTour && (
        <div className="mt-5">
          <RecommendedTour tourId={recommendedTourId} recommendedLabel={recommendedLabel} />
        </div>
      )}
    </div>
  );
}
