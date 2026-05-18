export default function LoadingState() {
  return (
    <div className="fixed inset-0 bg-primary-bg bg-opacity-90 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-border-default border-t-brand-accent rounded-full animate-spin" />
        <p className="text-text-muted">Calculating valuation...</p>
      </div>
    </div>
  );
}
