import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seed } from './seed.mjs';

// Exercises the production server and a separate real MongoDB; never touches local user data.
const port = process.env.TEST_PORT || '3107';
const base = `http://localhost:${port}/api`;
let mongo, server, checks = 0, logs = '';
const check = (value, message) => { assert.ok(value, message); checks++; console.log(`PASS ${message}`); };
async function request(path, token, method = 'GET', body, headers = {}) {
  const response = await fetch(base + path, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers }, ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json().catch(() => ({})), headers: response.headers };
}
const input = (changes = {}) => ({ name: 'API Test Course', duration: 7, topics: ['React', 'MongoDB'], price: 99.5, maxStudents: 3, status: 'Open', ...changes });
try {
  mongo = await MongoMemoryServer.create();
  const env = { ...process.env, NODE_ENV: 'production', MONGODB_URI: mongo.getUri(), MONGODB_DB: 'course_service_test', JWT_SECRET: randomBytes(48).toString('hex'), FRONTEND_URL: 'http://localhost:5173' };
  process.env.MONGODB_DB = env.MONGODB_DB;
  await seed(env.MONGODB_URI);
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', port], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', chunk => { logs += chunk; });
  server.stderr.on('data', chunk => { logs += chunk; });
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { ready = (await request('/health')).status === 200; } catch { /* waiting for startup */ }
    if (ready) break;
    if (server.exitCode !== null) throw new Error(logs);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.ok(ready, 'Production server ready');
  check((await request('/course')).status === 401, 'Anonymous requests rejected');
  check((await request('/course', null, 'GET', undefined, { 'x-user-id': 'fake' })).status === 401, 'Spoofed identity headers rejected');
  const accounts = {};
  for (const role of ['student', 'teacher']) for (let i = 1; i <= 3; i++) {
    const username = `${role}${i}`;
    const result = await request('/auth/login', null, 'POST', { identifier: i === 3 ? `${username}@course.test` : username, password: 'Learn2026!' });
    check(result.status === 200 && result.data.user.role.toLowerCase() === role && !result.data.user.password, `Login and safe user data: ${username}`);
    accounts[username] = result.data;
  }
  const t = accounts.teacher1.token, other = accounts.teacher2.token, s = accounts.student1.token, s2 = accounts.student2.token, s3 = accounts.student3.token;
  check((await request('/auth/login', null, 'POST', { identifier: 'student1', password: 'wrong' })).status === 401, 'Incorrect password rejected');
  check((await request('/auth/login', null, 'POST', { identifier: { $ne: null }, password: 'x' })).status === 400, 'Object credentials rejected');
  check((await request('/user', s)).data.user.id === accounts.student1.user.id, 'Authenticated session restored');
  check((await request(`/user/${accounts.teacher1.user.id}`, s)).status === 403, 'Other profiles denied');
  check((await request('/course', s, 'POST', input())).status === 403, 'Student cannot create');
  const list = (await request('/course', t)).data.courses;
  check(list.length > 0 && list.every(c => c.teacherId === accounts.teacher1.user.id), 'Teacher list limited to own courses');
  const created = await request('/course', t, 'POST', input());
  check(created.status === 201, 'Teacher can create');
  const id = created.data.course.id, path = `/course/${id}`;
  for (const method of ['GET', 'PUT', 'DELETE']) check((await request(path, other, method, method === 'PUT' ? input() : undefined)).status === 403, `Other teacher denied ${method}`);
  for (const method of ['PUT', 'DELETE']) check((await request(path, s, method, method === 'PUT' ? input() : undefined)).status === 403, `Student denied ${method}`);
  check((await request(path + '/enroll', t, 'POST')).status === 403, 'Teacher cannot enroll');
  for (const changes of [{ price: -1 }, { price: '10' }, { maxStudents: 1.5 }, { duration: 0 }, { topics: [] }, { status: 'wrong' }]) check((await request(path, t, 'PUT', input(changes))).status === 400, `Invalid course input rejected: ${Object.keys(changes)[0]}`);
  check((await request('/course/invalid', s)).status === 400, 'Invalid ID rejected');
  check((await request('/course', t, 'POST', '{bad json')).status === 400, 'Malformed JSON rejected');
  const duplicates = await Promise.all(Array.from({ length: 8 }, () => request(path + '/enroll', s, 'POST')));
  check(duplicates.filter(r => r.status === 201).length === 1 && duplicates.filter(r => r.status === 409).length === 7, 'Concurrent duplicate enrollments rejected');
  const detail = (await request(path, t)).data.course;
  check(detail.students.length === 1 && detail.students[0].id === accounts.student1.user.id && !detail.students[0].password, 'Teacher sees enrolled student without password');
  const studentDetail = (await request(path, s)).data.course;
  check(!studentDetail.students && studentDetail.isEnrolled, 'Student details protect other students');
  const enrolled = (await request('/course?enrolled=true', s)).data.courses;
  check(enrolled.some(c => c.id === id) && enrolled.every(c => c.isEnrolled), 'My learning shows only enrolled courses');
  check((await request(path, t, 'DELETE')).status === 409, 'Course with enrollment cannot be deleted');
  await request(path + '/enroll', s2, 'POST');
  check((await request(path, t, 'PUT', input({ maxStudents: 1 }))).status === 409, 'Capacity cannot drop below enrollment');
  const race = await request('/course', t, 'POST', input({ name: 'Last seat', maxStudents: 1 }));
  const racePath = `/course/${race.data.course.id}`;
  const lastSeat = await Promise.all([s, s2, s3].map(token => request(racePath + '/enroll', token, 'POST')));
  check(lastSeat.filter(r => r.status === 201).length === 1 && lastSeat.filter(r => r.status === 409).length === 2, 'Concurrent requests cannot oversell last seat');
  check((await request(racePath, t)).data.course.enrolledCount === 1, 'Enrollment count remains within capacity');
  check((await request(path, t, 'PUT', input({ status: 'Close' }))).status === 200, 'Owner updates course');
  check((await request(path, s3)).status === 200, 'Close course stays visible');
  check((await request(path + '/enroll', s3, 'POST')).status === 409, 'Close course rejects enrollment');
  await request(path, t, 'PUT', input({ status: 'Cancel' }));
  check((await request('/course', s)).data.courses.every(c => c.status !== 'Cancel'), 'Cancel courses hidden in catalog');
  check((await request('/course?enrolled=true', s)).data.courses.every(c => c.status !== 'Cancel'), 'Cancel courses hidden in My learning');
  check((await request(path, s)).status === 404, 'Cancel details hidden');
  check((await request(path + '/enroll', s3, 'POST')).status === 404, 'Cancel enrollment denied');
  check((await request('/course?search=MoDeRn', s)).data.courses.some(c => c.name === 'Modern Web Development'), 'Partial case-insensitive course search');
  const byTeacher = (await request('/course?search=teacher2', s)).data.courses;
  check(byTeacher.length > 0 && byTeacher.every(c => c.teacherName === 'teacher2'), 'Partial teacher search');
  check((await request('/course?search=%5B', s)).status === 200, 'Regex characters treated as literal search');
  const empty = await request('/course', t, 'POST', input({ name: 'Disposable' }));
  check((await request(`/course/${empty.data.course.id}`, t, 'DELETE')).status === 200, 'Owner deletes empty course');
  check((await request(`/course/${empty.data.course.id}`, t)).status === 404, 'Deleted course inaccessible');
  const cors = await request('/course', null, 'OPTIONS', undefined, { Origin: 'http://localhost:5173', 'Access-Control-Request-Headers': 'authorization' });
  check(cors.status === 204 && cors.headers.get('access-control-allow-origin') === 'http://localhost:5173', 'Unauthenticated CORS preflight works');
  check((await request('/course', s, 'GET', undefined, { Origin: 'https://untrusted.example' })).status === 403, 'Untrusted origin denied');
  check((await request('/auth/logout', s, 'POST')).status === 200, 'Logout succeeds');
  check((await request('/user', s)).status === 401, 'Logged-out session revoked on server');
  console.log(`\n${checks} API checks passed against production Next.js and isolated MongoDB.`);
} catch (error) { console.error(error); console.error(logs); process.exitCode = 1; }
finally {
  if (server && server.exitCode === null) { server.kill('SIGTERM'); await new Promise(resolve => server.once('exit', resolve)); }
  await mongo?.stop();
}
