import Link from "next/link";
import Image from "next/image";

export default function Logo({
  logoImage,
  logoAlt = "Visit Museums",
  line1 = "VISIT",
  line2 = "— MUSEUMS —",
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
    <Link href="/" className={`group inline-flex items-center gap-3 ${className}`}>
      {customSrc ? (
        <span className="relative block h-10 w-10 sm:h-11 sm:w-11 shrink-0 transition-transform duration-300 group-hover:scale-105">
          <Image
            src={customSrc}
            alt={logoAlt}
            fill
            sizes="44px"
            className="object-contain"
          />
        </span>
      ) : (
        <span className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105">
          {/* Architectural Line-art Dome Icon */}
          <svg
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`h-full w-full ${isDark ? "text-white" : "text-[#112338]"}`}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Museum steps + base */}
            <line x1="4" y1="38" x2="40" y2="38" strokeWidth="1.75" />
            <line x1="6" y1="35" x2="38" y2="35" strokeWidth="1.25" />
            <line x1="8" y1="32" x2="36" y2="32" strokeWidth="1.75" />

            {/* Columns */}
            <line x1="11" y1="18" x2="11" y2="32" />
            <line x1="17" y1="18" x2="17" y2="32" />
            <line x1="22" y1="18" x2="22" y2="32" />
            <line x1="27" y1="18" x2="27" y2="32" />
            <line x1="33" y1="18" x2="33" y2="32" />

            {/* Entablature */}
            <line x1="8" y1="18" x2="36" y2="18" strokeWidth="1.75" />

            {/* Pediment (triangular roof) */}
            <path d="M6 18 22 6 38 18" strokeWidth="1.75" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      <div className="flex flex-col leading-none">
        <span
          className={`font-serif tracking-[0.14em] text-lg sm:text-xl font-bold uppercase transition-colors ${
            isDark ? "text-white group-hover:text-gray-200" : "text-[#112338] group-hover:text-[#1e3a5f]"
          }`}
        >
          {line1}
        </span>
        <span
          className={`text-[8.5px] sm:text-[9.5px] font-medium tracking-[0.2em] uppercase mt-1 ${
            isDark ? "text-gray-300" : "text-[#3b4c60]"
          }`}
        >
          {line2}
        </span>
      </div>
    </Link>
  );
}
