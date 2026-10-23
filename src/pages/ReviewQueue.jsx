import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';

export default function ReviewQueue() {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/tasks', { params: { status: 'awaiting_review' } }).then((res) => setTasks(res.data)).catch(() => setError('The review queue could not be loaded.')); }, []);
  if (error) return <div className="empty-state" role="alert">{error}</div>;
  if (!tasks) return <div className="portal-loading">Loading the review queue…</div>;
  return <div className="max-w-6xl"><section className="page-heading"><div className="page-heading-copy"><div className="page-eyebrow">SUPERVISOR WORKSPACE</div><h1 className="mt-2">Review queue</h1><p className="page-subtitle">Verify submitted findings and return work with a clear reason when it needs another pass.</p></div><span className="rounded-full bg-white px-3 py-2 text-[11px] font-bold text-stone-600">{tasks.length} waiting</span></section>
    <div className="grid gap-3">{tasks.map((task) => <article key={task._id} className="data-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold">{task.case?.candidate?.name || 'Candidate'} <span className="font-medium text-stone-500">· {task.type} check</span></h2><StatusBadge status={task.status} /></div><div className="mt-1 text-xs text-stone-500">{task.case?.caseNumber} · {task.case?.client?.name} · Submitted by {task.assignedTo?.name || 'Verifier'}</div><div className="mt-2 truncate text-xs text-stone-600">{(task.findings?.notes || 'No verifier notes were added.').slice(0, 180)}</div></div><Link to={`/tasks/${task._id}/review`} className="inline-flex shrink-0 items-center justify-center rounded-lg bg-ink px-4 py-2.5 text-xs font-bold text-white">Review check →</Link></article>)}{tasks.length === 0 && <div className="empty-state"><div className="font-bold text-ink">Nothing to review</div><div className="mt-1 text-xs">New submissions will appear in this queue.</div></div>}</div>
  </div>;
}
