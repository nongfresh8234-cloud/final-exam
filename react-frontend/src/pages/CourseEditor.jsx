import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useResource } from '../hooks/useResource';
import { api } from '../lib/api';
import { Loading, Notice } from '../components/UI';
export default function CourseEditor() {
  const { id } = useParams();
  return id ? <ExistingCourse id={id} /> : <EditorForm />;
}
function ExistingCourse({ id }) {
  const { data, loading, error } = useResource(`/course/${id}`);
  if (loading) return <Loading />;
  if (error) return <><Link className="back-link" to="/">← Back to courses</Link><Notice>{error}</Notice></>;
  return <EditorForm course={data.course} />;
}
function EditorForm({ course }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const fields = new FormData(event.currentTarget);
    const payload = {
      name: fields.get('name'), duration: Number(fields.get('duration')), price: Number(fields.get('price')),
      maxStudents: Number(fields.get('maxStudents')), status: fields.get('status'),
      topics: fields.get('topics').split('\n').map(value => value.trim()).filter(Boolean),
    };
    try {
      const data = await api(`/course${course ? `/${course.id}` : ''}`, { method: course ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      navigate(`/courses/${data.course.id}`);
    } catch (error) { setError(error.message); } finally { setBusy(false); }
  }
  return <div className="editor-wrap"><Link className="back-link" to={course ? `/courses/${course.id}` : '/'}>← Back to {course ? 'course' : 'courses'}</Link><section className="page-heading"><div><span className="eyebrow">SHARE WHAT YOU KNOW</span><h1>{course ? 'Edit your course.' : 'Create something worth learning.'}</h1><p>{course ? 'Keep your course details up to date.' : 'A great learning experience begins with you.'}</p></div></section><form className="editor-form" onSubmit={submit}><Notice>{error}</Notice><label>Course name<input name="name" defaultValue={course?.name || ''} placeholder="e.g. Modern Web Development" maxLength={120} required /></label><div className="form-grid"><label>Duration (days)<input name="duration" type="number" min="1" max="3650" step="1" defaultValue={course?.duration || 14} required /></label><label>Price (THB)<input name="price" type="number" min="0" max="10000000" step="0.01" defaultValue={course?.price ?? 0} required /></label><label>Max students<input name="maxStudents" type="number" min={Math.max(1, course?.enrolledCount || 0)} max="10000" step="1" defaultValue={course?.maxStudents || 20} required /><small>Cannot be below the number already enrolled.</small></label><label>Course status<select name="status" defaultValue={course?.status || 'Open'}><option value="Open">Open — accepting students</option><option value="Close">Close — visible, enrollment closed</option><option value="Cancel">Cancel — hidden from students</option></select></label></div><label>Topics<textarea name="topics" rows="5" placeholder={'Introduction\nCore concepts\nHands-on project'} defaultValue={course?.topics.join('\n') || ''} required /><small>One topic per line. Up to 30 topics.</small></label><div className="form-actions"><Link to={course ? `/courses/${course.id}` : '/'} className="button secondary">Cancel</Link><button className="button primary" disabled={busy}>{busy ? 'Saving…' : course ? 'Save changes ↗' : 'Create course ↗'}</button></div></form></div>;
}
