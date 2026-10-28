import type { TicketCategory, TicketPriority, TicketStatus, UserRole } from "@/types";

export const ROLE_LABEL: Record<UserRole, string> = {
  employee: "직원",
  admin: "전산 담당자",
};

// 역할별 첫 화면
export const ROLE_HOME: Record<UserRole, string> = {
  employee: "/chat",
  admin: "/admin/board",
};

export const CATEGORY_LABEL: Record<TicketCategory, string> = {
  network: "네트워크",
  hardware: "하드웨어",
  software: "소프트웨어",
  account: "계정·권한",
  etc: "기타",
};

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  urgent: "긴급",
  normal: "일반",
};

export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "접수",
  in_progress: "처리중",
  done: "완료",
};

export const STATUS_ORDER: TicketStatus[] = ["open", "in_progress", "done"];

// Badge 색상 (Tailwind 클래스)
export const PRIORITY_COLOR: Record<TicketPriority, string> = {
  urgent: "bg-coral/10 text-coral",
  normal: "bg-ink/5 text-ink/70",
};

export const STATUS_COLOR: Record<TicketStatus, string> = {
  open: "bg-ink/5 text-ink/70",
  in_progress: "bg-primary/10 text-primary",
  done: "bg-ink text-white",
};

// 화면 표시용 접수번호: 1 → #0001
export function formatTicketId(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}

// 기간 표시: 35분 / 3시간 / 2일 4시간
export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간`;
  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  return restHours ? `${days}일 ${restHours}시간` : `${days}일`;
}

// 일시 표시: 10월 26일 오전 09:12
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
