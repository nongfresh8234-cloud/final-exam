import { Link } from 'react-router-dom';
export function Brand() { return <Link className="brand" to="/"><span className="brand-mark">c<span>o</span></span><span>course<span className="brand-dot">.</span></span></Link>; }
export function Notice({ children, success = false }) { return children ? <div className={`notice ${success ? 'success' : ''}`} role={success ? 'status' : 'alert'}>{children}</div> : null; }
export function Status({ status }) { return <span className={`status status-${status.toLowerCase()}`}><span />{status}</span>; }
export function Loading() { return <div className="loading" role="status"><span className="spinner" /> Loading your courses…</div>; }
export function Empty({ title, children }) { return <div className="empty"><span className="empty-icon">↗</span><h2>{title}</h2><p>{children}</p></div>; }
