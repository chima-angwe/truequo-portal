import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClaimBlock from '../components/ClaimBlock';
import api from '../api/client';

export default function ReviewTask() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/tasks/${taskId}`).then((res) => setTask(res.data));
  }, [taskId]);

  async function handleDecision(status) {
    const res = await api.post(`/reviews/${taskId}`, { status, comments });
    navigate(`/cases/${res.data.task.case}`);
  }

  if (!task) return <div className="p-4 sm:p-6 lg:p-8 text-stone-400 text-sm">Loading…</div>;

  const checklistDone = task.checklist?.filter((i) => i.done).length || 0;
  const checklistTotal = task.checklist?.length || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl">
      <h1 className="font-serif italic text-2xl mb-1">Review Verification</h1>
      <p className="text-stone-500 text-sm mb-6 capitalize">{task.type} verification — submitted by {task.assignedTo?.name}</p>

      {task.reworkCount > 0 && (
        <div className="text-xs bg-rose-50 text-rose-700 rounded-lg p-2.5 mb-4">
          This task has been sent back for rework {task.reworkCount} time{task.reworkCount !== 1 ? 's' : ''} before.
        </div>
      )}

      <ClaimBlock task={task} title="What was claimed" />

      {checklistTotal > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
          <div className="text-xs text-stone-400 mb-2">Checklist ({checklistDone}/{checklistTotal})</div>
          <div className="space-y-1">
            {task.checklist.map((item, i) => (
              <div key={i} className={`text-sm flex items-center gap-2 ${item.done ? 'text-stone-700' : 'text-stone-400'}`}>
                <span>{item.done ? '✓' : '○'}</span> {item.label}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6 space-y-3 mb-4">
        <Row label="Contact person" value={task.findings?.contactPerson} />
        <Row label="Contact detail" value={task.findings?.contactDetail} />
        <Row label="Relationship" value={task.findings?.relationship} />
        <Row label="Matches claim" value={task.findings?.confirmed ? 'Yes' : 'No'} />
        <Row label="Notes" value={task.findings?.notes} />
      </div>

      {task.evidenceNotes?.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
          <div className="text-xs text-stone-400 mb-2">Evidence</div>
          {task.evidenceNotes.map((e, i) => (
            <div key={i} className="text-sm mb-1"><strong>{e.label}:</strong> {e.note}</div>
          ))}
        </div>
      )}

      <textarea
        value={comments} onChange={(e) => setComments(e.target.value)}
        placeholder="Review comments (optional, or required if sending back)" rows={2}
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gold"
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => handleDecision('approved')} className="bg-emerald-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-emerald-700">
          Approve
        </button>
        <button
          onClick={() => handleDecision('needs_rework')}
          disabled={!comments}
          className="bg-white border border-rose-300 text-rose-600 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send Back for Rework
        </button>
      </div>
      {!comments && <p className="text-xs text-stone-400 mt-2">Add a comment to explain what needs fixing before sending back.</p>}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm border-b border-stone-50 pb-2">
      <span className="text-stone-400">{label}</span>
      <span className="text-ink text-right min-w-0 break-words">{value || '—'}</span>
    </div>
  );
}
