import { ensureSchema, getSql } from "../../../../lib/database";
import { isUuid } from "../../../../lib/qr-attribution";
import {
  createPrintableQrSvg,
  isQrShape,
  qrPublicUrl,
} from "../../../../lib/qr-image";
import { hasSameOrigin } from "../../../../lib/request-security";
import { createZipArchive } from "../../../../lib/zip-archive";

const MAX_BULK_DOWNLOAD = 100;

function safeFilePart(value: string) {
  const normalized = value
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return normalized.slice(0, 80) || "BuddyLife-QR";
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request))
    return Response.json({ error: "Invalid request origin" }, { status: 403 });

  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids)
      ? [...new Set(body.ids.map(String))]
      : [];
    if (!ids.length)
      return Response.json(
        { error: "Select at least one QR" },
        { status: 400 },
      );
    if (ids.length > MAX_BULK_DOWNLOAD)
      return Response.json(
        { error: `Select no more than ${MAX_BULK_DOWNLOAD} QRs` },
        { status: 400 },
      );
    if (ids.some((id) => !isUuid(id)))
      return Response.json(
        { error: "One or more QR identities are invalid" },
        { status: 400 },
      );

    await ensureSchema();
    const rows = await getSql()`
      SELECT id, serial, public_token AS "publicToken", display_name AS "displayName",
             visualization_shape AS "visualizationShape"
      FROM qr_codes
      ORDER BY created_at DESC, serial ASC
    `;
    const selected = new Set(ids);
    const codes = rows.filter((row) => selected.has(row.id));
    if (codes.length !== ids.length)
      return Response.json(
        { error: "One or more selected QRs were not found" },
        { status: 404 },
      );

    const byId = new Map(codes.map((code) => [code.id, code]));
    const entries = await Promise.all(
      ids.map(async (id) => {
        const code = byId.get(id)!;
        const shape = isQrShape(code.visualizationShape)
          ? code.visualizationShape
          : "rectangle";
        const svg = await createPrintableQrSvg(
          qrPublicUrl(request.url, code.publicToken),
          shape,
          code.serial,
        );
        return {
          name: `${safeFilePart(code.displayName)}__${safeFilePart(code.serial)}.svg`,
          content: svg,
        };
      }),
    );
    const archive = createZipArchive(entries);
    const bodyBytes = archive.buffer.slice(
      archive.byteOffset,
      archive.byteOffset + archive.byteLength,
    );

    return new Response(bodyBytes, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="BuddyLife-designed-QRs-${entries.length}.zip"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "Selected QR designs could not be prepared" },
      { status: 503 },
    );
  }
}
