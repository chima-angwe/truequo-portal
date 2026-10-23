import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  useEffect(() => { api.get('/dashboard').then((res) => setData(res.data)).catch(() => setError('We could not load the latest operation summary. Please refresh to try again.')); }, []);
  if (error) return <div className="empty-state" role="alert">{error}</div>;
  if (!data) return <div className="portal-loading">Loading your operation…</div>;

  const c = data.counts || {};
  const primary = [
    { label: 'Total cases', value: c.total, color: '#506bff', hint: 'Across your operation' },
    { label: 'Pending', value: c.pending, color: '#68736d', hint: 'Ready for assignment' },
    { label: 'In progress', value: c.inProgress, color: '#506bff', hint: 'Being verified now' },
    { label: 'Completed', value: c.completed, color: '#00a963', hint: 'Finished verification' },
  ];
  const attention = [
    ['Awaiting response', c.awaitingResponse, '#506bff'],
    ['Awaiting review', c.awaitingReview, '#506bff'],
    ['Needs rework', c.needsRework, '#b45342'],
    ['Escalated', c.escalated, '#b45342'],
    ['Overdue', c.overdue, '#b45342'],
  ];
  const firstName = user?.name?.split(' ')[0] || 'there';
  const roleName = user?.role === 'supervisor' ? 'review queue' : 'verification operation';

  return (
    <div className="max-w-6xl">
      <section className="page-heading">
        <div className="page-heading-copy"><div className="page-eyebrow">OPERATIONS OVERVIEW</div><h1 className="mt-2">Good day, {firstName}</h1><p className="page-subtitle">A clear view of what needs attention across your {roleName}.</p></div>
        {['operations', 'admin'].includes(user?.role) ? <Link to="/cases/new" className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800">+ New request</Link> : user?.role === 'supervisor' ? <Link to="/reviews" className="inline-flex items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-xs font-bold text-white hover:bg-stone-800">Open review queue →</Link> : null}
      </section>
      <section aria-label="Case totals" className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {primary.map((card) => <article className="stat-primary" key={card.label} style={{ '--stat-accent': card.color }}><div className="text-[10px] font-bold uppercase tracking-[.12em] text-stone-500">{card.label}</div><div className="mt-3 font-heading text-4xl font-extrabold tracking-tight text-ink">{card.value ?? 0}</div><div className="mt-1 text-[10px] text-stone-500">{card.hint}</div></article>)}
      </section>
      <section className="mb-8 rounded-xl border border-stone-200 bg-white p-4 sm:p-5" aria-labelledby="attention-title">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><h2 id="attention-title" className="text-sm font-bold">Needs attention</h2><p className="mt-1 text-[11px] text-stone-500">Items that may need a follow-up or decision.</p></div><Link to="/cases" className="text-[11px] font-bold text-gold hover:underline">Review cases →</Link></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{attention.map(([label, value, color]) => <div className="stat-secondary flex items-center justify-between gap-2" key={label}><span className="text-[10px] leading-4 text-stone-600">{label}</span><span className="text-lg font-extrabold tabular-nums" style={{ color }}>{value ?? 0}</span></div>)}</div>
      </section>
      <section className="overflow-hidden rounded-xl border border-stone-200 bg-white" aria-labelledby="recent-title">
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-4 sm:px-5"><div><h2 id="recent-title" className="text-sm font-bold">Recent cases</h2><p className="mt-1 text-[10px] text-stone-500">The latest requests added to your workspace.</p></div><Link to="/cases" className="text-[11px] font-bold text-gold hover:underline">View all →</Link></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead><tr className="text-left"><th className="px-4 py-3 sm:px-5">Case</th><th className="px-4 py-3 sm:px-5">Candidate</th><th className="px-4 py-3 sm:px-5">Client</th><th className="px-4 py-3 sm:px-5">Status</th></tr></thead><tbody>{data.recentCases?.map((row) => <tr key={row._id} className="border-b border-stone-100 hover:bg-stone-50"><td className="whitespace-nowrap px-4 py-3 sm:px-5"><Link to={`/cases/${row._id}`} className="font-bold text-gold">{row.caseNumber}</Link></td><td className="whitespace-nowrap px-4 py-3 font-semibold sm:px-5">{row.candidate?.name || '—'}</td><td className="whitespace-nowrap px-4 py-3 text-stone-500 sm:px-5">{row.client?.name || '—'}</td><td className="whitespace-nowrap px-4 py-3 sm:px-5"><StatusBadge status={row.status} /></td></tr>)}{!data.recentCases?.length && <tr><td colSpan="4" className="px-5 py-10 text-center text-xs text-stone-500">No cases yet. Create a request to start your verification pipeline.</td></tr>}</tbody></table></div>
      </section>
    </div>
  );
}
