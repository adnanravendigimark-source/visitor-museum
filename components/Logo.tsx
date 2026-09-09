import Link from "next/link";
import Image from "next/image";

export default function Logo({
  logoImage = "",
  logoAlt = "Visit Museums",
  theme = "light",
  className = "",
}: {
  logoImage?: string;
  logoAlt?: string;
  line1?: string;
  line2?: string;
  theme?: "light" | "dark";
  className?: string;
}) {
  const isDark = theme === "dark";
  const customSrc = logoImage?.trim();

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      {customSrc ? (
        <span className="relative block h-10 w-44 sm:h-12 sm:w-52 shrink-0 transition-opacity hover:opacity-90">
          <Image
            src={customSrc}
            alt={logoAlt}
            fill
            sizes="(max-width: 640px) 176px, 208px"
            className={`object-contain object-left ${isDark ? "brightness-0 invert" : ""}`}
            priority
          />
        </span>
      ) : (
        <div className="flex items-center gap-2.5 group">
          {/* Classical Temple Pediment Icon */}
          <span className="flex items-center justify-center text-[#184E3A] transition-transform group-hover:scale-105">
            <svg
              className="w-8 h-8 sm:w-9 sm:h-9"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {/* Pediment Roof */}
              <path d="M12 2L2 6.5V8H22V6.5L12 2Z" />
              {/* Architrave */}
              <rect x="2.5" y="8" width="19" height="1.5" rx="0.3" />
              {/* Columns */}
              <rect x="4" y="10.5" width="2.2" height="9" rx="0.4" />
              <rect x="8.8" y="10.5" width="2.2" height="9" rx="0.4" />
              <rect x="13.2" y="10.5" width="2.2" height="9" rx="0.4" />
              <rect x="17.8" y="10.5" width="2.2" height="9" rx="0.4" />
              {/* Base */}
              <rect x="2" y="20" width="20" height="1.8" rx="0.4" />
            </svg>
          </span>

          {/* Brand Name Typography */}
          <div className="flex flex-col leading-[1.05]">
            <span
              className={`font-serif text-[19px] sm:text-[21px] font-bold tracking-tight ${
                isDark ? "text-white" : "text-[#184E3A]"
              }`}
            >
              Visit
            </span>
            <span
              className={`font-serif text-[19px] sm:text-[21px] font-bold tracking-tight ${
                isDark ? "text-[#E2A03F]" : "text-[#9E2B25]"
              }`}
            >
              Museums
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}
