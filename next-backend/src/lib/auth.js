import jwt from "jsonwebtoken";
import { getDb } from "./mongodb";
import { ApiError, objectId } from "./utils";

export function jwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters");
  return process.env.JWT_SECRET;
}
export function verifyJWT(request) {
  const authorization = request.headers.get("authorization");
  const token = authorization ? authorization.replace(/^Bearer /i, "") : request.cookies.get("token")?.value;
  if (!token) return null;
  try { return jwt.verify(token, jwtSecret(), { algorithms: ["HS256"], issuer: "course-service", audience: "course-web" }); }
  catch { return null; }
}
export async function requireUser(request, role) {
  const claims = verifyJWT(request);
  if (!claims || !claims.sub || !claims.jti) throw new ApiError("Please sign in to continue", 401);
  const db = await getDb();
  const [user, session] = await Promise.all([
    db.collection("users").findOne({ _id: objectId(claims.sub) }),
    db.collection("sessions").findOne({ _id: claims.jti, userId: claims.sub, expiresAt: { $gt: new Date() } }),
  ]);
  if (!user || !session) throw new ApiError("Your session has expired. Please sign in again", 401);
  if (role && user.role !== role) throw new ApiError(`Only ${role}s may perform this action`, 403);
  return { ...user, sessionId: claims.jti };
}
export const cookieOptions = () => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/", maxAge: 8 * 60 * 60 });
