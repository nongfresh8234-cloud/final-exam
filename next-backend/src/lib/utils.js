import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export class ApiError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export function errorResponse(message, status = 400) {
  return NextResponse.json({ message }, { status });
}
export function successResponse(data, status = 200) {
  return NextResponse.json(data, { status });
}
export function endpoint(handler) {
  return async (...args) => {
    try { return await handler(...args); }
    catch (error) {
      if (error instanceof ApiError) return errorResponse(error.message, error.status);
      console.error("API request failed:", error.message);
      return errorResponse("The service is unavailable. Please try again.", 500);
    }
  };
}
export async function readBody(request) {
  const text = await request.text();
  if (Buffer.byteLength(text) > 16384) throw new ApiError("Request is too large", 413);
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
    return data;
  } catch { throw new ApiError("A valid JSON object is required"); }
}
export function objectId(value) {
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) throw new ApiError("Invalid ID");
  return new ObjectId(value);
}
export function publicUser(user) {
  return { id: user._id.toString(), username: user.username, email: user.email, role: user.role };
}
