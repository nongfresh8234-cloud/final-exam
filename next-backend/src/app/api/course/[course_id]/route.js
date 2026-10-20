import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { accessibleCourse, courseInput, publicCourse } from "@/lib/courses";
import { ApiError, endpoint, objectId, publicUser, readBody, successResponse } from "@/lib/utils";

export const GET = endpoint(async (request, context) => {
  const user = await requireUser(request);
  const id = objectId((await context.params).course_id);
  const db = await getDb();
  const course = await accessibleCourse(db, id, user);
  const students = user.role === "Teacher" ? await db.collection("users").find({ _id: { $in: course.studentIds.map(objectId) } }).toArray() : [];
  return successResponse({ course: { ...publicCourse(course, user), ...(user.role === "Teacher" ? { students: students.map(publicUser) } : {}) } });
});
export const PUT = endpoint(async (request, context) => {
  const user = await requireUser(request, "Teacher");
  const id = objectId((await context.params).course_id);
  const db = await getDb();
  await accessibleCourse(db, id, user);
  const data = courseInput(await readBody(request));
  // Predicate and update are atomic, including concurrent enrollment requests.
  const course = await db.collection("courses").findOneAndUpdate(
    { _id: id, teacherId: user._id.toString(), $expr: { $lte: [{ $size: "$studentIds" }, data.maxStudents] } },
    { $set: { ...data, updatedAt: new Date() } }, { returnDocument: "after" },
  );
  if (!course) throw new ApiError("Max students cannot be lower than the current enrollment, or the course was removed", 409);
  return successResponse({ course: publicCourse(course, user) });
});
export const PATCH = PUT;
export const DELETE = endpoint(async (request, context) => {
  const user = await requireUser(request, "Teacher");
  const id = objectId((await context.params).course_id);
  const db = await getDb();
  await accessibleCourse(db, id, user);
  const result = await db.collection("courses").deleteOne({ _id: id, teacherId: user._id.toString(), studentIds: { $size: 0 } });
  if (!result.deletedCount) throw new ApiError("Courses with enrolled students cannot be deleted", 409);
  return successResponse({ message: "Course deleted" });
});
