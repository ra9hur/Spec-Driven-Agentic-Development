import { useMemo } from 'react';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';

const KEY = 'step1BasicInfo';

const COUNTRIES = ['US', 'UK', 'IN', 'DE', 'FR', 'SG', 'JP', 'BR', 'CA', 'AU'];
const INDUSTRIES = ['Tech', 'Healthcare', 'Fintech', 'E-commerce', 'Education', 'SaaS', 'Hardware', 'Other'];
const BUSINESS_MODELS = ['B2B', 'B2C'];
const STAGES = ['Idea', 'MVP/Prototype Built', 'Early Traction'];

const FIELDS = ['companyName', 'countryCode', 'industry', 'businessModel', 'startupStage'];

export default function Step1BasicInfo({ data, updateField, onNext }) {
  const values = data[KEY] || {};

  const allFilled = useMemo(() => FIELDS.every((f) => {
    const v = values[f];
    return v !== undefined && v !== null && v !== '';
  }), [values]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-6">Basic Information</h2>
      <div className="flex flex-col gap-4">
        <FormInput label="Company Name" value={values.companyName || ''} onChange={(v) => updateField(KEY, 'companyName', v)} />
        <FormInput label="Country" type="dropdown" options={COUNTRIES} value={values.countryCode || ''} onChange={(v) => updateField(KEY, 'countryCode', v)} />
        <FormInput label="Industry" type="dropdown" options={INDUSTRIES} value={values.industry || ''} onChange={(v) => updateField(KEY, 'industry', v)} />
        <FormInput label="Business Model" type="dropdown" options={BUSINESS_MODELS} value={values.businessModel || ''} onChange={(v) => updateField(KEY, 'businessModel', v)} />
        <FormInput label="Startup Stage" type="dropdown" options={STAGES} value={values.startupStage || ''} onChange={(v) => updateField(KEY, 'startupStage', v)} />
      </div>
      <div className="flex justify-end mt-6">
        <Button disabled={!allFilled} onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
