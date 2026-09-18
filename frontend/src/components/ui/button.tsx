import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${variant === 'primary' ? 'primary' : 'secondary-button'} ${className}`}
    >
      {children}
    </button>
  );
}
