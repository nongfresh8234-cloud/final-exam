import { spawn } from 'node:child_process';
const root = new URL('../', import.meta.url);
const backendPort = process.env.PORT || '3001';
const services = [
  spawn(process.execPath, ['--env-file-if-exists=.env.local', 'scripts/dev-local.mjs'], { cwd: new URL('next-backend/', root), stdio: 'inherit', env: { ...process.env, PORT: backendPort } }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { cwd: new URL('react-frontend/', root), stdio: 'inherit', env: { ...process.env, API_PROXY_TARGET: `http://localhost:${backendPort}` } }),
];
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  await Promise.all(services.map(child => child.exitCode === null ? new Promise(resolve => { child.once('exit', resolve); child.kill('SIGTERM'); }) : Promise.resolve()));
  process.exit(code);
}
for (const child of services) child.once('exit', code => stop(code || 0));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => stop());
