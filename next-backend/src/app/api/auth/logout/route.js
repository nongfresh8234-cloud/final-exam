import { requireUser, cookieOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { endpoint, successResponse } from "@/lib/utils";
export const POST = endpoint(async (request) => {
  const user = await requireUser(request);
  await (await getDb()).collection("sessions").deleteOne({ _id: user.sessionId });
  const response = successResponse({ message: "Signed out" });
  response.cookies.set("token", "", { ...cookieOptions(), maxAge: 0 });
  return response;
});
