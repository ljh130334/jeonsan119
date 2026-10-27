"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";
import { Logo } from "./Logo";

const NAV: Record<UserRole, { href: string; label: string }[]> = {
  employee: [
    { href: "/chat", label: "문의하기" },
    { href: "/my-tickets", label: "내 문의" },
  ],
  admin: [
    { href: "/admin/board", label: "칸반보드" },
    { href: "/admin/stats", label: "통계" },
  ],
};

export function AppHeader({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-ink/10 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <Logo />
        <nav className="flex gap-1">
          {NAV[role].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                pathname === item.href ? "bg-primary/10 text-primary" : "text-ink/60 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {user && <span className="hidden text-ink/70 sm:inline">{user.name} · {user.department}</span>}
          <button onClick={handleLogout} className="text-ink/60 hover:text-ink">
            {user ? "로그아웃" : "로그인"}
          </button>
        </div>
      </div>
    </header>
  );
}
