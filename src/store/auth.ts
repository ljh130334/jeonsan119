import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types";

// 목업 단계: 로그인 화면에서 고른 사용자를 localStorage에 보관
interface AuthState {
  user: Profile | null;
  login: (user: Profile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "jeonsan119-auth" },
  ),
);

// localStorage 복원 전(서버 렌더 포함)에는 false
export function useAuthHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}
