import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClaimBlock from '../components/ClaimBlock';
import TaskDocuments from '../components/TaskDocuments';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PageSkeleton, Spinner } from '../components/LoadingFeedback';

function hasUnresolvedRejectedDocuments(documents = []) {
  return documents.some((document) => {
    if (document.reviewStatus !== 'rejected') return false;
    let current = document;
    const visited = new Set();
    while (current && current.reviewStatus === 'rejected') {
      const id = String(current._id);
      if (visited.has(id)) return true;
      visited.add(id);
      current = documents.find((candidate) => String(candidate.replacementFor) === id);
    }
    return !current || current.reviewStatus !== 'accepted';
  });
}

export default function ReviewTask() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [decisionLoading, setDecisionLoading] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/tasks/${taskId}`).then((res) => setTask(res.data)).catch((error) => setLoadError(error.response?.data?.error || 'This review could not be loaded. Please try again.'));
  }, [taskId]);

  async function handleDecision(status) {
    setDecisionError('');
    setDecisionLoading(status);
    try {
      const res = await api.post(`/reviews/${taskId}`, { status, comments });
      navigate(`/cases/${res.data.task.case}`);
    } catch (error) {
      setDecisionError(error.response?.data?.error || 'Unable to save this review. Please try again.');
    } finally {
      setDecisionLoading('');
    }
  }

  if (loadError) return <div className="p-4 sm:p-6 lg:p-8 max-w-xl"><div role="alert" className="loading-error">{loadError}</div></div>;
  if (!task) return <PageSkeleton variant="detail" title="Loading verification review" />;

  const checklistDone = task.checklist?.filter((i) => i.done).length || 0;
  const checklistTotal = task.checklist?.length || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl">
      <div className="page-heading"><div className="page-heading-copy"><div className="page-eyebrow">SUPERVISOR REVIEW</div><h1 className="mt-2">Review verification</h1><p className="page-subtitle capitalize">{task.type} check · submitted by {task.assignedTo?.name || 'verifier'}</p></div></div>

      {task.reworkCount > 0 && (
        <div className="text-xs bg-rose-50 text-rose-700 rounded-lg p-2.5 mb-4">
          This task has been sent back for rework {task.reworkCount} time{task.reworkCount !== 1 ? 's' : ''} before.
        </div>
      )}

      <ClaimBlock task={task} title="What was claimed" />

      <TaskDocuments task={task} canReview={['operations', 'supervisor', 'admin'].includes(user?.role)} onTaskChange={setTask} />

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

      {['supervisor', 'admin'].includes(user?.role) && <textarea
        value={comments} onChange={(e) => setComments(e.target.value)}
        placeholder="Review comments (optional, or required if sending back)" rows={2}
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gold"
      />}

      {['supervisor', 'admin'].includes(user?.role) && <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => handleDecision('approved')} disabled={Boolean(decisionLoading) || hasUnresolvedRejectedDocuments(task.documents)} className="bg-emerald-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed">
          {decisionLoading === 'approved' ? <Spinner label="Approving…" className="text-white" /> : 'Approve'}
        </button>
        <button
          onClick={() => handleDecision('needs_rework')}
          disabled={!comments || Boolean(decisionLoading)}
          className="bg-white border border-rose-300 text-rose-600 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {decisionLoading === 'needs_rework' ? <Spinner label="Sending back…" /> : 'Send Back for Rework'}
        </button>
      </div>}
      {user?.role === 'operations' && <p className="text-xs text-stone-400 mt-3">You can review documents here. A supervisor or admin completes the task decision.</p>}
      {hasUnresolvedRejectedDocuments(task.documents) && <p className="text-xs text-rose-600 mt-2">A rejected document needs an uploaded replacement, and that replacement must be accepted before you can approve.</p>}
      {decisionError && <p className="text-xs text-rose-600 mt-2" role="alert">{decisionError}</p>}
      {['supervisor', 'admin'].includes(user?.role) && !comments && <p className="text-xs text-stone-400 mt-2">Add a comment to explain what needs fixing before sending back.</p>}
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
