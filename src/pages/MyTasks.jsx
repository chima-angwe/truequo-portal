import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function headline(t) {
  return (t.claim || []).map((c) => c.value).filter(Boolean).slice(0, 2).join(' · ');
}

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/tasks/my/assignments').then((res) => setTasks(res.data)).catch(() => setError('Assignments could not be loaded. Please refresh to try again.'));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="page-heading"><div className="page-heading-copy"><div className="page-eyebrow">VERIFIER WORKSPACE</div><h1 className="mt-2">My assignments</h1><p className="page-subtitle">Your assigned checks, ordered for quick review.</p></div></div>
      {error && <div role="alert" className="empty-state">{error}</div>}

      <div className="space-y-3">
        {tasks.map((t) => (
          <Link
            key={t._id} to={`/tasks/${t._id}/verify`}
            className="data-panel block p-4 transition hover:border-gold sm:p-5"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div>
                <div className="font-medium text-sm">{t.case?.candidate?.name}</div>
                <div className="text-xs text-stone-400 capitalize mt-0.5">{t.type} verification — {t.case?.client?.name}</div>
                {headline(t) && <div className="text-xs text-stone-600 mt-1">{headline(t)}</div>}
              </div>
              <div className="text-xs text-stone-400">
                Due {t.case?.dueDate ? new Date(t.case.dueDate).toLocaleDateString() : '—'}
              </div>
            </div>
          </Link>
        ))}
        {tasks.length === 0 && (
          <div className="empty-state">No assignments right now. New work will appear here when it is assigned to you.</div>
        )}
      </div>
    </div>
  );
}
