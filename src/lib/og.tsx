import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Générateur d'images Open Graph aux couleurs de BRUME : la composition du
 * hero (mot-marque géant derrière le portrait) + le titre de la page.
 */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const dir = join(process.cwd(), "src/assets");
const assets = Promise.all([
  readFile(join(dir, "fonts/Manrope-wght-300.ttf")),
  readFile(join(dir, "fonts/Manrope-wght-500.ttf")),
  readFile(join(dir, "fonts/Gloock.ttf")),
  readFile(join(dir, "og-portrait.png"), "base64"),
]);

export async function renderOg({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  const [light, medium, gloock, portrait] = await assets;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F1EFEC", padding: 24, fontFamily: "Manrope" }}>
        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: "100%",
            borderRadius: 40,
            background: "#FFFFFF",
            overflow: "hidden",
            color: "#221B1D",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 30,
              top: 190,
              fontSize: 300,
              fontWeight: 300,
              letterSpacing: -18,
              lineHeight: 1,
              display: "flex",
            }}
          >
            BRUME
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/png;base64,${portrait}`} width={394} height={560} style={{ position: "absolute", right: 210, bottom: -2 }} alt="" />
          <div style={{ position: "absolute", left: 48, top: 40, display: "flex", gap: 12 }}>
            {["Balaruc-les-Bains", eyebrow].map((p) => (
              <div key={p} style={{ display: "flex", border: "1.5px solid rgba(34,27,29,.45)", borderRadius: 999, padding: "10px 22px", fontSize: 22, fontWeight: 500 }}>
                {p}
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              left: 48,
              bottom: 44,
              width: 560,
              display: "flex",
              flexDirection: "column",
              background: "rgba(255,253,250,.92)",
              borderRadius: 28,
              padding: "26px 30px",
              boxShadow: "0 20px 50px -20px rgba(34,27,29,.35)",
            }}
          >
            <div style={{ fontFamily: "Gloock", fontSize: 46, lineHeight: 1.05 }}>{title}</div>
            {detail ? <div style={{ marginTop: 12, fontSize: 24, color: "#5F5457" }}>{detail}</div> : null}
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Manrope", data: light, weight: 300, style: "normal" },
        { name: "Manrope", data: medium, weight: 500, style: "normal" },
        { name: "Gloock", data: gloock, weight: 400, style: "normal" },
      ],
    },
  );
}
