import { useMemo } from 'react';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';

const KEY = 'step4Team';
const BACKGROUNDS = ['Technical Only', 'Business Only', 'Mixed'];
const FIELDS = ['numberOfFounders', 'founderBackground', 'priorExitsOrRelevantExperience'];

export default function Step4Team({ data, updateField, onNext, onBack }) {
  const values = data[KEY] || {};

  const allFilled = useMemo(() => {
    return values.numberOfFounders !== undefined && values.numberOfFounders !== null &&
           values.founderBackground !== undefined && values.founderBackground !== '';
  }, [values]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-6">Team Profile</h2>
      <div className="flex flex-col gap-4">
        <FormInput label="Number of Founders" type="spinner" value={values.numberOfFounders ?? 1} onChange={(v) => updateField(KEY, 'numberOfFounders', v)} />
        <FormInput label="Founder Background" type="dropdown" options={BACKGROUNDS} value={values.founderBackground || ''} onChange={(v) => updateField(KEY, 'founderBackground', v)} />
        <FormInput label="Prior Exits or Relevant Experience" type="checkbox" value={values.priorExitsOrRelevantExperience || false} onChange={(v) => updateField(KEY, 'priorExitsOrRelevantExperience', v)} />
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button disabled={!allFilled} onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
