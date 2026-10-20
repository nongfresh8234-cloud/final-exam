import { getDb } from "@/lib/mongodb";
import { endpoint, successResponse } from "@/lib/utils";
export const GET = endpoint(async () => {
  await (await getDb()).command({ ping: 1 });
  return successResponse({ status: "ok", service: "Course Service API", database: "connected" });
});
