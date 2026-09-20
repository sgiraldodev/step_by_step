import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'destructive';
  loading?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
};

const variantClasses = {
  primary: 'primary',
  secondary: 'secondary-button',
  destructive: 'destructive-button',
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
      className={`${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
