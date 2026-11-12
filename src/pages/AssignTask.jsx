import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { PageSkeleton, Spinner } from '../components/LoadingFeedback';

export default function AssignTask() {
  const { taskId } = useParams();
  const [verifiers, setVerifiers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/tasks/verifiers').then((res) => setVerifiers(res.data)).catch((err) => setError(err.response?.data?.error || 'The verifier list could not be loaded.')).finally(() => setLoading(false));
  }, []);

  async function handleAssign() {
    setSubmitting(true);
    setError('');
    try {
      const task = await api.patch(`/tasks/${taskId}/assign`, { verifierId: selected });
      navigate(`/cases/${task.data.case}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Assignment could not be saved. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <PageSkeleton variant="cards" title="Loading available verifiers" />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl">
      <div className="page-heading"><div className="page-heading-copy"><div className="page-eyebrow">TEAM WORKLOAD</div><h1 className="mt-2">Assign verification</h1><p className="page-subtitle">Choose a verifier based on availability and location.</p></div></div>

      <div className="space-y-2 mb-6">
        {verifiers.map((v) => (
          <button
            key={v._id} onClick={() => setSelected(v._id)}
            className={`w-full text-left p-4 rounded-xl border transition ${
              selected === v._id ? 'border-gold bg-amber-50' : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-sm">{v.name}</div>
                <div className="text-xs text-stone-400">{v.location}</div>
              </div>
              <div className="text-xs text-stone-500">{v.activeCases} active cases</div>
            </div>
          </button>
        ))}
      </div>

      {error && <div role="alert" className="loading-error mb-4">{error}</div>}

      <button
        disabled={!selected || submitting || loading} onClick={handleAssign}
        className="bg-ink text-paper rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-800"
      >
        {submitting ? <Spinner label="Assigning…" /> : 'Confirm Assignment'}
      </button>
    </div>
  );
}
