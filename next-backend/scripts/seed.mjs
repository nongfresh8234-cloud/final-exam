import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { pathToFileURL } from 'node:url';

export async function seed(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error('Set MONGODB_URI before seeding');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'course_service');
    await Promise.all([
      db.collection('users').createIndex({ username: 1 }, { unique: true }),
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection('courses').createIndex({ teacherId: 1 }),
      db.collection('courses').createIndex({ studentIds: 1 }),
    ]);
    const password = await bcrypt.hash('Learn2026!', 12);
    const users = {};
    for (const role of ['Teacher', 'Student']) {
      for (let i = 1; i <= 3; i++) {
        const username = `${role.toLowerCase()}${i}`;
        await db.collection('users').updateOne({ username }, { $setOnInsert: { username, email: `${username}@course.test`, password, role } }, { upsert: true });
        users[username] = await db.collection('users').findOne({ username });
      }
    }
    const samples = [
      ['Modern Web Development', 'teacher1', 30, ['React', 'Next.js', 'REST APIs'], 2490, 24, 'Open', ['student2']],
      ['JavaScript Essentials', 'teacher1', 14, ['JavaScript', 'Functions', 'Async programming'], 1290, 20, 'Open', []],
      ['Building APIs with Node.js', 'teacher1', 21, ['Node.js', 'Authentication', 'MongoDB'], 1990, 12, 'Close', []],
      ['UI Design Foundations', 'teacher2', 10, ['Typography', 'Color', 'Layout'], 1490, 18, 'Open', []],
      ['Database Design', 'teacher2', 14, ['Data modeling', 'MongoDB', 'Indexes'], 1790, 1, 'Open', ['student3']],
      ['Python for Beginners', 'teacher3', 21, ['Python', 'Problem solving', 'Projects'], 1890, 20, 'Open', []],
      ['Introduction to Cloud', 'teacher3', 7, ['Deployment', 'Cloud platforms'], 990, 15, 'Close', []],
      ['Archived Workshop', 'teacher3', 3, ['Legacy systems'], 0, 10, 'Cancel', []],
    ];
    for (let i = 0; i < samples.length; i++) {
      const [name, teacher, duration, topics, price, maxStudents, status, students] = samples[i];
      await db.collection('courses').updateOne({ seedKey: `sample-${i}` }, { $setOnInsert: {
        seedKey: `sample-${i}`, name, teacherId: users[teacher]._id.toString(), teacherName: teacher,
        duration, topics, price, maxStudents, status, studentIds: students.map(s => users[s]._id.toString()),
        createdAt: new Date(Date.UTC(2026, 9, 20, 0, samples.length - i)), updatedAt: new Date(),
      } }, { upsert: true });
    }
    console.log('Seed ready: teacher1–3 / student1–3; password: Learn2026!');
  } finally { await client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed().catch(error => { console.error(error.message); process.exitCode = 1; });
}
