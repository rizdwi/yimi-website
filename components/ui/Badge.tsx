import React from 'react';

export type BadgeVariant = 'blue' | 'green' | 'yellow' | 'red' | 'neutral';

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({ children, variant = 'blue', className = '' }: BadgeProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider select-none';

  const variantStyles = {
    blue: 'bg-yimi-blue-50 text-yimi-blue-800 border border-yimi-blue-600/20',
    green: 'bg-emerald-50 text-yimi-green-700 border border-yimi-green-500/30',
    yellow: 'bg-yellow-50 text-amber-900 border border-yimi-yellow-400/50',
    red: 'bg-rose-50 text-yimi-red-600 border border-yimi-red-600/20',
    neutral: 'bg-neutral-100 text-neutral-500 border border-neutral-200',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
