import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function ClientOverview() {
  const [cases, setCases] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  useEffect(() => { api.get('/cases').then((res) => setCases(res.data)).catch((err) => setError(err.response?.data?.error || 'Your overview could not be loaded.')); }, []);
  if (error) return <div className="empty-state" role="alert">{error}</div>;
  if (!cases) return <div className="portal-loading">Loading your cases…</div>;
  const counts = { active: cases.filter((c) => c.status !== 'completed').length, inProgress: cases.filter((c) => c.status === 'in_progress').length, review: cases.filter((c) => c.status === 'awaiting_review').length, completed: cases.filter((c) => c.status === 'completed').length };
  const cards = [['Open requests', counts.active, '#506bff'], ['In progress', counts.inProgress, '#506bff'], ['Awaiting review', counts.review, '#00a963'], ['Completed', counts.completed, '#00a963']];
  return <div className="max-w-6xl"><section className="page-heading"><div className="page-heading-copy"><div className="page-eyebrow">CLIENT WORKSPACE</div><h1 className="mt-2">Welcome, {user?.name?.split(' ')[0] || 'back'}</h1><p className="page-subtitle">A straightforward view of your verification requests and their progress.</p></div><Link to="/cases/new" className="inline-flex shrink-0 items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-xs font-bold text-white">+ New request</Link></section>
    <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,color]) => <article className="stat-primary" key={label} style={{'--stat-accent':color}}><div className="text-[10px] font-bold uppercase tracking-[.12em] text-stone-500">{label}</div><div className="mt-3 text-4xl font-extrabold tracking-tight text-ink">{value}</div></article>)}</div>
    <section className="overflow-hidden rounded-xl border border-stone-200 bg-white"><div className="flex items-center justify-between border-b border-stone-200 px-4 py-4 sm:px-5"><div><h2 className="text-sm font-bold">Latest requests</h2><p className="mt-1 text-[10px] text-stone-500">Your most recent verification activity.</p></div><Link to="/cases" className="text-[11px] font-bold text-gold">All cases →</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead><tr className="text-left"><th className="px-4 py-3 sm:px-5">Case</th><th className="px-4 py-3 sm:px-5">Candidate</th><th className="px-4 py-3 sm:px-5">Due</th><th className="px-4 py-3 sm:px-5">Status</th></tr></thead><tbody>{cases.slice(0,8).map((c) => <tr key={c._id} className="border-b border-stone-100"><td className="whitespace-nowrap px-4 py-3 sm:px-5"><Link className="font-bold text-gold" to={`/cases/${c._id}`}>{c.caseNumber}</Link></td><td className="whitespace-nowrap px-4 py-3 font-semibold sm:px-5">{c.candidate?.name}</td><td className="whitespace-nowrap px-4 py-3 text-stone-500 sm:px-5">{c.dueDate ? new Date(c.dueDate).toLocaleDateString() : '—'}</td><td className="whitespace-nowrap px-4 py-3 sm:px-5"><StatusBadge status={c.status} /></td></tr>)}{!cases.length && <tr><td colSpan="4" className="px-5 py-12 text-center text-xs text-stone-500">No requests submitted yet. Create your first request to get started.</td></tr>}</tbody></table></div></section>
  </div>;
}
