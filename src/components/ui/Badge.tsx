import type { ReactNode } from "react";

interface BadgeProps {
  className?: string; // 색상 클래스 (constants.ts의 *_COLOR)
  children: ReactNode;
}

export function Badge({ className = "", children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}
