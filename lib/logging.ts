export function logEvent(level: "info" | "error", route: string, message: string, details: Record<string, unknown> = {}) {
  const entry = JSON.stringify({ level, route, message, ...details, timestamp: new Date().toISOString() });
  if (level === "error") console.error(entry);
  else console.info(entry);
}
