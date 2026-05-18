import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary-bg px-4">
      <h1 className="text-5xl font-bold text-text-primary mb-2">PreSeedIQ</h1>
      <p className="text-text-muted mb-8 text-center max-w-md">
        Estimate your startup's valuation range in under 3 minutes.
      </p>
      <Button onClick={() => navigate('/disclaimer')}>
        START VALUATION
      </Button>
    </div>
  );
}
