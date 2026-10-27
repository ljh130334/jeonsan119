// 모든 데이터 접근은 이 파일을 통한다. 추후 내부 구현만 Supabase 호출로 교체.
import type {
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

export async function getTickets(): Promise<Ticket[]> {
  return [...tickets];
}

export async function getMyTickets(requesterId: string): Promise<Ticket[]> {
  return tickets.filter((t) => t.requester_id === requesterId);
}

export async function getTicket(id: number): Promise<Ticket | null> {
  return tickets.find((t) => t.id === id) ?? null;
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
  return ticket;
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

export async function getTicketNotes(ticketId: number): Promise<TicketNote[]> {
  return ticketNotes.filter((n) => n.ticket_id === ticketId);
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
  return note;
}

function findTicket(id: number): Ticket {
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) throw new Error(`티켓을 찾을 수 없습니다: ${id}`);
  return ticket;
}
