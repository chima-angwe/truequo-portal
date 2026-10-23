import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const FILTERS = ['all', 'pending', 'in_progress', 'awaiting_review', 'needs_rework', 'escalated', 'completed'];

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    setLoading(true); setError('');
    api.get('/cases', { params: filter === 'all' ? {} : { status: filter } })
      .then((res) => setCases(res.data)).catch((err) => setError(err.response?.data?.error || 'Cases could not be loaded. Please try again.'))
      .finally(() => setLoading(false));
  }, [filter]);

  const term = search.trim().toLowerCase();
  const visible = cases.filter((c) => [c.caseNumber, c.candidate?.name, c.client?.name, ...(c.summary || []).map((t) => `${t.type} ${t.headline || ''}`)].join(' ').toLowerCase().includes(term));
  const canCreate = ['operations', 'admin', 'client'].includes(user?.role);

  return (
    <div className="max-w-6xl">
      <section className="page-heading"><div className="page-heading-copy"><div className="page-eyebrow">CASE MANAGEMENT</div><h1 className="mt-2">{user?.role === 'client' ? 'My cases' : 'Cases'}</h1><p className="page-subtitle">{user?.role === 'client' ? 'Track the progress of your submitted verification requests.' : 'Search, filter, and open a case to see its checks and next steps.'}</p></div>{canCreate && <Link to="/cases/new" className="inline-flex shrink-0 items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-xs font-bold text-white">+ New request</Link>}</section>
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter cases by status">{FILTERS.map((f) => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`rounded-full border px-3 py-2 text-[10px] font-bold capitalize transition ${filter === f ? 'border-ink bg-ink text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>{f.replace(/_/g, ' ')}</button>)}</div>
        <label className="sr-only" htmlFor="case-search">Search cases</label><input id="case-search" type="search" placeholder="Search case, candidate or client…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-xs xl:w-72 xl:shrink-0" />
      </div>
      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white"><div className="overflow-x-auto"><table className="case-table w-full text-sm"><thead><tr className="text-left"><th className="px-4 py-3 sm:px-5">Case</th><th className="px-4 py-3 sm:px-5">Candidate</th><th className="px-4 py-3 sm:px-5">Checks</th><th className="px-4 py-3 sm:px-5">Client</th><th className="px-4 py-3 sm:px-5">Due</th><th className="px-4 py-3 sm:px-5">Status</th></tr></thead><tbody>
        {visible.map((c) => <tr key={c._id} className="border-b border-stone-100 hover:bg-stone-50"><td className="case-number px-4 py-4 sm:px-5"><Link to={`/cases/${c._id}`}>{c.caseNumber}</Link></td><td className="candidate-cell px-4 py-4 sm:px-5">{c.candidate?.name || '—'}</td><td className="checking-cell px-4 py-3 sm:px-5">{(c.summary || []).length ? c.summary.map((t, i) => <div key={`${t.type}-${i}`}><span className="font-bold capitalize text-stone-700">{t.type}</span>{t.headline && <span className="text-stone-500"> · {t.headline}</span>}</div>) : <span className="text-stone-400">No check details</span>}</td><td className="client-cell px-4 py-4 text-stone-500 sm:px-5">{c.client?.name || '—'}</td><td className="due-cell px-4 py-4 text-stone-500 sm:px-5">{c.dueDate ? new Date(c.dueDate).toLocaleDateString() : '—'}</td><td className="status-cell px-4 py-4 sm:px-5"><StatusBadge status={c.status} /></td></tr>)}
        {!loading && visible.length === 0 && <tr><td colSpan="6" className="px-5 py-12 text-center"><div className="font-bold text-ink">No cases found</div><div className="mt-1 text-xs text-stone-500">Try another search or status filter.</div></td></tr>}
        {loading && <tr><td colSpan="6" className="px-5 py-12 text-center text-xs text-stone-500">Loading cases…</td></tr>}
      </tbody></table></div></div>
    </div>
  );
}
