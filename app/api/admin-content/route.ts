import { proxyRequest } from "../_proxy";
export async function GET(request: Request) {
  return proxyRequest(request, "/api/admin-content");
}
export async function POST(request: Request) {
  return proxyRequest(request, "/api/admin-content");
}
