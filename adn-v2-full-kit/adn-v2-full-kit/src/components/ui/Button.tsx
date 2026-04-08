import React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "gold" | "rbrt";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; };

export default function Button({ variant = "primary", className, disabled, children, ...props }: Props) {
  return (
    <button
      className={clsx(
        "adn-btn",
        variant === "primary" && "adn-btn-primary",
        variant === "secondary" && "adn-btn-secondary",
        variant === "gold" && "adn-btn-gold",
        variant === "rbrt" && "adn-btn-rbrt",
        disabled && "adn-btn-disabled",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
