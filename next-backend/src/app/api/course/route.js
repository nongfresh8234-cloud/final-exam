import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { courseInput, publicCourse } from "@/lib/courses";
import { endpoint, readBody, successResponse } from "@/lib/utils";

export const GET = endpoint(async (request) => {
  const user = await requireUser(request);
  const params = new URL(request.url).searchParams;
  const query = user.role === "Teacher" ? { teacherId: user._id.toString() } : { status: { $ne: "Cancel" } };
  if (user.role === "Student" && params.get("enrolled") === "true") query.studentIds = user._id.toString();
  const search = (params.get("search") || "").trim().slice(0, 120);
  if (search) {
    const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [{ name: { $regex: pattern, $options: "i" } }, { teacherName: { $regex: pattern, $options: "i" } }];
  }
  const courses = await (await getDb()).collection("courses").find(query).sort({ createdAt: -1, _id: -1 }).toArray();
  return successResponse({ courses: courses.map((course) => publicCourse(course, user)) });
});
export const POST = endpoint(async (request) => {
  const user = await requireUser(request, "Teacher");
  const data = courseInput(await readBody(request));
  const course = { ...data, teacherId: user._id.toString(), teacherName: user.username, studentIds: [], createdAt: new Date(), updatedAt: new Date() };
  const result = await (await getDb()).collection("courses").insertOne(course);
  return successResponse({ course: publicCourse({ ...course, _id: result.insertedId }, user) }, 201);
});
