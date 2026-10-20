# ตรวจตามโจทย์ CSX4107 Final Examination 1/2026

ตรวจจาก PDF ที่ผู้ใช้ให้, INSTRUCTION.md, source code ปัจจุบัน และการรันจริงในเครื่อง วันที่ 20 ตุลาคม 2026

## ผลตรวจ

**ยังไม่พบฟังก์ชันหลักที่ขาดหรือขัดกับโจทย์จากการตรวจโค้ดและทดสอบในเครื่อง แต่ยังไม่ครบงานส่ง เพราะยังไม่ได้ deploy และยังไม่มีลิงก์ repository/วิดีโอ/ข้อมูลนักศึกษา**

| ข้อกำหนด | ผล | หลักฐาน |
| --- | --- | --- |
| Backend Next.js, frontend React, MongoDB | ผ่านในเครื่อง | next-backend/, react-frontend/; MongoDB driver และ MongoDB จริง |
| รักษาโครงสร้างและ API เดิม | ผ่าน | ใช้ api/auth, api/user, api/course เดิม เพิ่ม enroll และ health |
| Authentication ก่อน protected operations | ผ่าน | src/proxy.js และ requireUser() ใน route handlers; unauthenticated = 401 |
| Frontend login และคง authentication | ผ่าน | UserContext, token/cookie, GET /api/user หลัง reload |
| Username, email, password, role | ผ่าน | Seed users; password เก็บเป็น bcrypt hash |
| Student อย่างน้อย 3 และ Teacher อย่างน้อย 3 | ผ่าน | student1–3 / teacher1–3; ทดสอบล็อกอินครบทั้ง 6 บัญชี |
| README ระบุบัญชีทดสอบและวิธีรัน | ผ่าน | ตารางบัญชีและ walkthrough ใน README.md |
| เฉพาะ Teacher สร้างคอร์ส | ผ่าน | POST /api/course เรียก requireUser(request, Teacher) |
| Teacher ดู/แก้ไขเฉพาะของตนเอง | ผ่าน | teacherId filter และ accessibleCourse(); ต่างเจ้าของ = 403 |
| ข้อมูลคอร์สครบทุก field | ผ่าน | name, duration, topics[], price, maxStudents, status |
| Teacher list/create/detail/update | ผ่าน | หน้า My courses, CourseEditor, CourseDetail; API CRUD |
| รายละเอียดคอร์สแสดง enrolled Students | ผ่าน | GET course detail ของเจ้าของคืน students; แสดง username/email |
| ลบคอร์สได้เมื่อไม่มี Student ลง | ผ่าน | atomic delete predicate studentIds size 0; มีผู้เรียน = 409 |
| Student เห็นทุกคอร์สยกเว้น Cancel | ผ่าน | API filter status != Cancel; frontend แสดงตาม API |
| ค้นหาบางส่วนของชื่อคอร์ส/ชื่อครู | ผ่าน | search ใน API แบบ case insensitive และ escape regex |
| Student ดูรายละเอียดคอร์ส | ผ่าน | GET course detail, หน้า CourseDetail |
| ลงได้เฉพาะ Open และมีที่นั่ง | ผ่าน | atomic findOneAndUpdate ตรวจ status และ array size < maxStudents |
| Student ลงคอร์สเดิมซ้ำไม่ได้ | ผ่าน | studentIds $ne และ $addToSet ใน atomic write |
| แสดงคอร์สที่ Student ลงทะเบียน | ผ่าน | enrolled=true และหน้า My learning |
| Open มองเห็น/ลงได้เมื่อเหลือที่ | ผ่าน | API, UI, integration tests |
| Close มองเห็นแต่ลงไม่ได้ | ผ่าน | API คืนคอร์ส; enroll = 409 และปุ่มปิด |
| Cancel ไม่แสดง/ลงไม่ได้ | ผ่าน | list ซ่อน; detail/enroll = 404 สำหรับ Student |
| ตรวจสิทธิ์และเงื่อนไขที่ backend | ผ่าน | route handlers ตรวจทุกครั้ง ไม่พึ่งปุ่ม frontend อย่างเดียว |
| Deploy backend | ยังไม่ได้ทำ | ไม่มี Vercel account connection/token และ external MongoDB ที่เข้าถึงได้ |
| Deploy frontend และเรียก deployed backend | ยังไม่ได้ทำ | ต้องมี deployed backend URL เพื่อกำหนด VITE_API_URL |
| Environment สำหรับ deployment | เตรียมไฟล์แล้ว แต่ยังไม่ได้ตั้งจริง | .env.example และ vercel.json ของทั้งสองโปรเจกต์ |
| Repository links สำหรับทั้งสองส่วน | ยังไม่มี | โฟลเดอร์นี้ยังไม่เป็น Git repository และ GitHub connector ยังไม่เชื่อมต่อ |
| Deployed URLs ทั้งสองส่วน | ยังไม่มี | ยังไม่มี deployment จริง |
| ลิงก์บันทึกหน้าจอและกล้อง | ยังไม่ได้ระบุ | ผู้ใช้ต้องมีและแนบ recording จริง ไม่สามารถสร้างย้อนหลังแทนได้ |
| ชื่อ/รหัสนักศึกษา/section | ยังไม่ได้ระบุ | README ยังมีช่องให้เติม |

## ข้อควรแยกให้ชัด

- `mongodb-memory-server` สำหรับ local เปิด MongoDB server จริงและเก็บข้อมูลใน .data จึงตรงเทคโนโลยี MongoDB สำหรับการตรวจในเครื่อง แต่ **ไม่ใช่ฐานข้อมูลที่ deploy แล้ว** และไม่ใช้แทน Atlas บน Vercel
- ยังไม่ยืนยันว่า environment, CORS และการเชื่อมต่อทำงานบน URL ภายนอก จนกว่าจะ deploy และทดสอบ URL จริง
- ไม่มีการใช้ Sites แทน Next.js/MongoDB เพราะ runtime ของ Sites ไม่ตรงกับ backend ที่โจทย์กำหนด
- ไม่พบข้อกำหนดให้สมัครสมาชิก, แก้ไข role, จ่ายเงินจริง, มีเนื้อหาบทเรียน หรือถอน enrollment จึงไม่ถือว่า feature เหล่านี้ขาด

## ผลทดสอบรอบตรวจนี้

- `npm run lint` — ผ่านทั้ง backend และ frontend
- `npm run build` — ผ่าน production build ทั้งสองโปรเจกต์
- `npm test` — ผ่าน 53 API checks บน production Next.js และ MongoDB แยกสำหรับทดสอบ
- ได้ตรวจ source ของ login, user context, role guards, CRUD, enroll, search และ course status เทียบกับ PDF
- UI flow เคยทดสอบผ่าน Playwright ในงานรอบก่อน; รอบนี้เป็นการตรวจข้อกำหนดและทดสอบ build/API ซ้ำ ไม่มีการเปลี่ยน UI

## สิ่งที่ต้องทำเพื่อปิดงาน

1. เชื่อมต่อ Vercel และ MongoDB Atlas เพื่อสร้าง backend/frontend deployment และฐานข้อมูลถาวร
2. เชื่อมต่อ GitHub เพื่อจัดเก็บ source และสร้างลิงก์ส่งงาน
3. Seed ข้อมูลบน MongoDB ภายนอก; ตั้ง MONGODB_URI, MONGODB_DB, JWT_SECRET, FRONTEND_URL และ VITE_API_URL
4. ทดสอบ login, ownership, CRUD, enroll และ status ผ่าน deployed frontend/backend จริง
5. ใส่ deployed URLs และ repository links ใน README
6. ผู้ใช้เติมข้อมูลนักศึกษา และแนบลิงก์ recording

## เอกสาร deployment ที่ตรวจประกอบ

- Vercel monorepos: https://vercel.com/docs/monorepos
- Vercel environment variables: https://vercel.com/docs/environment-variables
- MongoDB Atlas connection: https://www.mongodb.com/docs/atlas/connect-to-database-deployment/
