import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Traction from './steps/Step2Traction';
import Step3Market from './steps/Step3Market';
import Step4Team from './steps/Step4Team';
import Step5Financial from './steps/Step5Financial';
import { saveFormData, loadFormData } from '../services/session';

const TOTAL_STEPS = 5;

const stepComponents = {
  1: Step1BasicInfo,
  2: Step2Traction,
  3: Step3Market,
  4: Step4Team,
  5: Step5Financial,
};

export default function FormWizard() {
  const { stepId } = useParams();
  const navigate = useNavigate();
  const currentStep = parseInt(stepId, 10);

  const [formData, setFormData] = useState(() => loadFormData() || {});

  useEffect(() => {
    if (sessionStorage.getItem('preseediq_disclaimer_accepted') !== 'true') {
      navigate('/disclaimer', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (currentStep < 1 || currentStep > TOTAL_STEPS || isNaN(currentStep)) {
      navigate('/step/1', { replace: true });
    }
  }, [currentStep, navigate]);

  useEffect(() => {
    saveFormData(formData);
  }, [formData]);

  const updateField = (stepKey, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [stepKey]: { ...prev[stepKey], [field]: value },
    }));
  };

  const StepComponent = stepComponents[currentStep];

  return (
    <div className="min-h-screen bg-primary-bg px-4 py-8">
      {/* Step Progress Indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
              ${step === currentStep ? 'bg-brand-accent text-white' : ''}
              ${step < currentStep ? 'bg-muted-highlight text-white' : ''}
              ${step > currentStep ? 'bg-secondary-surface text-text-muted border border-border-default' : ''}
            `}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Step Form */}
      <div className="max-w-2xl mx-auto bg-secondary-surface rounded-lg p-6 border border-border-default">
        {StepComponent && (
          <StepComponent
            data={formData}
            updateField={updateField}
            onNext={() => {
              if (currentStep < TOTAL_STEPS) navigate(`/step/${currentStep + 1}`);
            }}
            onBack={() => {
              if (currentStep > 1) navigate(`/step/${currentStep - 1}`);
            }}
            onSubmit={() => navigate('/results')}
          />
        )}
      </div>
    </div>
  );
}
