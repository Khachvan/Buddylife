import { createHash, timingSafeEqual } from "node:crypto";

const USER_HASH = "73c167ea0a0ad95d9e6ced0e9aea244cd8439887a34e4dd5c43996edace355c8";
const PASSWORD_HASH = "3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121";
export const BACKOFFICE_SESSION = "61fab613badd2371df88ffc3e208285311a2a4655b7099cd95d95fb8a037b9ec";

function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
function safeEqual(left: string, right: string) { return left.length === right.length && timingSafeEqual(Buffer.from(left), Buffer.from(right)); }
export function validBackofficeCredentials(username: string, password: string) {
  return safeEqual(digest(username), USER_HASH) && safeEqual(digest(password), PASSWORD_HASH);
}
