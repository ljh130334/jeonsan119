"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import type { Profile, UserRole } from "@/types";

const ROLE_SECTIONS: { role: UserRole; label: string; home: string }[] = [
  { role: "employee", label: "직원", home: "/chat" },
  { role: "admin", label: "전산 담당자", home: "/admin/board" },
];

export function LoginForm({ profiles }: { profiles: Profile[] }) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  function handleSelect(profile: Profile, home: string) {
    login(profile);
    router.push(home);
  }

  return (
    <div className="flex flex-col gap-6">
      {ROLE_SECTIONS.map((section) => (
        <section key={section.role}>
          <h2 className="mb-2 text-xs font-semibold text-ink/50">{section.label}</h2>
          <div className="flex flex-col gap-2">
            {profiles
              .filter((p) => p.role === section.role)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p, section.home)}
                  className="flex items-center justify-between rounded-lg border border-ink/10 px-4 py-3 text-left text-sm hover:border-primary hover:bg-primary/5"
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-ink/50">{p.department}</span>
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
