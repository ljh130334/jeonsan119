import type { TicketCategory, TicketPriority, TicketStatus } from "@/types";

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
