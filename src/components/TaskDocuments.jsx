import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './LoadingFeedback';

const ALLOWED_TYPES = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENTS = 10;

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getErrorMessage(error) {
  return error.response?.data?.error || error.message || 'Something went wrong. Please try again.';
}

function Status({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700',
    accepted: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-rose-50 text-rose-700',
  };
  const labels = { pending: 'Pending review', accepted: 'Accepted', rejected: 'Needs replacement' };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[status] || styles.pending}`}>{labels[status] || labels.pending}</span>;
}

export default function TaskDocuments({ task, canUpload = false, canReview = false, onTaskChange }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState(task?.documents || []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [activeAction, setActiveAction] = useState('');

  useEffect(() => setDocuments(task?.documents || []), [task]);

  async function refreshTask() {
    const response = await api.get(`/tasks/${task._id}`);
    setDocuments(response.data.documents || []);
    onTaskChange?.(response.data);
  }

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    setError('');
    if (!files.length) return;
    if (documents.length + files.length > MAX_DOCUMENTS) {
      setError('A task can have at most 10 documents. Remove a document before adding more.');
      return;
    }

    for (const file of files) {
      const extension = `.${file.name.split('.').pop()}`.toLowerCase();
      if (!ALLOWED_TYPES[extension] || file.type !== ALLOWED_TYPES[extension]) {
        setError(`${file.name}: upload a PDF, JPG, PNG, DOC or DOCX file.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name}: file is too large. Maximum file size is 5 MB.`);
        return;
      }
    }

    setBusy(true);
    try {
      for (const [index, file] of files.entries()) {
        const body = new FormData();
        body.append('file', file);
        setProgress({ name: file.name, percent: 0, index, total: files.length });
        await api.post(`/tasks/${task._id}/documents`, body, {
          onUploadProgress: (event) => {
            if (event.total) setProgress({ name: file.name, percent: Math.round((event.loaded * 100) / event.total), index, total: files.length });
          },
        });
        await refreshTask();
      }
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function download(document) {
    setError('');
    setActiveAction(`download:${document._id}`);
    try {
      const response = await api.get(`/tasks/${task._id}/documents/${document._id}/download`, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(response.data);
      const link = window.document.createElement('a');
      link.href = objectUrl;
      link.download = document.filename;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      setError(getErrorMessage(downloadError));
    } finally { setActiveAction(''); }
  }

  async function remove(document) {
    setBusy(true);
    setActiveAction(`delete:${document._id}`);
    setError('');
    try {
      await api.delete(`/tasks/${task._id}/documents/${document._id}`);
      await refreshTask();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setBusy(false);
      setActiveAction('');
    }
  }

  async function review(document, status) {
    const note = reviewNotes[document._id] || '';
    if (status === 'rejected' && !note.trim()) {
      setError('Add a note explaining what needs replacement.');
      return;
    }
    setBusy(true);
    setActiveAction(`${status}:${document._id}`);
    setError('');
    try {
      await api.patch(`/tasks/${task._id}/documents/${document._id}/review`, { status, note });
      await refreshTask();
    } catch (reviewError) {
      setError(getErrorMessage(reviewError));
    } finally {
      setBusy(false);
      setActiveAction('');
    }
  }

  const roleCanDelete = (document) =>
    task.status !== 'approved' &&
    (['operations', 'admin'].includes(user?.role) || String(document.uploadedBy?._id || document.uploadedBy) === String(user?.id || user?._id));

  return (
    <section className="bg-white border border-stone-200 rounded-xl p-4 mb-4" aria-label="Task documents">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-medium text-ink">Documents</h2>
          <p className="text-[11px] text-stone-400 mt-0.5">PDF, JPG, PNG, DOC or DOCX · up to 5 MB each · 10 per task</p>
        </div>
        {canUpload && task.status !== 'approved' && documents.length < MAX_DOCUMENTS && (
          <label className={`cursor-pointer text-xs bg-stone-100 px-3 py-2 rounded-lg hover:bg-stone-200 ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
            {busy ? <Spinner label="Uploading…" /> : 'Add documents'}
            <input className="sr-only" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" disabled={busy} onChange={handleUpload} />
          </label>
        )}
      </div>

      {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg p-2.5 mb-3" role="alert">{error}</p>}
      {progress && <div className="mb-3 text-xs text-stone-500" role="status">Uploading {progress.name} ({progress.index + 1}/{progress.total}) · {progress.percent}%<div className="h-1.5 bg-stone-100 rounded-full mt-1 overflow-hidden"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress.percent}%` }} /></div></div>}

      {!documents.length ? (
        <p className="text-xs text-stone-400">No documents uploaded.</p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {documents.map((document) => (
            <li key={document._id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-ink font-medium break-all">{document.filename}</span>
                    <Status status={document.reviewStatus} />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">{formatSize(document.size)} · Added by {document.uploadedBy?.name || 'team member'} · {new Date(document.uploadedAt).toLocaleString()}</p>
                  {document.reviewedBy?.name && <p className="text-[11px] text-stone-400 mt-0.5">Reviewed by {document.reviewedBy.name}{document.reviewedAt ? ` · ${new Date(document.reviewedAt).toLocaleString()}` : ''}</p>}
                  {document.reviewStatus === 'rejected' && document.reviewNote && <p className="text-xs text-rose-700 bg-rose-50 rounded-lg p-2 mt-2">{document.reviewNote}</p>}
                  {document.replacementFor && <p className="text-[11px] text-stone-400 mt-1">Uploaded as a replacement document.</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button type="button" disabled={Boolean(activeAction)} onClick={() => download(document)} className="text-xs text-gold hover:underline disabled:opacity-50">{activeAction === `download:${document._id}` ? <Spinner label="Downloading…" /> : 'Download'}</button>
                  {roleCanDelete(document) && <button type="button" disabled={busy} onClick={() => remove(document)} className="text-xs text-rose-500 hover:underline disabled:opacity-40">{activeAction === `delete:${document._id}` ? <Spinner label="Deleting…" /> : 'Delete'}</button>}
                </div>
              </div>
              {canReview && document.reviewStatus === 'pending' && (
                <div className="mt-3 space-y-2">
                  <textarea rows={2} value={reviewNotes[document._id] || ''} onChange={(event) => setReviewNotes((current) => ({ ...current, [document._id]: event.target.value }))} placeholder="Required note if this document needs replacement" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gold" />
                  <div className="flex gap-2">
                    <button type="button" disabled={busy} onClick={() => review(document, 'accepted')} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-40">{activeAction === `accepted:${document._id}` ? <Spinner label="Accepting…" className="text-white" /> : 'Accept'}</button>
                    <button type="button" disabled={busy || !(reviewNotes[document._id] || '').trim()} onClick={() => review(document, 'rejected')} className="text-xs bg-white border border-rose-300 text-rose-600 px-3 py-1.5 rounded-lg disabled:opacity-40">{activeAction === `rejected:${document._id}` ? <Spinner label="Saving…" /> : 'Needs replacement'}</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
