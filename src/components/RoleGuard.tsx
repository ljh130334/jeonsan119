"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ROLE_HOME } from "@/lib/constants";
import { useAuthHydrated, useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";

// 비로그인 → /login, 다른 역할 → 그 역할의 첫 화면
export function RoleGuard({ role, children }: { role: UserRole; children: ReactNode }) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const allowed = hydrated && user?.role === role;

  useEffect(() => {
    if (!hydrated || allowed) return;
    router.replace(user ? ROLE_HOME[user.role] : "/login");
  }, [hydrated, allowed, user, router]);

  if (!allowed) return null;
  return children;
}
