
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import ClaimBlock from '../components/ClaimBlock';
import { useAuth } from '../context/AuthContext';

const PENDING_REASONS = [
  'awaiting_candidate', 'awaiting_employer', 'awaiting_institution',
  'awaiting_guarantor', 'awaiting_field_agent', 'awaiting_client_information',
  'external_partner_response', 'other',
];

export default function CaseDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [openForm, setOpenForm] = useState(null); // { taskId, type: 'pending' | 'escalate' }
  const [pendingForm, setPendingForm] = useState({ reason: '', note: '', nextFollowUpDate: '' });
  const [escalateForm, setEscalateForm] = useState({ description: '', assignedTeam: '', nextAction: '' });
  const { user } = useAuth();

  function load() {
    api.get(`/cases/${id}`).then((res) => setData(res.data));
  }

  useEffect(() => { load(); }, [id]);

  if (!data) return <div className="p-4 sm:p-6 lg:p-8 text-stone-400 text-sm">Loading…</div>;
  const { case: c, tasks } = data;

  async function submitPending(taskId) {
    await api.patch(`/tasks/${taskId}/pending`, pendingForm);
    setOpenForm(null);
    setPendingForm({ reason: '', note: '', nextFollowUpDate: '' });
    load();
  }

  async function submitEscalate(taskId) {
    await api.patch(`/tasks/${taskId}/escalate`, escalateForm);
    setOpenForm(null);
    setEscalateForm({ description: '', assignedTeam: '', nextAction: '' });
    load();
  }

  async function resolveEscalation(taskId) {
    await api.patch(`/tasks/${taskId}/resolve-escalation`);
    load();
  }

  function actionFor(task) {
    const actions = [];
    if (task.status === 'unassigned' && ['operations', 'admin'].includes(user.role)) {
      actions.push(<Link key="assign" to={`/tasks/${task._id}/assign`} className="text-xs text-gold hover:underline">Assign →</Link>);
    }
    if (['assigned', 'in_progress', 'needs_rework'].includes(task.status) && user.role === 'verifier') {
      actions.push(<Link key="work" to={`/tasks/${task._id}/verify`} className="text-xs text-gold hover:underline">{task.status === 'needs_rework' ? 'Rework →' : 'Work on this →'}</Link>);
    }
    if (task.status === 'awaiting_review' && ['supervisor', 'admin'].includes(user.role)) {
      actions.push(<Link key="review" to={`/tasks/${task._id}/review`} className="text-xs text-gold hover:underline">Review →</Link>);
    }
    if (['assigned', 'in_progress', 'awaiting_information', 'awaiting_response'].includes(task.status) && ['operations', 'verifier', 'admin'].includes(user.role)) {
      actions.push(<button key="pending" onClick={() => setOpenForm({ taskId: task._id, type: 'pending' })} className="text-xs text-stone-500 hover:underline">Mark Pending</button>);
    }
    if (task.status !== 'escalated' && task.status !== 'approved' && ['operations', 'verifier', 'admin', 'supervisor'].includes(user.role)) {
      actions.push(<button key="escalate" onClick={() => setOpenForm({ taskId: task._id, type: 'escalate' })} className="text-xs text-red-500 hover:underline">Flag Issue</button>);
    }
    if (task.status === 'escalated' && ['operations', 'admin', 'supervisor'].includes(user.role)) {
      actions.push(<button key="resolve" onClick={() => resolveEscalation(task._id)} className="text-xs text-emerald-600 hover:underline">Resolve</button>);
    }
    return actions;
  }

  const allApproved = tasks.every((t) => t.status === 'approved');
  const dueSoon = c.dueDate && new Date(c.dueDate) < new Date() && c.status !== 'completed';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <div className="page-eyebrow">CASE {c.caseNumber}</div>
        <h1 className="font-serif italic text-2xl mt-1">{c.candidate?.name}</h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-sm text-stone-500">{c.client?.name}</span>
          <StatusBadge status={c.status} />
          {dueSoon && <span className="text-xs text-red-500 font-medium">Overdue</span>}
          {c.dueDate && <span className="text-xs text-stone-400">Due {new Date(c.dueDate).toLocaleDateString()}</span>}
          {allApproved && (
            <Link to={`/cases/${c._id}/report`} className="text-xs text-gold hover:underline">View final report →</Link>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((t) => {
          const checklistDone = t.checklist?.filter((i) => i.done).length || 0;
          const checklistTotal = t.checklist?.length || 0;

          return (
            <div key={t._id} className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
                <div>
                  <div className="font-medium capitalize text-sm">{t.type} Verification</div>
                  {t.assignedTo && <div className="text-xs text-stone-400 mt-0.5">Assigned to {t.assignedTo.name}</div>}
                  {t.reviewer && <div className="text-xs text-stone-400">Reviewer: {t.reviewer.name}</div>}
                </div>
                <div className="flex items-center gap-3 flex-wrap sm:justify-end">
                  <StatusBadge status={t.status} />
                  {actionFor(t)}
                </div>
              </div>

              <ClaimBlock task={t} />

              {checklistTotal > 0 && (
                <div className="text-xs text-stone-500 mb-2">Checklist: {checklistDone}/{checklistTotal} complete</div>
              )}

              {t.pending?.reason && (
                <div className="text-xs bg-orange-50 text-orange-700 rounded-lg p-2.5 mb-2">
                  Pending — {t.pending.reason.replace(/_/g, ' ')}
                  {t.pending.note && <span className="block mt-0.5 text-orange-600">{t.pending.note}</span>}
                  {t.pending.nextFollowUpDate && (
                    <span className="block mt-0.5">Next follow-up: {new Date(t.pending.nextFollowUpDate).toLocaleDateString()}</span>
                  )}
                </div>
              )}

              {t.externalParty?.name && (
                <div className="text-xs bg-stone-50 text-stone-600 rounded-lg p-2.5 mb-2">
                  Waiting on: {t.externalParty.name} ({t.externalParty.type?.replace(/_/g, ' ')}) — {t.externalParty.attempts} attempt{t.externalParty.attempts !== 1 ? 's' : ''}
                </div>
              )}

              {t.issue?.description && !t.issue.resolvedAt && (
                <div className="text-xs bg-red-50 text-red-700 rounded-lg p-2.5 mb-2">
                  <strong>Issue:</strong> {t.issue.description}
                  {t.issue.assignedTeam && <span className="block mt-0.5">Assigned to: {t.issue.assignedTeam}</span>}
                  {t.issue.nextAction && <span className="block mt-0.5">Next action: {t.issue.nextAction}</span>}
                </div>
              )}

              {t.findings?.notes && (
                <div className="text-sm text-stone-600 bg-stone-50 rounded-lg p-3 mb-3">{t.findings.notes}</div>
              )}

              {openForm?.taskId === t._id && openForm.type === 'pending' && (
                <div className="action-panel mb-3 space-y-2">
                  <select
                    value={pendingForm.reason} onChange={(e) => setPendingForm({ ...pendingForm, reason: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                  >
                    <option value="">Select reason…</option>
                    {PENDING_REASONS.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                  </select>
                  <input
                    placeholder="Note (optional)" value={pendingForm.note}
                    onChange={(e) => setPendingForm({ ...pendingForm, note: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="date" value={pendingForm.nextFollowUpDate}
                    onChange={(e) => setPendingForm({ ...pendingForm, nextFollowUpDate: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => submitPending(t._id)} disabled={!pendingForm.reason} className="bg-ink text-paper text-xs px-3 py-1.5 rounded-lg disabled:opacity-40">Save</button>
                    <button onClick={() => setOpenForm(null)} className="text-xs text-stone-500">Cancel</button>
                  </div>
                </div>
              )}

              {openForm?.taskId === t._id && openForm.type === 'escalate' && (
                <div className="action-panel action-panel--danger mb-3 space-y-2">
                  <input
                    placeholder="What went wrong?" value={escalateForm.description}
                    onChange={(e) => setEscalateForm({ ...escalateForm, description: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Assigned team (optional)" value={escalateForm.assignedTeam}
                    onChange={(e) => setEscalateForm({ ...escalateForm, assignedTeam: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                  <input
                    placeholder="Next action (optional)" value={escalateForm.nextAction}
                    onChange={(e) => setEscalateForm({ ...escalateForm, nextAction: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => submitEscalate(t._id)} disabled={!escalateForm.description} className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-40">Escalate</button>
                    <button onClick={() => setOpenForm(null)} className="text-xs text-stone-500">Cancel</button>
                  </div>
                </div>
              )}

              <div className="border-t border-stone-100 pt-3 mt-3">
                <div className="text-xs text-stone-400 mb-2">Activity</div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {t.activityLog?.slice().reverse().map((log, idx) => (
                    <div key={idx} className="text-xs text-stone-500 flex justify-between gap-3">
                      <span>{log.message}</span>
                      <span className="whitespace-nowrap">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
