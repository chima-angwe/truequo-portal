import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import { PageSkeleton } from '../components/LoadingFeedback';

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/reviews/report/${id}`).then((res) => setReport(res.data)).catch((err) => setError(err.response?.data?.error || 'The report could not be loaded. Please try again.'));
  }, [id]);

  if (error) return <div className="p-4 sm:p-6 lg:p-8 max-w-2xl"><div role="alert" className="loading-error">{error}</div></div>;
  if (!report) return <PageSkeleton variant="detail" title="Loading verification report" />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-10">
        <div className="flex items-start justify-between gap-3 mb-8 pb-6 border-b border-stone-100">
          <div>
            <div className="font-serif italic text-2xl">Verification Report</div>
            <div className="text-xs text-stone-400 mt-1">{report.caseNumber}</div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            report.overallResult === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {report.overallResult}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 text-sm">
          <div>
            <div className="text-xs text-stone-400">Candidate</div>
            <div className="font-medium mt-0.5">{report.candidate}</div>
          </div>
          <div>
            <div className="text-xs text-stone-400">Client</div>
            <div className="font-medium mt-0.5">{report.client}</div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {report.checks.map((c, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 py-3 border-b border-stone-50">
              <div>
                <div className="text-sm font-medium capitalize">{c.type}</div>
                {c.verifiedBy && <div className="text-xs text-stone-400">Verified by {c.verifiedBy}</div>}
              </div>
              <div className="text-sm text-emerald-600 font-medium capitalize">{c.result}</div>
            </div>
          ))}
        </div>

        <div className="text-xs text-stone-400 text-right">
          Generated {new Date(report.generatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
