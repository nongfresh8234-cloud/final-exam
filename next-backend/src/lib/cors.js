export function allowedOrigins() {
  return (process.env.FRONTEND_URL || "http://localhost:5173").split(",").map((url) => url.trim());
}

export default function corsHeaders(request) {
  const origin = request.headers.get("origin");
  return {
    ...(allowedOrigins().includes(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}
