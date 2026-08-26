import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "BuddyLife Armenia educational guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const armenianFont = readFile(path.join(process.cwd(), "public/fonts/NotoSansArmenian.ttf"));

const articleTitles: Record<string, { title: string; label: string }> = {
  "preventive-care": {
    title: "Կանխարգելիչ խնամք․ ինչ հիշել տարվա ընթացքում",
    label: "ԽՆԱՄՔԻ ՈՒՂԵՑՈՒՅՑ",
  },
  "summer-safety": {
    title: "Շոգ եղանակին անվտանգ զբոսանքի պարզ կանոններ",
    label: "ԱՆՎՏԱՆԳՈՒԹՅԱՆ ՈՒՂԵՑՈՒՅՑ",
  },
  "indoor-cat-enrichment": {
    title: "Ինչպես տունը դարձնել հետաքրքիր և անվտանգ կատվի համար",
    label: "ԿԱՏՎԻ ԲԱՐԵԿԵՑՈՒԹՅՈՒՆ",
  },
};

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articleTitles[slug] || articleTitles["preventive-care"];
  const fontData = await armenianFont;
  const fontArrayBuffer = fontData.buffer.slice(
    fontData.byteOffset,
    fontData.byteOffset + fontData.byteLength,
  ) as ArrayBuffer;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        padding: "62px 68px",
        color: "#2d163f",
        background: "linear-gradient(135deg, #f8f3fb 0%, #efe5f8 54%, #fceaf3 100%)",
        fontFamily: "Noto Sans Armenian",
      }}
    >
      <div style={{ position: "absolute", width: 420, height: 420, borderRadius: 999, right: -95, top: -130, background: "linear-gradient(135deg, #7246a7, #d5458d)", opacity: 0.18 }} />
      <div style={{ position: "absolute", width: 260, height: 260, borderRadius: 999, right: 120, bottom: -130, background: "#f0b64d", opacity: 0.2 }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 17 }}>
          <img src="https://buddylife.am/buddylife-logo-clean.png" alt="BuddyLife Armenia" width="176" height="74" style={{ objectFit: "contain" }} />
          <div style={{ display: "flex", padding: "9px 17px", borderRadius: 999, background: "#ffffffcc", color: "#7246a7", fontSize: 19, fontWeight: 800, letterSpacing: 1 }}>{article.label}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 930 }}>
          <div style={{ display: "flex", fontSize: 55, lineHeight: 1.12, fontWeight: 800, letterSpacing: -1.5 }}>{article.title}</div>
          <div style={{ display: "flex", fontSize: 24, color: "#765e83" }}>Վստահելի գիտելիք կենդանու ավելի կազմակերպված խնամքի համար։</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#7246a7", fontSize: 21, fontWeight: 700 }}>
          <span>buddylife.am/learn</span>
          <span>Հայերեն • Armenia</span>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Noto Sans Armenian", data: fontArrayBuffer, style: "normal", weight: 400 },
        { name: "Noto Sans Armenian", data: fontArrayBuffer, style: "normal", weight: 700 },
      ],
    },
  );
}
