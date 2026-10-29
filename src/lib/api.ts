// 모든 데이터 접근은 이 파일을 통한다. 추후 내부 구현만 Supabase 호출로 교체.
import type {
  AiResult,
  ChatMessage,
  Faq,
  Profile,
  Ticket,
  TicketCategory,
  TicketNote,
  TicketPriority,
  TicketStatus,
} from "@/types";
import { categoryAssignee, faqs, profiles, ticketNotes, tickets } from "./mock";

export async function getProfiles(): Promise<Profile[]> {
  return [...profiles];
}

export async function getAdmins(): Promise<Profile[]> {
  return profiles.filter((p) => p.role === "admin");
}

export async function getFaqs(): Promise<Faq[]> {
  return [...faqs];
}

// 목업 원본이 화면 상태와 공유되지 않도록 항상 복사본을 반환
export async function getTickets(): Promise<Ticket[]> {
  return tickets.map((t) => ({ ...t }));
}

export async function getMyTickets(requesterId: string): Promise<Ticket[]> {
  return tickets.filter((t) => t.requester_id === requesterId).map((t) => ({ ...t }));
}

export async function getTicket(id: number): Promise<Ticket | null> {
  const ticket = tickets.find((t) => t.id === id);
  return ticket ? { ...ticket } : null;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  requester_id: string;
  ai_summary: string | null;
  chat_log: ChatMessage[];
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const now = new Date().toISOString();
  const ticket: Ticket = {
    ...input,
    id: Math.max(0, ...tickets.map((t) => t.id)) + 1,
    status: "open",
    assignee_id: categoryAssignee[input.category],
    created_at: now,
    updated_at: now,
    started_at: null,
    resolved_at: null,
  };
  tickets.push(ticket);
  return { ...ticket };
}

export async function updateTicketStatus(id: number, status: TicketStatus): Promise<Ticket> {
  const ticket = findTicket(id);
  const now = new Date().toISOString();
  ticket.status = status;
  ticket.updated_at = now;
  if (status === "in_progress" && !ticket.started_at) ticket.started_at = now;
  ticket.resolved_at = status === "done" ? now : null;
  return { ...ticket };
}

export async function assignTicket(id: number, assigneeId: string | null): Promise<Ticket> {
  const ticket = findTicket(id);
  ticket.assignee_id = assigneeId;
  ticket.updated_at = new Date().toISOString();
  return { ...ticket };
}

export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byCategory: Record<TicketCategory, number>;
  byPriority: Record<TicketPriority, number>;
  openUrgent: number; // 아직 처리 시작 전(접수 상태)인 긴급 건
  resolvedCount: number; // 평균 처리시간 계산에 쓰인 완료 건수
  avgResolutionMs: number | null; // 평균 처리시간 = resolved_at - created_at (완료 건 없으면 null)
}

export async function getStats(): Promise<TicketStats> {
  const stats: TicketStats = {
    total: tickets.length,
    byStatus: { open: 0, in_progress: 0, done: 0 },
    byCategory: { network: 0, hardware: 0, software: 0, account: 0, etc: 0 },
    byPriority: { urgent: 0, normal: 0 },
    openUrgent: 0,
    resolvedCount: 0,
    avgResolutionMs: null,
  };
  let resolvedTotalMs = 0;
  for (const t of tickets) {
    stats.byStatus[t.status]++;
    stats.byCategory[t.category]++;
    stats.byPriority[t.priority]++;
    if (t.priority === "urgent" && t.status === "open") stats.openUrgent++;
    if (t.status === "done" && t.resolved_at) {
      stats.resolvedCount++;
      resolvedTotalMs += new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime();
    }
  }
  if (stats.resolvedCount > 0) stats.avgResolutionMs = resolvedTotalMs / stats.resolvedCount;
  return stats;
}

export async function getTicketNotes(ticketId: number): Promise<TicketNote[]> {
  return ticketNotes.filter((n) => n.ticket_id === ticketId).map((n) => ({ ...n }));
}

export async function addTicketNote(
  ticketId: number,
  authorId: string,
  body: string,
): Promise<TicketNote> {
  const note: TicketNote = {
    id: Math.max(0, ...ticketNotes.map((n) => n.id)) + 1,
    ticket_id: ticketId,
    author_id: authorId,
    body,
    created_at: new Date().toISOString(),
  };
  ticketNotes.push(note);
  return { ...note };
}

// 목업 분류용 키워드 (실제로는 AI가 판단)
const CATEGORY_KEYWORDS: Record<TicketCategory, string[]> = {
  network: ["인터넷", "네트워크", "랜선", "와이파이", "wifi", "접속", "vpn"],
  hardware: ["프린터", "모니터", "키보드", "마우스", "pc", "컴퓨터", "본체", "전원"],
  software: ["한글", "hwp", "엑셀", "프로그램", "설치", "업데이트", "오류"],
  account: ["비밀번호", "계정", "로그인", "권한", "인증"],
  etc: [],
};
const URGENT_KEYWORDS = ["급", "긴급", "빨리", "당장", "회의", "전체"];

// 챗봇 응답 + 분류를 한 번에 반환. 지금은 키워드 매칭 목업 → 추후 Route Handler(AI 호출)로 교체
export async function sendChatMessage(message: string): Promise<AiResult> {
  await new Promise((resolve) => setTimeout(resolve, 900)); // 응답 대기 흉내
  const text = message.toLowerCase();
  const includesAny = (words: string[]) => words.some((w) => text.includes(w));

  const matched = faqs.find((f) => includesAny(f.keywords));
  const category =
    matched?.category ??
    (Object.keys(CATEGORY_KEYWORDS) as TicketCategory[]).find((c) => includesAny(CATEGORY_KEYWORDS[c])) ??
    "etc";
  const priority: TicketPriority = includesAny(URGENT_KEYWORDS) ? "urgent" : "normal";
  // 긴급 문의는 FAQ로 돌려보내지 않고 바로 접수
  const faq = priority === "urgent" ? undefined : matched;
  const firstLine = message.trim().split("\n")[0];

  return {
    resolved_by_faq: Boolean(faq),
    faq_id: faq?.id ?? null,
    reply: faq
      ? faq.answer
      : priority === "urgent"
        ? "긴급 문의로 확인했어요. 담당자에게 바로 접수했어요."
        : "자주 묻는 질문으로 해결하기 어려운 문의라 담당자에게 접수했어요.",
    category,
    priority,
    title: firstLine.length > 30 ? `${firstLine.slice(0, 29)}…` : firstLine,
    summary: message.trim(),
  };
}

function findTicket(id: number): Ticket {
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) throw new Error(`티켓을 찾을 수 없습니다: ${id}`);
  return ticket;
}
