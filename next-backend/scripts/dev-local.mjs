import { MongoMemoryServer } from 'mongodb-memory-server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { seed } from './seed.mjs';

let mongo;
let child;
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  if (child && child.exitCode === null) {
    await new Promise(resolve => { child.once('exit', resolve); child.kill('SIGTERM'); });
  }
  await mongo?.stop();
  process.exit(code);
}
try {
  await mkdir('.data/mongodb', { recursive: true });
  if (!process.env.JWT_SECRET) {
    try { process.env.JWT_SECRET = (await readFile('.data/jwt-secret', 'utf8')).trim(); }
    catch {
      process.env.JWT_SECRET = randomBytes(48).toString('hex');
      await writeFile('.data/jwt-secret', process.env.JWT_SECRET, { mode: 0o600 });
    }
  }
  if (!process.env.MONGODB_URI) {
    mongo = await MongoMemoryServer.create({ instance: { port: Number(process.env.MONGODB_PORT || 27019), dbPath: new URL('../.data/mongodb', import.meta.url).pathname, storageEngine: 'wiredTiger' } });
    process.env.MONGODB_URI = mongo.getUri();
    console.log('Local MongoDB started; data persists in next-backend/.data/mongodb');
  }
  await seed();
  child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '-p', process.env.PORT || '3001'], { stdio: 'inherit', env: process.env });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => stop());
  child.once('exit', code => stop(code || 0));
} catch (error) {
  console.error(error);
  await mongo?.stop();
  process.exitCode = 1;
}
