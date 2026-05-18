import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './views/LandingPage';
import Disclaimer from './views/Disclaimer';
import FormWizard from './views/FormWizard';
import Dashboard from './views/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-primary-bg text-text-primary">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/step/:stepId" element={<FormWizard />} />
        <Route path="/results" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
