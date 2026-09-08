"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=900&auto=format&fit=crop";

export default function SafeImage({
  src,
  alt,
  fallbackSrc = FALLBACK_IMAGE,
  ...props
}: ImageProps & { fallbackSrc?: string }) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      {...props}
      src={hasError ? fallbackSrc : imgSrc || fallbackSrc}
      alt={alt}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
