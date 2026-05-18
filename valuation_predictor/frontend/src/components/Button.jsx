export default function Button({ children, onClick, disabled, variant = 'primary', className = '' }) {
  const base = 'px-6 py-3 rounded font-semibold transition-all duration-200';
  const styles = {
    primary: 'bg-brand-accent text-white hover:bg-muted-highlight',
    secondary: 'bg-secondary-surface text-text-primary border border-border-default hover:border-brand-accent',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {children}
    </button>
  );
}
