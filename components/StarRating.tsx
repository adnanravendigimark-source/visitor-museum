export default function StarRating({
  rating,
  maxStars = 5,
  size = "sm",
  showValue = false,
  reviewCount,
  className = "",
  starClassName = "",
  theme = "light",
}: {
  rating: number;
  maxStars?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number | string;
  className?: string;
  starClassName?: string;
  theme?: "light" | "dark";
}) {
  const sizeMap = {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const starSize = sizeMap[size] || sizeMap.sm;
  const isDark = theme === "dark";

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* 5-star row with fractional fill */}
      <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of ${maxStars} stars`}>
        {Array.from({ length: maxStars }).map((_, i) => {
          const fillPercent = Math.min(100, Math.max(0, (rating - i) * 100));

          return (
            <div key={i} className={`relative ${starSize} shrink-0`}>
              {/* Empty background star */}
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`absolute inset-0 ${starSize} ${
                  isDark ? "text-white/25" : "text-stone-200"
                } ${starClassName}`}
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>

              {/* Fractional filled star overlay */}
              {fillPercent > 0 && (
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${fillPercent}%` }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`${starSize} shrink-0 text-amber-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] ${starClassName}`}
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Numeric value */}
      {showValue && (
        <span className={`text-xs font-bold ${isDark ? "text-white" : "text-stone-900"}`}>
          {rating.toFixed(1)}
        </span>
      )}

      {/* Reviews count */}
      {reviewCount !== undefined && reviewCount !== null && (
        <span className={`text-xs ${isDark ? "text-stone-300" : "text-stone-500"}`}>
          {typeof reviewCount === "number" ? `(${reviewCount.toLocaleString()})` : reviewCount}
        </span>
      )}
    </div>
  );
}
