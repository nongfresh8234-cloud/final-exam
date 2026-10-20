import { NextResponse } from "next/server";
import { verifyJWT } from "./lib/auth";
import corsHeaders, { allowedOrigins } from "./lib/cors";

export function proxy(request) {
  const headers = corsHeaders(request);
  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins().includes(origin) && origin !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Origin is not allowed" }, { status: 403, headers });
  }
  if (request.method === "OPTIONS") return new NextResponse(null, { status: 204, headers });
  const publicPaths = ["/api/auth/login", "/api/health"];
  if (!publicPaths.includes(request.nextUrl.pathname) && !verifyJWT(request)) {
    return NextResponse.json({ message: "Please sign in to continue" }, { status: 401, headers });
  }
  const response = NextResponse.next();
  Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}
export const config = { matcher: ["/api/:path*"] };
