import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useUser } from './context/UserContext';
import Layout from './components/Layout';
import { Loading } from './components/UI';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import CourseDetail from './pages/CourseDetail';
import CourseEditor from './pages/CourseEditor';
import './App.css';
function Protected({ teacher = false, children }) {
  const { user, loading } = useUser();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (teacher && user.role !== 'Teacher') return <Navigate to="/" replace />;
  return children;
}
export default function App() {
  return <HashRouter><Routes><Route path="/login" element={<Login />} /><Route element={<Protected><Layout /></Protected>}><Route index element={<Catalog key="catalog" />} /><Route path="enrolled" element={<Catalog key="enrolled" enrolled />} /><Route path="courses/new" element={<Protected teacher><CourseEditor /></Protected>} /><Route path="courses/:id/edit" element={<Protected teacher><CourseEditor /></Protected>} /><Route path="courses/:id" element={<CourseDetail />} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></HashRouter>;
}
