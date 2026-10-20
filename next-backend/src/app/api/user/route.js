import { requireUser } from "@/lib/auth";
import { endpoint, publicUser, successResponse } from "@/lib/utils";
export const GET = endpoint(async (request) => successResponse({ user: publicUser(await requireUser(request)) }));
