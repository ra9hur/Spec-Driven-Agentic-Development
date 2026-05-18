import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function Disclaimer() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-bg px-4">
      <div className="bg-secondary-surface rounded-lg p-8 max-w-lg w-full border border-border-default">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Disclaimer</h2>
        <p className="text-text-muted text-sm leading-relaxed mb-6">
          This tool provides an estimated valuation for educational purposes only and does not
          constitute financial, legal, or investment advice. PreSeedIQ is an estimator, not a
          definitive valuation. It is a directional decision tool and is not a replacement for
          investor due diligence.
        </p>

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 accent-brand-accent"
          />
          <span className="text-text-primary text-sm">
            I understand and accept this disclaimer
          </span>
        </label>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button disabled={!accepted} onClick={() => {
            sessionStorage.setItem('preseediq_disclaimer_accepted', 'true');
            navigate('/step/1');
          }}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
