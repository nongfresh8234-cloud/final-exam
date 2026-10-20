import { ApiError } from "./utils";

export function courseInput(body) {
  const { name, duration, topics, price, maxStudents, status } = body;
  if (typeof name !== "string" || !name.trim() || name.trim().length > 120) throw new ApiError("Course name must be 1–120 characters");
  if (!Number.isInteger(duration) || duration < 1 || duration > 3650) throw new ApiError("Duration must be a whole number between 1 and 3650 days");
  if (!Array.isArray(topics) || topics.length < 1 || topics.length > 30 || topics.some((topic) => typeof topic !== "string" || !topic.trim() || topic.trim().length > 120)) throw new ApiError("Provide 1–30 topics, each 1–120 characters");
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0 || price > 10000000 || Math.abs(price * 100 - Math.round(price * 100)) > 0.00001) throw new ApiError("Price must be non-negative with at most 2 decimals");
  if (!Number.isInteger(maxStudents) || maxStudents < 1 || maxStudents > 10000) throw new ApiError("Max students must be a whole number between 1 and 10000");
  if (!["Open", "Close", "Cancel"].includes(status)) throw new ApiError("Status must be Open, Close, or Cancel");
  return { name: name.trim(), duration, topics: [...new Set(topics.map((topic) => topic.trim()))], price, maxStudents, status };
}
export function publicCourse(course, user) {
  return {
    id: course._id.toString(), name: course.name, duration: course.duration, topics: course.topics,
    price: course.price, maxStudents: course.maxStudents, status: course.status,
    teacherId: course.teacherId, teacherName: course.teacherName,
    enrolledCount: course.studentIds.length, seatsAvailable: course.maxStudents - course.studentIds.length,
    isEnrolled: course.studentIds.includes(user._id.toString()), createdAt: course.createdAt,
  };
}
export async function accessibleCourse(db, id, user) {
  const course = await db.collection("courses").findOne({ _id: id });
  if (!course) throw new ApiError("Course not found", 404);
  if (user.role === "Teacher" && course.teacherId !== user._id.toString()) throw new ApiError("You can only access your own courses", 403);
  if (user.role === "Student" && course.status === "Cancel") throw new ApiError("Course not found", 404);
  return course;
}
