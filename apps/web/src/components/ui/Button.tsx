import { type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'rbrt' | 'danger';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: 'game-button',
  secondary: 'game-button-secondary',
  gold: 'game-button-gold',
  rbrt: 'game-button-rbrt',
  danger: 'game-button-danger'
};

export default function Button({ variant = 'primary', className = '', disabled, children, ...props }: Props) {
  return (
    <button
      className={`${variantClass[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
