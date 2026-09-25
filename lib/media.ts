export const MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
export const MAX_MEDIA_BYTES = 4 * 1024 * 1024;

export type MediaRecord = {
  id: string;
  fileName: string;
  contentType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  altText: string;
  createdAt: string;
  url: string;
};

export function mediaUrl(id: string) {
  return `/media/${id}`;
}

export function validateMediaUpload(file: { type: string; size: number; name: string }) {
  if (!MEDIA_TYPES[file.type]) return "Upload a JPEG, PNG, WebP or GIF image";
  if (file.size <= 0) return "The selected file is empty";
  if (file.size > MAX_MEDIA_BYTES) return `Images must be ${MAX_MEDIA_BYTES / 1024 / 1024} MB or smaller`;
  return null;
}

export function safeFileName(name: string, contentType: string) {
  const extension = MEDIA_TYPES[contentType] || "bin";
  const base = name
    .replace(/\.[A-Za-z0-9]+$/, "")
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "image"}.${extension}`;
}

/** Reads pixel dimensions from PNG, GIF, JPEG and WebP headers without decoding the image. */
export function imageDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (start: number, length: number) => String.fromCharCode(...bytes.subarray(start, start + length));
  if (bytes.length >= 24 && ascii(1, 3) === "PNG") return { width: view.getUint32(16), height: view.getUint32(20) };
  if (bytes.length >= 10 && ascii(0, 3) === "GIF") return { width: view.getUint16(6, true), height: view.getUint16(8, true) };
  if (bytes.length >= 30 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    const chunk = ascii(12, 4);
    if (chunk === "VP8X") return { width: 1 + (view.getUint32(24, true) & 0xffffff), height: 1 + (view.getUint32(27, true) & 0xffffff) };
    if (chunk === "VP8L") { const bits = view.getUint32(21, true); return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) }; }
    if (chunk === "VP8 ") return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { offset += 2; continue; }
      const length = view.getUint16(offset + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
      }
      offset += 2 + length;
    }
  }
  return null;
}
