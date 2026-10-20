import { requireUser } from "@/lib/auth";
import { ApiError, endpoint, objectId, publicUser, successResponse } from "@/lib/utils";
export const GET = endpoint(async (request, context) => {
  const user = await requireUser(request);
  const { user_id } = await context.params;
  if (!objectId(user_id).equals(user._id)) throw new ApiError("You can only view your own profile", 403);
  return successResponse({ user: publicUser(user) });
});
