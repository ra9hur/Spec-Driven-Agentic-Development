import { useMemo } from 'react';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';

const KEY = 'step3MarketIndustry';
const GROWTH_RATES = ['Low', 'Moderate', 'High'];
const INTENSITIES = ['Low', 'Medium', 'High'];
const FIELDS = ['estimatedMarketSizeTAM', 'industryGrowthRate', 'competitiveIntensity'];

export default function Step3Market({ data, updateField, onNext, onBack }) {
  const values = data[KEY] || {};

  const allFilled = useMemo(() => FIELDS.every((f) => {
    const v = values[f];
    return v !== undefined && v !== null && v !== '';
  }), [values]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-6">Market & Industry</h2>
      <div className="flex flex-col gap-4">
        <FormInput label="Estimated Market Size (TAM)" prefix="$" inputMode="decimal" value={values.estimatedMarketSizeTAM ?? ''} onChange={(v) => updateField(KEY, 'estimatedMarketSizeTAM', v)} />
        <FormInput label="Industry Growth Rate" type="dropdown" options={GROWTH_RATES} value={values.industryGrowthRate || ''} onChange={(v) => updateField(KEY, 'industryGrowthRate', v)} />
        <FormInput label="Competitive Intensity" type="dropdown" options={INTENSITIES} value={values.competitiveIntensity || ''} onChange={(v) => updateField(KEY, 'competitiveIntensity', v)} />
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button disabled={!allFilled} onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
