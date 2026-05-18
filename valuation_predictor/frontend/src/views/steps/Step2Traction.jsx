import { useMemo } from 'react';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';

const KEY = 'step2TractionPerformance';
const GROWTH_TYPES = ['Month-over-Month', 'Year-over-Year'];
const FIELDS = ['monthlyRevenueUSD', 'revenueGrowthRatePct', 'numberOfUsersOrCustomers', 'growthType', 'growthRatePct', 'retentionRatePct'];

export default function Step2Traction({ data, updateField, onNext, onBack }) {
  const values = data[KEY] || {};

  const allFilled = useMemo(() => FIELDS.every((f) => {
    const v = values[f];
    return v !== undefined && v !== null && v !== '';
  }), [values]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-6">Traction & Performance</h2>
      <div className="flex flex-col gap-4">
        <FormInput label="Monthly Revenue (USD)" prefix="$" inputMode="decimal" value={values.monthlyRevenueUSD ?? ''} onChange={(v) => updateField(KEY, 'monthlyRevenueUSD', v)} />
        <FormInput label="Revenue Growth Rate (%)" inputMode="decimal" value={values.revenueGrowthRatePct ?? ''} onChange={(v) => updateField(KEY, 'revenueGrowthRatePct', v)} />
        <FormInput label="Number of Users" inputMode="decimal" value={values.numberOfUsersOrCustomers ?? ''} onChange={(v) => updateField(KEY, 'numberOfUsersOrCustomers', v)} />
        <FormInput label="Growth Type" type="dropdown" options={GROWTH_TYPES} value={values.growthType || ''} onChange={(v) => updateField(KEY, 'growthType', v)} />
        <FormInput label="Growth Rate (%)" inputMode="decimal" value={values.growthRatePct ?? ''} onChange={(v) => updateField(KEY, 'growthRatePct', v)} />
        <FormInput label="Retention Rate (%)" inputMode="decimal" value={values.retentionRatePct ?? ''} onChange={(v) => updateField(KEY, 'retentionRatePct', v)} />
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button disabled={!allFilled} onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
