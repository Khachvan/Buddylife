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
      // The legacy Sites API protects CMS data with the original owner identity
      // in addition to the service bypass token. This proxy is itself guarded by
      // the BuddyLife backoffice session in proxy.ts.
      "oai-authenticated-user-id": "buddylife-backoffice",
      "oai-authenticated-user-email": "khachvantsyan@gmail.com",
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
