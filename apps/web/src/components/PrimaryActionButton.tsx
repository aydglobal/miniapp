import type { ButtonHTMLAttributes } from 'react';

export default function PrimaryActionButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={`game-button game-button--primary game-button--full ${className}`}
    />
  );
}
