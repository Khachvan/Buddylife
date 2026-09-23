import { ensureSchema, getSql } from "../../../../../lib/database";
import { isUuid } from "../../../../../lib/qr-attribution";
import {
  createPrintableQrSvg,
  isQrShape,
  qrPublicUrl,
} from "../../../../../lib/qr-image";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isUuid(id))
    return Response.json({ error: "Invalid QR identity" }, { status: 400 });

  try {
    await ensureSchema();
    const rows = await getSql()`
      SELECT serial, public_token AS "publicToken", display_name AS "displayName",
             visualization_shape AS "visualizationShape"
      FROM qr_codes WHERE id = ${id} LIMIT 1
    `;
    const code = rows[0];
    if (!code) return Response.json({ error: "QR not found" }, { status: 404 });

    const publicUrl = qrPublicUrl(request.url, code.publicToken);
    const shape = isQrShape(code.visualizationShape)
      ? code.visualizationShape
      : "rectangle";
    const svg = await createPrintableQrSvg(publicUrl, shape, code.serial);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${code.displayName.replace(/[^A-Za-z0-9._-]+/g, "-").slice(0, 60) || "BuddyLife-QR"}__${code.serial}.svg"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "QR image could not be generated" },
      { status: 503 },
    );
  }
}
