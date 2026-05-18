import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { submitValuationData } from '../services/api';
import { purgeUserSession } from '../services/session';
import ProgressBar from '../components/ProgressBar';
import LoadingState from '../components/LoadingState';
import Button from '../components/Button';

function formatCurrency(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('preseediq_submit_payload');
    if (!raw) {
      navigate('/step/1', { replace: true });
      return;
    }
    const payload = JSON.parse(raw);

    submitValuationData(payload)
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [navigate]);

  const handleShare = async () => {
    const url = window.location.origin + '/results';
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch {
      // clipboard not available
    }
  };

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-bg px-4">
        <div className="bg-secondary-surface rounded-lg p-8 max-w-md w-full border border-border-default text-center">
          <p className="text-brand-accent mb-4">Error: {error}</p>
          <Button onClick={() => navigate('/step/5')}>Back to Form</Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { valuation, subPillars, profileAnalysis, aiRecommendation } = data;

  return (
    <div className="min-h-screen bg-primary-bg pb-24">
      <div className="dashboard-container max-w-5xl mx-auto px-4 py-8">

        {/* Valuation Range */}
        <div className="valuation-columns grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'LOW', value: valuation.low },
            { label: 'BASE', value: valuation.base, highlight: true },
            { label: 'HIGH', value: valuation.high },
          ].map((col) => (
            <div
              key={col.label}
              className={`bg-secondary-surface rounded-lg p-6 border border-border-default text-center
                ${col.highlight ? 'ring-2 ring-brand-accent' : ''}`}
            >
              <p className={`text-sm mb-2 ${col.highlight ? 'text-brand-accent font-semibold' : 'text-text-muted'}`}>
                {col.label}
              </p>
              <p className={`text-3xl font-bold ${col.highlight ? 'text-brand-accent' : 'text-text-primary'}`}>
                {formatCurrency(col.value)}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-text-muted mb-8">
          Confidence: {valuation.confidencePct}%
        </p>

        {/* Progress Bars */}
        <div className="bg-secondary-surface rounded-lg p-6 border border-border-default mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Factor Contribution</h3>
          <div className="flex flex-col gap-4">
            <ProgressBar label="TRACTION" percent={(subPillars.tractionScore / 1.5) * 100} />
            <ProgressBar label="MARKET" percent={(subPillars.marketScore / 1.5) * 100} />
            <ProgressBar label="TEAM" percent={(subPillars.teamScore / 1.5) * 100} />
            <ProgressBar label="FINANCIAL" percent={subPillars.financialScore >= 1.0 ? 80 : subPillars.financialScore <= 0.5 ? 33 : 66} />
            <ProgressBar label="RISK" percent={(subPillars.riskScore / 1.5) * 100} />
          </div>
        </div>

        {/* Profile Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-secondary-surface rounded-lg p-6 border border-border-default">
            <h3 className="text-lg font-semibold text-green-400 mb-3">STRENGTHS</h3>
            <ul className="list-disc list-inside text-text-primary text-sm space-y-1">
              {profileAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
              {profileAnalysis.strengths.length === 0 && <li className="text-text-muted">None identified</li>}
            </ul>
          </div>
          <div className="bg-secondary-surface rounded-lg p-6 border border-border-default">
            <h3 className="text-lg font-semibold text-brand-accent mb-3">WEAKNESSES & RISKS</h3>
            <ul className="list-disc list-inside text-text-primary text-sm space-y-1">
              {profileAnalysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              {profileAnalysis.weaknesses.length === 0 && <li className="text-text-muted">None identified</li>}
            </ul>
          </div>
        </div>

        {/* AI Recommendation */}
        {aiRecommendation && (
          <div className="bg-secondary-surface rounded-lg p-6 border border-border-default mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Recommendation</h3>
            <div className="markdown-content text-text-muted text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiRecommendation}</ReactMarkdown>
            </div>
          </div>
        )}

      </div>

      {/* Action Bar */}
      <div className="action-bar fixed bottom-0 left-0 right-0 bg-secondary-surface border-t border-border-default px-4 py-3">
        <div className="max-w-3xl mx-auto flex justify-center gap-3 flex-wrap">
          <Button variant="secondary" onClick={() => navigate('/step/5')}>BACK TO FORM</Button>
          <Button variant="secondary" onClick={() => window.print()}>EXPORT</Button>
          <Button variant="secondary" onClick={handleShare}>SHARE</Button>
          <Button onClick={() => purgeUserSession()}>NEW VALUATION</Button>
        </div>
      </div>
    </div>
  );
}
