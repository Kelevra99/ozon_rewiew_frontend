import * as React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary:
      'bg-amber-300 text-slate-950 hover:bg-amber-200 disabled:bg-amber-300/70',
    secondary:
      'bg-white/10 text-white hover:bg-white/15 disabled:bg-white/10',
    ghost:
      'bg-transparent text-slate-200 hover:bg-white/10 disabled:bg-transparent',
    danger:
      'bg-red-500/90 text-white hover:bg-red-500 disabled:bg-red-500/70',
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed ${variants[variant]} ${className}`.trim()}
    />
  );
}
