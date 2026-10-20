# ตรวจตามโจทย์ CSX4107 Final Examination 1/2026

ตรวจจาก PDF ที่ผู้ใช้ให้, INSTRUCTION.md, source code ปัจจุบัน และการรันจริงในเครื่อง วันที่ 20 ตุลาคม 2026

## ผลตรวจ

**ฟังก์ชันหลักผ่านการตรวจและ deploy ทั้งสองส่วนแล้ว พร้อม MongoDB Atlas จริง source ขึ้น GitHub แล้ว ยังเหลือข้อมูลส่งงาน: recording และข้อมูลนักศึกษา**

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
| Deploy backend | ผ่าน | https://csx4107-course-api.vercel.app; health ตอบ database connected |
| Deploy frontend และเรียก deployed backend | ผ่าน | https://csx4107-course-web.vercel.app; login/search/enroll ผ่าน API คนละโดเมน |
| Environment สำหรับ deployment | ผ่าน | Vercel กำหนด MONGODB_URI/JWT_SECRET เป็น Secret และ MONGODB_DB/FRONTEND_URL/VITE_API_URL เป็น Config |
| Repository links สำหรับทั้งสองส่วน | ผ่าน | https://github.com/nongfresh8234-cloud/final-exam มี next-backend และ react-frontend บน main |
| Deployed URLs ทั้งสองส่วน | ผ่าน | บันทึก frontend/backend production URLs ใน README แล้ว |
| ลิงก์บันทึกหน้าจอและกล้อง | ยังไม่ได้ระบุ | ผู้ใช้ต้องมีและแนบ recording จริง ไม่สามารถสร้างย้อนหลังแทนได้ |
| ชื่อ/รหัสนักศึกษา/section | ยังไม่ได้ระบุ | README ยังมีช่องให้เติม |

## ข้อควรแยกให้ชัด

- `mongodb-memory-server` สำหรับ local เปิด MongoDB server จริงและเก็บข้อมูลใน .data จึงตรงเทคโนโลยี MongoDB สำหรับการตรวจในเครื่อง แต่ **ไม่ใช่ฐานข้อมูลที่ deploy แล้ว** และไม่ใช้แทน Atlas บน Vercel
- ยืนยัน environment, CORS และการเชื่อมต่อจาก URL จริงแล้ว: production API smoke tests ผ่าน 29 ข้อ และ UI login/search/enrollment ผ่าน in-app browser
- ไม่มีการใช้ Sites แทน Next.js/MongoDB เพราะ runtime ของ Sites ไม่ตรงกับ backend ที่โจทย์กำหนด
- ไม่พบข้อกำหนดให้สมัครสมาชิก, แก้ไข role, จ่ายเงินจริง, มีเนื้อหาบทเรียน หรือถอน enrollment จึงไม่ถือว่า feature เหล่านี้ขาด

## ผลทดสอบรอบตรวจนี้

- `npm run lint` — ผ่านทั้ง backend และ frontend
- `npm run build` — ผ่าน production build ทั้งสองโปรเจกต์
- `npm test` — ผ่าน 53 API checks บน production Next.js และ MongoDB แยกสำหรับทดสอบ
- ได้ตรวจ source ของ login, user context, role guards, CRUD, enroll, search และ course status เทียบกับ PDF
- UI ในเครื่องเคยทดสอบผ่าน Playwright; หลัง deploy ทดสอบผ่าน in-app browser เพิ่ม: login, search, details, enrollment และ My learning หลัง reload (session และ enrollment คงอยู่)

## สถานะ deployment

- Backend: READY, production, Next.js 16.3.1
- Frontend: READY, production, Vite/React
- Source snapshot ที่ deploy: `2eefa4b` (local Git)
- MongoDB Atlas: มี Teacher 3, Student 3 และคอร์สตัวอย่าง 8 คอร์ส โดย Student เห็นเฉพาะ 7 คอร์สที่ไม่ Cancel
- ตรวจไฟล์ก่อน upload แล้ว: ไม่ส่ง .env, .data, .vercel, node_modules หรือ MongoDB password/JWT secret ขึ้นเป็น source
- Secret ที่จำเป็นถูกส่งผ่าน stdin ไป Vercel environment ไม่อยู่ใน command arguments หรือ source code
- ไม่มีการเปลี่ยนโค้ด business rules ในขั้นตอน deployment; เพิ่ม install command เพื่อข้ามดาวน์โหลด MongoDB binary สำหรับ local-only tooling บน Vercel

## Post-deployment QA

| Check | ผล |
| --- | --- |
| Production URL และชื่อหน้าเว็บถูกต้อง | ผ่าน |
| หน้าจอมีเนื้อหาและไม่มี framework error overlay | ผ่าน |
| Login จากเว็บไป API คนละโดเมน | ผ่าน |
| ค้นหาชื่อครูแล้วเห็นเฉพาะคอร์สที่ตรงกัน | ผ่าน |
| Student ลงทะเบียนแล้วเห็นข้อความยืนยันและจำนวนผู้เรียนเพิ่ม | ผ่าน |
| My learning และ session หลัง reload | ผ่าน |
| Production API smoke tests | ผ่าน 29 ข้อ |
| Runtime error logs ในช่วง 5 นาทีที่ตรวจ | 0 records |

ใช้ in-app browser ตรวจ production ใน viewport ของแอปปัจจุบัน (615px wide) และใช้ screenshot ยืนยัน enrollment/My learning; desktop/mobile 1440/390/320px ทดสอบในเครื่องในรอบก่อนแล้ว รอบ production นี้ไม่ได้ทดสอบครบทุก browser หรือทุก viewport

GitHub source repository: https://github.com/nongfresh8234-cloud/final-exam (Private), branch main; อัปโหลดผ่าน GitHub CLI และตรวจ remote แล้ว โดย .env, .data, .vercel, node_modules และ production secrets ถูกตัดออก

## สิ่งที่ยังเหลือสำหรับส่งงาน

1. ผู้ใช้เติมชื่อ รหัสนักศึกษา และ section
2. ผู้ใช้แนบลิงก์บันทึกหน้าจอและกล้องจริง
3. Repository เป็น Private จึงต้องให้ผู้ตรวจเข้าถึง repository ก่อนส่ง หากผู้ตรวจยังไม่มีสิทธิ์

## เอกสาร deployment ที่ตรวจประกอบ

- Vercel monorepos: https://vercel.com/docs/monorepos
- Vercel environment variables: https://vercel.com/docs/environment-variables
- MongoDB Atlas connection: https://www.mongodb.com/docs/atlas/connect-to-database-deployment/
