import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { accessibleCourse, publicCourse } from "@/lib/courses";
import { ApiError, endpoint, objectId, successResponse } from "@/lib/utils";
export const POST = endpoint(async (request, context) => {
  const user = await requireUser(request, "Student");
  const id = objectId((await context.params).course_id);
  const db = await getDb();
  const studentId = user._id.toString();
  // One atomic write prevents duplicate enrollments and overselling the last seat.
  const course = await db.collection("courses").findOneAndUpdate(
    { _id: id, status: "Open", studentIds: { $ne: studentId }, $expr: { $lt: [{ $size: "$studentIds" }, "$maxStudents"] } },
    { $addToSet: { studentIds: studentId }, $set: { updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!course) {
    const current = await accessibleCourse(db, id, user);
    if (current.studentIds.includes(studentId)) throw new ApiError("You are already enrolled in this course", 409);
    if (current.status !== "Open") throw new ApiError("This course is closed for enrollment", 409);
    throw new ApiError("This course is full", 409);
  }
  return successResponse({ message: "Enrollment confirmed", course: publicCourse(course, user) }, 201);
});
