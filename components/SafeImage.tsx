"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

const FALLBACK_IMAGE =
  "/images/museums-hero.jpg";

export default function SafeImage({
  src,
  alt,
  fallbackSrc = FALLBACK_IMAGE,
  ...props
}: ImageProps & { fallbackSrc?: string }) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

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
