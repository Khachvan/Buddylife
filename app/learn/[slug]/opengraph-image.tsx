import { ImageResponse } from "next/og";

export const alt = "BuddyLife Armenia educational guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
  "everyday-pet-parent-problems": {
    title: "5 առօրյա խնդիր, որոնց բախվում են կենդանատերերը Հայաստանում",
    label: "ԿԱԶՄԱԿԵՐՊՎԱԾ ԽՆԱՄՔ",
  },
  "organize-pet-information-and-care-dates": {
    title: "Ինչպես կազմակերպել կենդանուդ կարևոր տեղեկություններն ու ամսաթվերը",
    label: "ԿԱԶՄԱԿԵՐՊՎԱԾ ԽՆԱՄՔ",
  },
  "weekly-pet-care-organization-routine": {
    title: "Շաբաթական 10 րոպե՝ կենդանուդ խնամքը կազմակերպելու համար",
    label: "ՇԱԲԱԹԱԿԱՆ ՍՏՈՒԳԱԹԵՐԹ",
  },
  "pet-care-handover-note": {
    title: "Երբ կենդանուդ խնամքը վստահում ես մեկ ուրիշին",
    label: "ՓՈԽԱՆՑՄԱՆ ՀՈՒՇԱԹԵՐԹ",
  },
  "first-week-pet-information-starter-kit": {
    title: "Կենդանուդ առաջին շաբաթվա կարևոր տեղեկությունների փաթեթը",
    label: "ԱՌԱՋԻՆ ՇԱԲԱԹՎԱ ՈՒՂԵՑՈՒՅՑ",
  },
  "five-minute-pet-admin-reset": {
    title: "5 րոպե՝ խնամքի գրառումները վերադասավորելու համար",
    label: "5-ՐՈՊԵԱՆՈՑ ՎԵՐԱԴԱՍԱՎՈՐՈՒՄ",
  },
  "help-pet-when-guests-visit": {
    title: "Ինչպես օգնել կենդանուն, երբ տանը հյուրեր կան",
    label: "ՎԱՐՔ ԵՎ ՀԱՆԳՍՏՈՒԹՅՈՒՆ",
  },
  "moving-home-with-a-pet": {
    title: "Տեղափոխություն կենդանու հետ․ ինչպես պատրաստել ավելի հանգիստ առաջին օրը",
    label: "ԱՌՕՐՅԱ ԽՆԱՄՔ",
  },
  "help-pet-adjust-to-changed-daily-routine": {
    title: "Ինչպես օգնել կենդանուն հարմարվել փոխված օրվա ռեժիմին",
    label: "ԱՌՕՐՅԱ ԽՆԱՄՔ",
  },
};

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articleTitles[slug] || articleTitles["preventive-care"];
  const [regularFont, boldFont] = await Promise.all([
    fetch("https://buddylife.am/fonts/NotoSansArmenian-Regular.ttf").then(
      (response) => response.arrayBuffer(),
    ),
    fetch("https://buddylife.am/fonts/NotoSansArmenian-Bold.ttf").then(
      (response) => response.arrayBuffer(),
    ),
  ]);
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
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#7246a7" }}>BuddyLife</div>
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
        { name: "Noto Sans Armenian", data: regularFont, style: "normal", weight: 400 },
        { name: "Noto Sans Armenian", data: boldFont, style: "normal", weight: 700 },
      ],
    },
  );
}
