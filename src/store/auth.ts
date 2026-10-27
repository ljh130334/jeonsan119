import { create } from "zustand";
import type { Profile } from "@/types";

// 목업 단계: 로그인 화면에서 고른 사용자를 메모리에만 보관 (새로고침 시 초기화)
interface AuthState {
  user: Profile | null;
  login: (user: Profile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
