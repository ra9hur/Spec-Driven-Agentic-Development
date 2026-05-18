import { useMemo } from 'react';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';

const KEY = 'step5FinancialRisk';
const CLARITY_OPTIONS = ['Clear/Validated', 'Hypothetical', 'Unclear'];
const RISK_OPTIONS = ['Low', 'Medium', 'High'];
const FIELDS = ['burnRateUSDPerMonth', 'runwayMonths', 'monetizationClarity', 'regulatoryOrExecutionRisk'];

export default function Step5Financial({ data, updateField, onBack, onSubmit }) {
  const values = data[KEY] || {};

  const allFilled = useMemo(() => FIELDS.every((f) => {
    const v = values[f];
    return v !== undefined && v !== null && v !== '';
  }), [values]);

  const buildPayload = () => ({
    step1BasicInfo: data.step1BasicInfo || {},
    step2TractionPerformance: data.step2TractionPerformance || {},
    step3MarketIndustry: data.step3MarketIndustry || {},
    step4Team: data.step4Team || {},
    step5FinancialRisk: values,
  });

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-6">Financial & Risk</h2>
      <div className="flex flex-col gap-4">
        <FormInput label="Burn Rate (USD per Month)" prefix="$" inputMode="decimal" value={values.burnRateUSDPerMonth ?? ''} onChange={(v) => updateField(KEY, 'burnRateUSDPerMonth', v)} />
        <FormInput label="Runway (Months)" inputMode="decimal" value={values.runwayMonths ?? ''} onChange={(v) => updateField(KEY, 'runwayMonths', v)} />
        <FormInput label="Monetization Clarity" type="dropdown" options={CLARITY_OPTIONS} value={values.monetizationClarity || ''} onChange={(v) => updateField(KEY, 'monetizationClarity', v)} />
        <FormInput label="Regulatory or Execution Risk" type="dropdown" options={RISK_OPTIONS} value={values.regulatoryOrExecutionRisk || ''} onChange={(v) => updateField(KEY, 'regulatoryOrExecutionRisk', v)} />
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button disabled={!allFilled} onClick={() => {
          sessionStorage.setItem('preseediq_submit_payload', JSON.stringify(buildPayload()));
          onSubmit();
        }}>
          CALCULATE VALUATION
        </Button>
      </div>
    </div>
  );
}
