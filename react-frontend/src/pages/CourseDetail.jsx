import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useResource } from '../hooks/useResource';
import { Loading, Notice, Status } from '../components/UI';
import { api, money } from '../lib/api';
export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useResource(`/course/${id}`);
  const [action, setAction] = useState({ busy: false, error: '', success: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const teacher = user.role === 'Teacher';
  async function enroll() {
    setAction({ busy: true, error: '', success: '' });
    try {
      await api(`/course/${id}/enroll`, { method: 'POST' });
      setAction({ busy: false, error: '', success: 'You’re in! Your enrollment is confirmed.' }); reload();
    } catch (error) { setAction({ busy: false, error: error.message, success: '' }); reload(); }
  }
  async function remove() {
    setAction({ busy: true, error: '', success: '' });
    try { await api(`/course/${id}`, { method: 'DELETE' }); navigate('/'); }
    catch (error) { setAction({ busy: false, error: error.message, success: '' }); setConfirmDelete(false); reload(); }
  }
  const course = data?.course;
  return <><Link className="back-link" to="/">← Back to courses</Link><Notice>{error || action.error}</Notice><Notice success>{action.success}</Notice>{loading ? <Loading /> : course ? <><section className="detail-heading"><div><Status status={course.status} /><h1>{course.name}</h1><p>A course by <strong>{course.teacherName}</strong></p></div>{teacher && <Link className="button primary" to={`/courses/${id}/edit`}>Edit course ↗</Link>}</section><div className="detail-grid"><div><section className="detail-section"><span className="eyebrow">THE CURRICULUM</span><h2>What you’ll explore</h2><ol className="curriculum">{course.topics.map((topic, index) => <li key={topic}><span>{String(index + 1).padStart(2, '0')}</span><strong>{topic}</strong></li>)}</ol></section>{teacher && <section className="detail-section"><h2>Enrolled students <span className="count">{course.enrolledCount}</span></h2>{course.students.length ? <div className="table-scroll"><table><thead><tr><th>Student</th><th>Email</th></tr></thead><tbody>{course.students.map(student => <tr key={student.id}><td>{student.username}</td><td>{student.email}</td></tr>)}</tbody></table></div> : <p className="muted">No students have enrolled yet.</p>}</section>}</div><aside className="enrollment-panel"><span className="eyebrow">YOUR NEXT STEP</span><h2 className="detail-price">{money(course.price)}</h2><dl><div><dt>Duration</dt><dd>{course.duration} days</dd></div><div><dt>Class capacity</dt><dd>{course.maxStudents} students</dd></div><div><dt>Enrolled</dt><dd>{course.enrolledCount} students</dd></div><div><dt>Seats available</dt><dd>{course.seatsAvailable}</dd></div></dl>{teacher ? <><p className="muted">Only courses with no enrolled students can be deleted.</p>{confirmDelete ? <div className="delete-confirm" role="alert"><p>Delete this course permanently?</p><div className="button-row"><button className="button danger" onClick={remove} disabled={action.busy}>{action.busy ? 'Deleting…' : 'Confirm delete'}</button><button className="button secondary" onClick={() => setConfirmDelete(false)} disabled={action.busy}>Keep course</button></div></div> : <button className="button danger-outline full" disabled={course.enrolledCount > 0 || action.busy} onClick={() => setConfirmDelete(true)}>Delete course</button>}</> : <><button className="button primary full" onClick={enroll} disabled={action.busy || course.isEnrolled || course.status !== 'Open' || course.seatsAvailable < 1}>{action.busy ? 'Enrolling…' : course.isEnrolled ? '✓ You’re enrolled' : course.status !== 'Open' ? 'Enrollment closed' : course.seatsAvailable < 1 ? 'Course is full' : 'Enroll in this course ↗'}</button><p className="enroll-note">{course.isEnrolled ? 'Find this course in My learning.' : course.status === 'Open' && course.seatsAvailable > 0 ? 'Your next chapter is one click away.' : 'Explore other courses to keep learning.'}</p></>}</aside></div></> : !error && <p>Course not found.</p>}</>;
}
