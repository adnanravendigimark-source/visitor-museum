import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1F2937 0%, #0F1419 100%)",
          borderRadius: "16px",
          border: "2px solid #B08D57",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
          <path d="M6 34C6 24 14 16 24 16C34 16 42 24 42 34" stroke="#E9D9B8" strokeWidth="3" strokeLinecap="round" />
          <path d="M12 34V26C12 24.5 13.5 23 15 23C16.5 23 18 24.5 18 26V34" stroke="#F4EFE4" strokeWidth="2.5" />
          <path d="M21 34V24C21 22.5 22.5 21 24 21C25.5 21 27 22.5 27 24V34" stroke="#F4EFE4" strokeWidth="2.5" />
          <path d="M30 34V26C30 24.5 31.5 23 33 23C34.5 23 36 24.5 36 26V34" stroke="#F4EFE4" strokeWidth="2.5" />
          <path d="M4 36H44" stroke="#B08D57" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
