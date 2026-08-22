const upstream = "https://buddylife-armenia.khachvantsyan.chatgpt.site";

export async function proxyRequest(request: Request, path: string) {
  const authorization = process.env.SITES_BYPASS_TOKEN;
  if (!authorization)
    return Response.json(
      { error: "Service is not configured" },
      { status: 503 },
    );
  const init: RequestInit = {
    method: request.method,
    headers: {
      "content-type": request.headers.get("content-type") || "application/json",
      "OAI-Sites-Authorization": `Bearer ${authorization}`,
    },
    cache: "no-store",
  };
  if (request.method !== "GET" && request.method !== "HEAD")
    init.body = await request.text();
  const response = await fetch(`${upstream}${path}`, init);
  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") || "application/json",
    },
  });
}
