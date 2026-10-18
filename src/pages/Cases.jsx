import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

const FILTERS = ['all', 'pending', 'in_progress', 'awaiting_review', 'needs_rework', 'escalated', 'completed'];

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = filter === 'all' ? {} : { status: filter };
    api.get('/cases', { params }).then((res) => setCases(res.data));
  }, [filter]);

  const visible = cases.filter((c) =>
    c.candidate?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="font-serif italic text-2xl">Cases</h1>
        <Link to="/cases/new" className="bg-ink text-paper rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap hover:bg-stone-800">
          + New Request
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${
                filter === f ? 'bg-ink text-paper' : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <input
          placeholder="Search candidate…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm w-full md:w-56 md:shrink-0 focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="text-left text-xs text-stone-400 border-b border-stone-100">
              <th className="px-3 sm:px-5 py-2.5 font-normal">Case</th>
              <th className="px-3 sm:px-5 py-2.5 font-normal">Candidate</th>
              <th className="px-3 sm:px-5 py-2.5 font-normal">Checking</th>
              <th className="px-3 sm:px-5 py-2.5 font-normal">Client</th>
              <th className="px-3 sm:px-5 py-2.5 font-normal">Due</th>
              <th className="px-3 sm:px-5 py-2.5 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => (
              <tr key={c._id} className="border-b border-stone-50 hover:bg-stone-50">
                <td className="px-3 sm:px-5 py-3">
                  <Link to={`/cases/${c._id}`} className="text-gold hover:underline">{c.caseNumber}</Link>
                </td>
                <td className="px-3 sm:px-5 py-3">{c.candidate?.name}</td>
                <td className="px-3 sm:px-5 py-3">
                  {(c.summary || []).map((t, i) => (
                    <div key={i} className="text-xs leading-snug mb-1 last:mb-0">
                      <span className="capitalize text-stone-700 font-medium">{t.type}</span>
                      {t.headline && <span className="text-stone-500"> — {t.headline}</span>}
                    </div>
                  ))}
                </td>
                <td className="px-3 sm:px-5 py-3 text-stone-500">{c.client?.name}</td>
                <td className="px-3 sm:px-5 py-3 text-stone-500">
                  {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-3 sm:px-5 py-3"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={6} className="px-3 sm:px-5 py-8 text-center text-stone-400 text-sm">No cases found</td></tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
