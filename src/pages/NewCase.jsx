import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const CHECK_TYPES = ['employment', 'education', 'identity', 'address', 'reference'];

// Mirrors VerificationTask.js's DEFAULT_CLAIM_FIELDS on the backend — keep in sync.
// These are the fields the candidate/client is CLAIMING, which is what a verifier
// will later check findings against.
const CLAIM_FIELDS = {
  employment: ['Employer', 'Position', 'Start Date', 'End Date'],
  education: ['Institution', 'Qualification', 'Graduation Year'],
  identity: ['ID Type', 'ID Number'],
  address: ['Claimed Address'],
  reference: ['Referee Name', 'Referee Relationship', 'Referee Contact'],
};

export default function NewCase() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ candidateName: '', candidateEmail: '', client: '', checks: [], dueDate: '' });
  const [claims, setClaims] = useState({}); // { employment: { Employer: '...', Position: '...' }, ... }
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'client') {
      setForm((f) => ({ ...f, client: user.organization || '' }));
      return;
    }
    api.get('/cases').then((res) => {
      const unique = new Map();
      res.data.forEach((c) => unique.set(c.client._id, c.client));
      setClients([...unique.values()]);
    });
  }, [user]);

  function toggleCheck(type) {
    setForm((f) => ({
      ...f,
      checks: f.checks.includes(type) ? f.checks.filter((c) => c !== type) : [...f.checks, type],
    }));
  }

  function updateClaim(type, label, value) {
    setClaims((prev) => ({
      ...prev,
      [type]: { ...(prev[type] || {}), [label]: value },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      const res = await api.post('/cases', { ...form, claims });
      navigate(`/cases/${res.data.case._id}`);
    } catch (err) { setError(err.response?.data?.error || 'Request could not be submitted. Please try again.'); }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl">
      <div className="page-heading"><div className="page-heading-copy"><div className="page-eyebrow">CASE INTAKE</div><h1 className="mt-2">New verification request</h1><p className="page-subtitle">Add candidate details and choose the checks to complete.</p></div></div>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-stone-500">Candidate name</label>
          <input
            required value={form.candidateName}
            onChange={(e) => setForm({ ...form, candidateName: e.target.value })}
            className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-stone-500">Candidate email</label>
          <input
            value={form.candidateEmail}
            onChange={(e) => setForm({ ...form, candidateEmail: e.target.value })}
            className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        {user?.role !== 'client' ? <div>
          <label className="text-xs font-medium text-stone-500">Client</label>
          <select
            required value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
            className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">Select client…</option>
            {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div> : <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-xs text-stone-600">Requesting organization: <strong>{user?.organizationName || 'Your organization'}</strong></div>}
        <div>
          <label className="text-xs font-medium text-stone-500">Checks required</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {CHECK_TYPES.map((type) => (
              <button
                type="button" key={type} onClick={() => toggleCheck(type)}
                className={`px-3 py-1.5 rounded-full text-xs capitalize border ${
                  form.checks.includes(type) ? 'bg-ink text-paper border-ink' : 'border-stone-300 text-stone-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {form.checks.length > 0 && (
          <div className="space-y-4 border-t border-stone-100 pt-4">
            <div className="text-xs font-medium text-stone-500">
              What's being claimed — this is what the verifier will check against
            </div>
            {form.checks.map((type) => (
              <div key={type} className="bg-stone-50 rounded-lg p-3">
                <div className="text-xs font-medium capitalize text-stone-600 mb-2">{type}</div>
                <div className="grid grid-cols-2 gap-2">
                  {CLAIM_FIELDS[type].map((label) => (
                    <input
                      key={label}
                      placeholder={label}
                      value={claims[type]?.[label] || ''}
                      onChange={(e) => updateClaim(type, label, e.target.value)}
                      className="border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-stone-500">Due date</label>
          <input
            type="date" value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="mt-1 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
        <button
          type="submit" disabled={form.checks.length === 0}
          className="bg-ink text-paper rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-stone-800"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
