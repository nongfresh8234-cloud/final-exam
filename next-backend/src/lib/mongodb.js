import { MongoClient } from "mongodb";

export function getClientPromise() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  if (!globalThis.courseMongoClient) {
    const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    globalThis.courseMongoClient = client.connect().catch((error) => {
      globalThis.courseMongoClient = undefined;
      throw error;
    });
  }
  return globalThis.courseMongoClient;
}

export async function getDb() {
  return (await getClientPromise()).db(process.env.MONGODB_DB || "course_service");
}
