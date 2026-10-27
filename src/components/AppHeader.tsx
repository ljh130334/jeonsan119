"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ROLE_LABEL } from "@/lib/constants";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";
import { Logo } from "./Logo";

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-6",
  "aria-hidden": true,
} as const;

const ICONS: Record<string, ReactNode> = {
  chat: (
    <svg {...ICON_PROPS}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l.9-4.6A8 8 0 1 1 21 12Z" />
    </svg>
  ),
  list: (
    <svg {...ICON_PROPS}>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  board: (
    <svg {...ICON_PROPS}>
      <rect x="3" y="4" width="5" height="16" rx="1.5" />
      <rect x="10" y="4" width="5" height="11" rx="1.5" />
      <rect x="17" y="4" width="4" height="7" rx="1.5" />
    </svg>
  ),
  chart: (
    <svg {...ICON_PROPS}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  ),
};

const NAV: Record<UserRole, { href: string; label: string; icon: string }[]> = {
  employee: [
    { href: "/chat", label: "챗봇", icon: "chat" },
    { href: "/my-tickets", label: "내 문의", icon: "list" },
  ],
  admin: [
    { href: "/admin/board", label: "칸반보드", icon: "board" },
    { href: "/admin/stats", label: "통계", icon: "chart" },
  ],
};

export function AppHeader({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const items = NAV[role];
  const isActive = (href: string) => pathname.startsWith(href);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-4 md:h-16 md:px-6">
          <Link href={items[0].href} className="flex shrink-0">
            <Logo />
          </Link>

          <nav className="hidden gap-1 md:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-[15px] font-semibold transition-colors ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-ink/50 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {user.name.slice(0, 1)}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="hidden text-xs text-ink/45 sm:block">
                    {ROLE_LABEL[user.role]} · {user.department}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink/45 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 하단 탭바 */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink/5 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold ${
              isActive(item.href) ? "text-primary" : "text-ink/35"
            }`}
          >
            {ICONS[item.icon]}
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
