import { ImageResponse } from "next/og";

export const runtime = "edge";

// Dynamic Open Graph image (1200x630 PNG) so WhatsApp/Facebook/Twitter render a
// real preview when a link is shared. SVG OG images don't render on those
// scrapers; this returns a proper raster. Pages can pass ?title= & ?subtitle=.
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "Habla inglés de verdad").slice(
    0,
    90
  );
  const subtitle = (
    searchParams.get("subtitle") ||
    "Club de conversación en Tehuacán · grupos pequeños · instructor estadounidense"
  ).slice(0, 120);

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(135deg, #0a0f1e 0%, #0f1729 55%, #1a2a50 100%)",
        padding: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 26,
            fontWeight: 800,
          }}
        >
          T
        </div>
        <div style={{ color: "white", fontSize: 26, fontWeight: 700 }}>
          Tu Tutor{" "}
          <span style={{ color: "#60a5fa", fontWeight: 400 }}>de Inglés</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            color: "white",
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#93a4c8",
            fontSize: 34,
            marginTop: 24,
            maxWidth: 960,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(96,165,250,0.35)",
            color: "#93c5fd",
            fontSize: 24,
            fontWeight: 600,
            padding: "10px 22px",
            borderRadius: 999,
          }}
        >
          Primera clase gratis
        </div>
        <div style={{ color: "#5b6b8c", fontSize: 24 }}>
          tututordeingles.online
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
