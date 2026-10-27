import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary/90 disabled:bg-primary/40",
  secondary: "border border-ink/15 bg-white text-ink hover:bg-ink/5 disabled:opacity-50",
};

const SIZE_CLASS: Record<Size, string> = {
  md: "h-10 rounded-xl px-4 text-sm",
  lg: "h-14 rounded-2xl px-5 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-colors disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      {...props}
    />
  );
}
