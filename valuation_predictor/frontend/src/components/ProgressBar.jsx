export default function ProgressBar({ label, percent }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const display = Number.isInteger(clamped) ? `${clamped}%` : `${clamped.toFixed(2)}%`;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-text-muted">{label}</span>
        <span className="text-text-primary">{display}</span>
      </div>
      <div className="w-full h-3 bg-border-default rounded overflow-hidden">
        <div
          className="h-full bg-brand-accent rounded transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
