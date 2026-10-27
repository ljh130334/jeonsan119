"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/constants";
import { useAuthStore } from "@/store/auth";
import type { Profile, UserRole } from "@/types";

const ROLE_DESC: Record<UserRole, string> = {
  employee: "챗봇으로 IT 문의를 남기고 처리 상태를 확인해요",
  admin: "칸반보드에서 티켓을 처리하고 통계를 확인해요",
};

const ROLE_EMOJI: Record<UserRole, string> = {
  employee: "🙋",
  admin: "🛠️",
};

export function LoginForm({ employee, admin }: { employee: Profile; admin: Profile }) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [selected, setSelected] = useState<Profile | null>(null);

  function handleStart() {
    if (!selected) return;
    login(selected);
    router.replace(ROLE_HOME[selected.role]);
  }

  return (
    <div className="mt-8 flex flex-1 flex-col">
      <div className="flex flex-col gap-3" role="radiogroup">
        {[employee, admin].map((p) => {
          const active = selected?.id === p.id;
          return (
            <button
              key={p.id}
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(p)}
              className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors ${
                active ? "border-primary bg-primary/5" : "border-transparent bg-background hover:bg-ink/5"
              }`}
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl">
                {ROLE_EMOJI[p.role]}
              </span>
              <span className="flex-1">
                <span className={`block text-[17px] font-bold ${active ? "text-primary" : ""}`}>
                  {ROLE_LABEL[p.role]}
                </span>
                <span className="mt-0.5 block text-[13px] text-ink/50">{ROLE_DESC[p.role]}</span>
                <span className="mt-1.5 block text-xs text-ink/35">
                  {p.name} · {p.department}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <Button onClick={handleStart} disabled={!selected} size="lg" className="mt-auto w-full md:mt-8">
        시작하기
      </Button>
    </div>
  );
}
