export type UserRole = "employee" | "admin";
export type TicketCategory = "network" | "hardware" | "software" | "account" | "etc";
export type TicketPriority = "urgent" | "normal";
export type TicketStatus = "open" | "in_progress" | "done";

export interface Profile {
  id: string;
  name: string;
  department: string | null;
  role: UserRole;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  requester_id: string;
  assignee_id: string | null;
  ai_summary: string | null;
  chat_log: ChatMessage[];
  created_at: string;
  updated_at: string;
  started_at: string | null;
  resolved_at: string | null;
}

export interface TicketNote {
  id: number;
  ticket_id: number;
  author_id: string;
  body: string;
  created_at: string;
}

export interface Faq {
  id: number;
  category: TicketCategory;
  question: string;
  answer: string;
  keywords: string[];
}

export interface AiResult {
  resolved_by_faq: boolean;
  faq_id: number | null;
  reply: string;
  category: TicketCategory;
  priority: TicketPriority;
  title: string;
  summary: string;
}
