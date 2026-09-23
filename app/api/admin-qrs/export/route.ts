import { ensureSchema, getSql } from "../../../../lib/database";
import { qrPublicUrl } from "../../../../lib/qr-image";

function csvValue(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  try {
    await ensureSchema();
    const rows = await getSql()`
      SELECT
        c.serial, c.public_token AS "publicToken", c.display_name AS "displayName", c.status,
        c.design_version AS "designVersion", c.batch_code AS "batchCode",
        c.visualization_shape AS "visualizationShape",
        a.label_snapshot AS "venueName", a.location_label_snapshot AS "locationLabel",
        p.address, p.city, p.province
      FROM qr_codes c
      LEFT JOIN qr_assignments a ON a.qr_code_id = c.id AND a.ended_at IS NULL
      LEFT JOIN qr_placements p ON p.id = a.placement_id
      ORDER BY c.serial
    `;
    const headers = [
      "serial",
      "publicUrl",
      "displayName",
      "status",
      "venueName",
      "locationLabel",
      "address",
      "city",
      "province",
      "visualizationShape",
      "designVersion",
      "batchCode",
    ];
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        [
          row.serial,
          qrPublicUrl(request.url, row.publicToken),
          row.displayName,
          row.status,
          row.venueName,
          row.locationLabel,
          row.address,
          row.city,
          row.province,
          row.visualizationShape,
          row.designVersion,
          row.batchCode,
        ]
          .map(csvValue)
          .join(","),
      ),
    ].join("\n");
    return new Response(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          "attachment; filename=BuddyLife_QR_Inventory.csv",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "QR manifest could not be exported" },
      { status: 503 },
    );
  }
}
