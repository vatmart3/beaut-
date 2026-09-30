import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#221B1D" }}>
        <svg width="110" height="110" viewBox="0 0 64 64">
          <path d="M32 8c8.5 10.6 14.2 19.5 14.2 26.8a14.2 14.2 0 1 1-28.4 0C17.8 27.5 23.5 18.6 32 8Z" fill="#F8F5F2" />
          <path d="M25.3 37.5c.7 3 2.7 5.2 5.8 5.8" stroke="#D4A78F" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    ),
    size,
  );
}
