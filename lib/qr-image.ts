import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";

export const QR_SHAPES = ["rectangle", "circle", "paw"] as const;
export type QrShape = (typeof QR_SHAPES)[number];

type QrArtwork = {
  fileName: string;
  width: number;
  height: number;
  qr: { x: number; y: number; width: number; height: number };
};

const QR_ARTWORK: Record<QrShape, QrArtwork> = {
  rectangle: {
    fileName: "qr-design-rectangle.png",
    width: 1024,
    height: 1536,
    qr: { x: 174, y: 780, width: 676, height: 682 },
  },
  circle: {
    fileName: "qr-design-circle.png",
    width: 1254,
    height: 1254,
    qr: { x: 482, y: 777, width: 298, height: 299 },
  },
  paw: {
    fileName: "qr-design-paw.png",
    width: 1254,
    height: 1254,
    qr: { x: 486, y: 810, width: 276, height: 276 },
  },
};

const artworkCache = new Map<string, Promise<string>>();
const PRODUCTION_PUBLIC_ORIGIN = "https://buddylife.am";

function artworkDataUri(fileName: string) {
  const cached = artworkCache.get(fileName);
  if (cached) return cached;

  const encoded = readFile(path.join(process.cwd(), "public", fileName)).then(
    (contents) => `data:image/png;base64,${contents.toString("base64")}`,
  );
  artworkCache.set(fileName, encoded);
  return encoded;
}

export function isQrShape(value: unknown): value is QrShape {
  return typeof value === "string" && QR_SHAPES.includes(value as QrShape);
}

export function qrPublicUrl(requestUrl: string, token: string) {
  const configured = process.env.QR_PUBLIC_BASE_URL?.trim();
  const requestOrigin = new URL(requestUrl).origin;
  const base =
    process.env.VERCEL_ENV === "production"
      ? PRODUCTION_PUBLIC_ORIGIN
      : configured || requestOrigin;
  return new URL(`/q/${token}`, `${base.replace(/\/$/, "")}/`).toString();
}

function escapeXml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character] || character,
  );
}

export async function createPrintableQrSvg(
  publicUrl: string,
  shape: QrShape,
  serial: string,
) {
  const artwork = QR_ARTWORK[shape];
  const [background, qr] = await Promise.all([
    artworkDataUri(artwork.fileName),
    QRCode.toString(publicUrl, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 4,
      color: { dark: "#000000", light: "#ffffff" },
    }),
  ]);
  const qrViewBox = qr.match(/viewBox="([^"]+)"/)?.[1] || "0 0 100 100";
  const qrContent = qr.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const safeSerial = escapeXml(serial);
  const safeUrl = escapeXml(publicUrl);
  const { x, y, width, height } = artwork.qr;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${artwork.width}" height="${artwork.height}" viewBox="0 0 ${artwork.width} ${artwork.height}" role="img" aria-label="${safeSerial} BuddyLife QR sticker">
<image width="${artwork.width}" height="${artwork.height}" href="${background}" xlink:href="${background}" preserveAspectRatio="none"/>
<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${qrViewBox}" shape-rendering="crispEdges">${qrContent}</svg>
<metadata data-qr-url="${safeUrl}" data-error-correction="H" data-quiet-zone-modules="4" data-visualization-shape="${shape}" data-design-source="BuddyLife approved artwork"/>
</svg>`;
}
