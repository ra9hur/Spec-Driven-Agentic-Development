import { useId } from 'react';

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  options,
  prefix,
  placeholder,
  disabled = false,
  error,
  inputMode,
}) {
  const id = useId();

  if (type === 'dropdown' && options) {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-text-muted text-sm">{label}</label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="bg-secondary-surface border border-border-default rounded px-3 py-2 text-text-primary
                     focus:border-brand-accent focus:shadow-accent-glow outline-none transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {error && <span className="text-brand-accent text-xs">{error}</span>}
      </div>
    );
  }

  if (type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="accent-brand-accent w-4 h-4 disabled:opacity-40"
        />
        <span className="text-text-primary text-sm">{label}</span>
      </label>
    );
  }

  if (type === 'spinner') {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-text-muted text-sm">{label}</label>
        <input
          id={id}
          type="number"
          min={1}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="bg-secondary-surface border border-border-default rounded px-3 py-2 text-text-primary
                     focus:border-brand-accent focus:shadow-accent-glow outline-none transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-text-muted text-sm">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{prefix}</span>
        )}
        <input
          id={id}
          type="text"
          inputMode={inputMode || 'text'}
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            const filtered = inputMode === 'decimal' ? raw.replace(/[^0-9.]/g, '') : raw;
            onChange(filtered);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`bg-secondary-surface border border-border-default rounded px-3 py-2 text-text-primary
                     focus:border-brand-accent focus:shadow-accent-glow outline-none transition-all w-full
                     disabled:opacity-40 disabled:cursor-not-allowed ${prefix ? 'pl-8' : ''}`}
        />
      </div>
      {error && <span className="text-brand-accent text-xs">{error}</span>}
    </div>
  );
}
