import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/mongodb";
import { cookieOptions, jwtSecret } from "@/lib/auth";
import { ApiError, endpoint, publicUser, readBody, successResponse } from "@/lib/utils";

export const POST = endpoint(async (request) => {
  const { identifier, password } = await readBody(request);
  if (typeof identifier !== "string" || !identifier.trim() || identifier.length > 254 || typeof password !== "string" || !password || password.length > 72) throw new ApiError("Enter your username or email and password");
  const db = await getDb();
  const login = identifier.trim().toLowerCase();
  const user = await db.collection("users").findOne({ $or: [{ username: login }, { email: login }] });
  if (!user || !(await bcrypt.compare(password, user.password))) throw new ApiError("Incorrect username/email or password", 401);
  const sessionId = randomUUID();
  const token = jwt.sign({}, jwtSecret(), { algorithm: "HS256", subject: user._id.toString(), jwtid: sessionId, issuer: "course-service", audience: "course-web", expiresIn: "8h" });
  await db.collection("sessions").insertOne({ _id: sessionId, userId: user._id.toString(), expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) });
  const response = successResponse({ user: publicUser(user), token });
  response.cookies.set("token", token, cookieOptions());
  return response;
});
