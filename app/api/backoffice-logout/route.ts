import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const jar = await cookies(); jar.delete("buddylife_backoffice");
  return NextResponse.redirect(new URL("/backoffice", request.url));
}
