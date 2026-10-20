# Online Course Service

ระบบคอร์สออนไลน์ตามโจทย์ CSX4107 ใช้ **Next.js 16 + React 19 (Vite) + MongoDB** และรักษาโครงสร้าง `next-backend/` กับ `react-frontend/` เดิม

## Deployed Applications

- **Frontend:** https://csx4107-course-web.vercel.app
- **Backend:** https://csx4107-course-api.vercel.app
- **Health:** https://csx4107-course-api.vercel.app/api/health
- Database: MongoDB Atlas Free Tier, project **CSX4107 Course Service**, cluster **course-service**, database **course_service**
- Deploy แยก 2 Vercel projects ใน scope `dekfrxsh`: `csx4107-course-api` และ `csx4107-course-web`
- ตรวจจริงวันที่ 20 ตุลาคม 2026: production builds สำเร็จ, health เชื่อม Atlas, API smoke tests ผ่าน 29 ข้อ และทดสอบ login/search/enrollment ผ่าน deployed frontend
- บัญชีด้านล่างใช้ได้ทั้งในเครื่องและบนเว็บที่ deploy แล้ว

## Student Information

- **Student Name:** ยังไม่ได้ระบุ — เติมก่อนส่ง
- **Student ID:** ยังไม่ได้ระบุ — เติมก่อนส่ง
- **Section:** ยังไม่ได้ระบุ — เติมก่อนส่ง

## เริ่มใช้งานในเครื่อง

ต้องมี Node.js **22.13 ขึ้นไป** (แนะนำ Node 24 LTS), npm และอินเทอร์เน็ตสำหรับติดตั้ง dependency / ดาวน์โหลด MongoDB ครั้งแรก

จากโฟลเดอร์หลัก:

```sh
npm run setup
npm run dev
```

- Frontend: **http://localhost:5173**
- Backend: **http://localhost:3001**
- Database health: **http://localhost:3001/api/health**

ไม่ต้องสมัคร MongoDB Atlas สำหรับการรันในเครื่อง สคริปต์จะเปิด **MongoDB จริง** ผ่าน `mongodb-memory-server` ที่พอร์ต `27019`, seed ข้อมูล และสร้าง JWT secret ให้เอง ข้อมูลถูกเก็บที่ `next-backend/.data/mongodb` และ secret ที่ `.data/jwt-secret` จึงยังอยู่เมื่อปิดแล้วเปิดใหม่ ไฟล์เหล่านี้ถูก ignore จาก Git ไม่ใช่ฐานข้อมูลจำลองและไม่ใช่ฐานข้อมูลสำหรับ deployment

หากต้องการรันแยกสอง terminal:

```sh
# Terminal 1
cd next-backend
npm ci
npm run dev:local
```

```sh
# Terminal 2
cd react-frontend
npm ci
npm run dev
```

`npm run dev:local` ใช้พอร์ต 3001 เพื่อเลี่ยงชนกับแอปที่พอร์ต 3000 หากพอร์ต 3001 ถูกใช้ ให้รัน `PORT=3002 npm run dev` จาก root; proxy ของ frontend จะตามพอร์ต backend อัตโนมัติ พอร์ต frontend ต้องเป็น 5173 ตามค่า CORS เริ่มต้น

## Test Credentials

ทุกบัญชีใช้รหัสผ่าน **`Learn2026!`** และล็อกอินด้วย username หรือ email ได้:

| Role | Username | Email | Password |
| --- | --- | --- | --- |
| Student | student1 | student1@course.test | Learn2026! |
| Student | student2 | student2@course.test | Learn2026! |
| Student | student3 | student3@course.test | Learn2026! |
| Teacher | teacher1 | teacher1@course.test | Learn2026! |
| Teacher | teacher2 | teacher2@course.test | Learn2026! |
| Teacher | teacher3 | teacher3@course.test | Learn2026! |

Seed ทำงานแบบเพิ่มเฉพาะข้อมูลที่ยังไม่มี ไม่รีเซ็ตรหัสผ่านหรือเขียนทับคอร์สที่แก้ไขแล้ว บัญชีทดสอบมีไว้สำหรับงานนี้เท่านั้น

## Testing Walkthrough

1. เปิด frontend แล้วล็อกอิน `student1` ดูคอร์สทั้งหมดที่สถานะ Open/Close และลองค้นหาบางส่วนของชื่อคอร์สหรือชื่อครู เช่น `web`, `TEACHER2`
2. เปิด Modern Web Development แล้วกด **Enroll in this course** จากนั้นดู **My learning** และ reload หน้าเพื่อทดสอบการคง session
3. คอร์ส **Building APIs with Node.js** เป็น Close และ **Database Design** มีที่นั่งเดียวซึ่ง `student3` จองแล้ว จึงลงทะเบียนไม่ได้ ส่วน **Archived Workshop** เป็น Cancel และจะไม่ปรากฏในหน้าของ Student
4. Sign out แล้วล็อกอิน `teacher1` จะเห็นเฉพาะคอร์สของตัวเอง เปิด Modern Web Development เพื่อดูรายชื่อและอีเมลผู้เรียน ปุ่มลบถูกปิดถ้ามีผู้เรียนแล้ว
5. กด **Create course** กรอกชื่อ จำนวนวัน ราคา จำนวนรับ และหัวข้อหลายบรรทัด จากนั้นแก้ไขรายละเอียดและเปลี่ยน Open / Close / Cancel ได้
6. สร้างคอร์สที่ยังไม่มีผู้เรียน แล้วกด **Delete course → Confirm delete** เพื่อลบ คอร์สที่มีผู้เรียนลบไม่ได้ และลด Max students ต่ำกว่าจำนวนที่ลงแล้วไม่ได้
7. ล็อกอิน `teacher2` หรือ `teacher3` เพื่อตรวจว่าไม่สามารถดูหรือแก้ไขคอร์สของ `teacher1` ได้ แม้เรียก API โดยตรง

## Validation

```sh
# จาก root
npm run lint
npm run build
npm test
```

`npm test` ต้อง build backend ก่อน และจะเปิด production Next.js ที่พอร์ต 3107 พร้อม MongoDB แยกสำหรับทดสอบ ไม่แก้ไขฐานข้อมูลที่ใช้งานในเครื่อง ตรวจ 53 ข้อ ได้แก่ authentication, สิทธิ์, ownership, input validation, ชื่อคอร์ส/ครู, Open/Close/Cancel, enrolled student details, logout revocation และ concurrent enrollment (ลงซ้ำ/แย่งที่นั่งสุดท้าย) สามารถเปลี่ยนพอร์ตด้วย `TEST_PORT=3108 npm test`

การทดสอบในเครื่องรอบแรกใช้ Playwright: login ผิด/ถูก, ค้นหา, ดูรายละเอียด, ลงทะเบียน, My learning, reload คง session, ดูรายชื่อผู้เรียน, สร้าง/แก้ไข/ลบคอร์ส, empty state และหน้าจอ desktop/mobile

หลัง deploy ได้ทดสอบ API จริงเพิ่ม 29 ข้อ (health, CORS, login ทั้ง 6 บัญชี, ownership, search, restrictions, CRUD ของคอร์สทดสอบชั่วคราว และ logout revocation) และทดสอบ UI จริงผ่าน in-app browser: login → ค้นหา → ลงทะเบียน → My learning

## ใช้ MongoDB ที่มีอยู่ / MongoDB Atlas

คัดลอก `next-backend/.env.example` เป็น `next-backend/.env.local` แล้วกำหนด:

```dotenv
MONGODB_URI=mongodb+srv://USER:PASSWORD@YOUR-CLUSTER.mongodb.net/
MONGODB_DB=course_service
JWT_SECRET=YOUR_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
FRONTEND_URL=http://localhost:5173
```

สร้าง secret ด้วย `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"` และเก็บเฉพาะใน environment ที่ไม่ถูก commit จากนั้น:

```sh
cd next-backend
npm run seed
npm run dev -- -p 3001
```

ถ้ากำหนด `MONGODB_URI` ใน `.env.local` แล้ว `npm run dev:local` จะใช้ URI นี้และ seed ให้ ไม่เปิด MongoDB เพิ่มเอง

## API

ทุก endpoint ยกเว้น login, health และ OPTIONS ต้อง authenticate ผ่าน HttpOnly cookie `token` หรือ `Authorization: Bearer <token>` ฝั่ง React เก็บ bearer token ใน sessionStorage ของแต่ละแท็บและส่งไปกับทุกคำขอ รองรับ frontend/backend คนละโดเมนโดยไม่ต้องพึ่ง third-party cookie การ reload ยังคง session ภายในแท็บเดิม และ session มีอายุ 8 ชั่วโมง Logout จะเพิกถอน session ที่ฐานข้อมูลด้วย

| Method | Path | การทำงาน / สิทธิ์ |
| --- | --- | --- |
| POST | `/api/auth/login` | `{identifier, password}` → user และ token |
| POST | `/api/auth/logout` | ออกจากระบบและเพิกถอน session ปัจจุบัน |
| GET | `/api/user` | ข้อมูลผู้ใช้ปัจจุบัน ไม่มี password |
| GET | `/api/user/:id` | ดูได้เฉพาะ profile ของตนเอง |
| GET | `/api/course?search=...&enrolled=true` | Teacher: ของตนเอง; Student: ยกเว้น Cancel; enrolled=true: เฉพาะที่เรียน |
| POST | `/api/course` | Teacher สร้างคอร์ส |
| GET | `/api/course/:id` | Teacher: ของตนเองพร้อมรายชื่อผู้เรียน; Student: คอร์สที่ไม่ Cancel |
| PUT / PATCH | `/api/course/:id` | Teacher เจ้าของแก้ไขข้อมูลคอร์สครบชุด |
| DELETE | `/api/course/:id` | Teacher เจ้าของลบได้เมื่อไม่มีผู้เรียน |
| POST | `/api/course/:id/enroll` | Student ลงทะเบียนได้เมื่อ Open, ไม่ซ้ำ และมีที่ว่าง |
| GET | `/api/health` | สถานะ API และการเชื่อมต่อ MongoDB |

ตัวอย่างข้อมูลสร้าง/แก้ไขคอร์ส:

```json
{
  "name": "Modern Web Development",
  "duration": 30,
  "topics": ["React", "Next.js", "MongoDB"],
  "price": 2490,
  "maxStudents": 24,
  "status": "Open"
}
```

รหัสตอบกลับหลัก: 400 ข้อมูลไม่ถูกต้อง, 401 ยังไม่ล็อกอิน/session หมดอายุ, 403 ไม่มีสิทธิ์, 404 ไม่พบคอร์ส/คอร์ส Cancel สำหรับ Student, 409 เงื่อนไขไม่อนุญาต เช่น ลงซ้ำ/เต็ม/ปิด/ลบคอร์สที่มีผู้เรียน

## ข้อมูลและการบังคับเงื่อนไข

- `users`: username/email unique, bcrypt password hash, role เป็น Student หรือ Teacher
- `courses`: ข้อมูลคอร์ส, teacherId/teacherName, studentIds, timestamps
- `sessions`: session ID, userId, expiresAt พร้อม TTL index
- เก็บ student IDs ในคอร์สเพื่อให้การเช็กสถานะ ที่ว่าง และการเพิ่มสมาชิกเกิดใน **MongoDB atomic update เดียว** ป้องกันการรับเกินจำนวนแม้คำขอเข้าพร้อมกัน การลดความจุและการลบตรวจเงื่อนไขในการเขียนฐานข้อมูลเช่นกัน
- API อ่าน user/session จากฐานข้อมูลทุกครั้งและไม่เชื่อ role หรือ identity header จาก client
- Student ไม่ได้รับรายชื่อหรืออีเมลผู้เรียนอื่น และคอร์ส Cancel ถูกซ่อนรวมถึงใน My learning
- ไม่มี public registration/role switching; ใช้บัญชีที่เตรียมไว้ตามโจทย์

## Deploy บน Vercel

Deploy สำเร็จแล้วตาม URL ด้านบน มี `vercel.json` สำหรับทั้งสองโปรเจกต์ และ environment บน Vercel กำหนดครบแล้ว ส่วนคำแนะนำต่อไปนี้ใช้สำหรับทำซ้ำหรือย้ายบัญชี

1. สร้าง MongoDB Atlas cluster, database user และตั้ง Network Access ให้ deployment เชื่อมต่อได้ เก็บ connection string ไว้เป็น secret
2. นำ source code ขึ้น GitHub repository ของตนเอง โครงสร้าง monorepo นี้ deploy แยกได้สอง Vercel projects โดยไม่ต้องแยก source ออกจากกัน
3. Import backend เป็น Vercel project: **Root Directory = `next-backend`**, Framework = Next.js, Node.js = 24.x
4. ตั้ง backend environment: `MONGODB_URI`, `MONGODB_DB=course_service`, `JWT_SECRET` (สุ่มอย่างน้อย 32 ตัวอักษร), `FRONTEND_URL=https://YOUR-FRONTEND.vercel.app` ห้ามใส่ slash ปิดท้าย URL ถ้ามีหลาย origin ให้คั่นด้วย comma
5. Seed ฐานข้อมูล Atlas หนึ่งครั้งจากเครื่องด้วย environment ใน `.env.local` และ `npm run seed` ไม่ต้องเปิด seed endpoint สาธารณะ
6. Import frontend เป็นอีก Vercel project: **Root Directory = `react-frontend`**, Framework = Vite, Build = `npm run build`, Output = `dist`, Node.js = 24.x
7. ตั้ง frontend environment: `VITE_API_URL=https://YOUR-BACKEND.vercel.app` (ไม่เติม `/api` หรือ slash ปิดท้าย) แล้ว deploy
8. ตรวจ `FRONTEND_URL` ของ backend ให้ตรงกับ URL จริงของ frontend แล้ว redeploy backend; หากเปลี่ยน `VITE_API_URL` ต้อง rebuild/redeploy frontend เพราะ Vite ใส่ค่าตอน build
9. เปิด backend `/api/health` ให้ตอบ `database: connected` แล้วทดสอบ login/CRUD/enrollment จาก frontend ที่ deploy ตาม walkthrough ด้านบน

**ไม่ใช้ `dev:local` หรือ MongoDB ใน `.data` บน Vercel** เพราะ filesystem ไม่ใช่ฐานข้อมูลถาวร ต้องใช้ Atlas หรือ MongoDB ภายนอก

## Submission Checklist

- [ ] เติมชื่อ รหัสนักศึกษา และ section ด้านบน
- [ ] Backend repository link: ยังไม่ได้สร้าง/ระบุ
- [ ] Frontend repository link: ยังไม่ได้สร้าง/ระบุ (ถ้าใช้ monorepo ให้ส่งลิงก์แต่ละโฟลเดอร์)
- [x] Backend deployed URL: https://csx4107-course-api.vercel.app
- [x] Frontend deployed URL: https://csx4107-course-web.vercel.app
- [ ] Screen-recording link: ผู้ใช้ต้องบันทึกและแนบเอง

การตั้งค่าหรือสร้างแอปไม่สามารถทดแทนการบันทึกหน้าจอและกล้องตลอดช่วงเวลาที่โจทย์กำหนดได้
