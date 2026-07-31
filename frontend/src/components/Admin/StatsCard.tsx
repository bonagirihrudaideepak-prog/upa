import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: string;
  variant?: 'default' | 'error' | 'warning';
  subtitle?: string;
  children?: ReactNode;
}

export default function StatsCard({ title, value, icon, variant = 'default', subtitle, children }: Props) {
  const variantStyles = {
    default: {
      border: 'border-ash',
      iconBg: 'bg-[#004ac6]/10',
      iconColor: 'text-[#004ac6]',
    },
    error: {
      border: 'border-red-300',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    warning: {
      border: 'border-amber-300',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`bg-white border ${styles.border} rounded p-5 relative`}>
      <div className={`absolute top-4 right-4 w-10 h-10 rounded flex items-center justify-center ${styles.iconBg}`}>
        <span className={`material-symbols-outlined text-xl ${styles.iconColor}`}>{icon}</span>
      </div>

      <div className="max-w-[calc(100%-3rem)]">
        <p className="font-sans text-label-sm text-smoke uppercase tracking-widest mb-1">{title}</p>
        <p className="font-serif text-headline-lg text-ink-black">{value}</p>
        {subtitle && (
          <p className="font-sans text-caption text-smoke mt-1">{subtitle}</p>
        )}
      </div>

      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
