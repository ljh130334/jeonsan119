import type { UserRole } from "@/types";

// 토스 이모지 스타일 역할 아이콘 (48x48)
export function RoleIcon({ role, className = "size-8" }: { role: UserRole; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {role === "employee" ? <EmployeeBadge /> : <AdminTools />}
    </svg>
  );
}

// 사원증
function EmployeeBadge() {
  return (
    <>
      <path
        d="M11 2 L24 14 L37 2"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary/45"
      />
      <rect x="19" y="11" width="10" height="6" rx="2" className="fill-ink/45" />
      <rect x="8" y="15" width="32" height="31" rx="7" className="fill-primary" />
      <ellipse cx="15" cy="20" rx="4" ry="2" className="fill-white/30" />
      <rect x="16" y="21" width="16" height="14" rx="4" className="fill-white" />
      <circle cx="24" cy="26.5" r="3.2" className="fill-primary/55" />
      <path d="M17.8 35 a6.2 5.6 0 0 1 12.4 0 Z" className="fill-primary/55" />
      <rect x="15" y="38" width="18" height="2.6" rx="1.3" className="fill-white/90" />
      <rect x="19" y="42" width="10" height="1.8" rx="0.9" className="fill-white/50" />
    </>
  );
}

// 톱니바퀴 + 렌치
function AdminTools() {
  const teeth = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <>
      <g className="fill-ink" opacity="0.32">
        {teeth.map((deg) => (
          <rect key={deg} x="16" y="13" width="6" height="7" rx="1.6" transform={`rotate(${deg} 19 29)`} />
        ))}
        <circle cx="19" cy="29" r="11" />
      </g>
      <circle cx="19" cy="29" r="4.5" className="fill-white" />
      <ellipse cx="14" cy="22.5" rx="3" ry="1.6" className="fill-white/40" transform="rotate(-35 14 22.5)" />
      <g transform="translate(28 22) rotate(-45)">
        <line x1="-13" y1="0" x2="7" y2="0" strokeWidth="6.5" strokeLinecap="round" className="stroke-primary" />
        <path
          d="M15.83 3.21 A5 5 0 1 1 15.83 -3.21"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-primary"
        />
        <line x1="-10" y1="-1.6" x2="2" y2="-1.6" strokeWidth="1.4" strokeLinecap="round" className="stroke-white/45" />
      </g>
    </>
  );
}
