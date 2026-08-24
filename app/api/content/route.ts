import { ensureSchema, getSql } from "../../../lib/database";

export async function GET() {
  try {
    await ensureSchema();
    const rows = await getSql()`SELECT key, value FROM cms_content`;
    return Response.json({ content: Object.fromEntries(rows.map((row) => [row.key, row.value])) });
  } catch (error) {
    console.error("CMS content read failed", error);
    return Response.json({ content: {} });
  }
}
