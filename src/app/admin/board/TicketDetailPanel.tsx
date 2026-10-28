"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { addTicketNote, assignTicket, getTicketNotes, updateTicketStatus } from "@/lib/api";
import {
  CATEGORY_LABEL,
  PRIORITY_COLOR,
  PRIORITY_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_ORDER,
  formatDateTime,
  formatTicketId,
} from "@/lib/constants";
import type { Profile, Ticket, TicketNote, TicketStatus } from "@/types";

interface TicketDetailPanelProps {
  ticket: Ticket;
  profiles: Map<string, Profile>;
  admins: Profile[];
  currentUserId: string;
  onChange: (ticket: Ticket) => void;
  onClose: () => void;
}

export function TicketDetailPanel({
  ticket,
  profiles,
  admins,
  currentUserId,
  onChange,
  onClose,
}: TicketDetailPanelProps) {
  const [notes, setNotes] = useState<TicketNote[]>([]);
  const [noteBody, setNoteBody] = useState("");
  const requester = profiles.get(ticket.requester_id);

  useEffect(() => {
    getTicketNotes(ticket.id).then(setNotes);
  }, [ticket.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 드래그와 같은 api 사용 → started_at/resolved_at 규칙 동일하게 적용
  function handleStatus(status: string) {
    updateTicketStatus(ticket.id, status as TicketStatus).then(onChange);
  }

  function handleAssign(assigneeId: string) {
    assignTicket(ticket.id, assigneeId).then(onChange);
  }

  function handleAddNote() {
    const body = noteBody.trim();
    if (!body) return;
    addTicketNote(ticket.id, currentUserId, body).then((note) => {
      setNotes((prev) => [...prev, note]);
      setNoteBody("");
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/20" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-label={`${formatTicketId(ticket.id)} 상세`}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl shadow-ink/10"
      >
        <header className="flex items-start gap-3 border-b border-ink/5 px-6 py-5">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-sm font-semibold text-ink/40 tabular-nums">
                {formatTicketId(ticket.id)}
              </span>
              <Badge className={STATUS_COLOR[ticket.status]}>{STATUS_LABEL[ticket.status]}</Badge>
              <Badge className={PRIORITY_COLOR[ticket.priority]}>{PRIORITY_LABEL[ticket.priority]}</Badge>
              <Badge className="bg-background text-ink/60">{CATEGORY_LABEL[ticket.category]}</Badge>
            </div>
            <h2 className="mt-3 text-xl leading-snug font-extrabold">{ticket.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="-mr-2 rounded-lg p-2 text-ink/40 hover:bg-ink/5 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
          <dl className="grid grid-cols-[72px_1fr] items-center gap-x-4 gap-y-3 text-sm">
            <dt className="text-ink/45">요청자</dt>
            <dd className="font-semibold">
              {requester?.name ?? "알 수 없음"}
              {requester?.department && <span className="ml-1.5 font-normal text-ink/45">{requester.department}</span>}
            </dd>
            <dt className="text-ink/45">상태</dt>
            <dd>
              <Select
                aria-label="상태"
                value={ticket.status}
                onChange={handleStatus}
                options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
              />
            </dd>
            <dt className="text-ink/45">담당자</dt>
            <dd>
              <Select
                aria-label="담당자"
                value={ticket.assignee_id ?? ""}
                onChange={handleAssign}
                options={[
                  ...(ticket.assignee_id === null ? [{ value: "", label: "미배정" }] : []),
                  ...admins.map((a) => ({ value: a.id, label: a.name })),
                ]}
              />
            </dd>
            <dt className="text-ink/45">접수</dt>
            <dd>{formatDateTime(ticket.created_at)}</dd>
            <dt className="text-ink/45">처리 시작</dt>
            <dd className={ticket.started_at ? "" : "text-ink/30"}>
              {ticket.started_at ? formatDateTime(ticket.started_at) : "—"}
            </dd>
            <dt className="text-ink/45">완료</dt>
            <dd className={ticket.resolved_at ? "" : "text-ink/30"}>
              {ticket.resolved_at ? formatDateTime(ticket.resolved_at) : "—"}
            </dd>
          </dl>

          <Section title="문의 원문">
            <p className="rounded-xl bg-background p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </Section>

          <Section title="AI 요약">
            <p className="rounded-xl bg-primary/5 p-4 text-sm leading-relaxed text-ink/80">
              {ticket.ai_summary ?? "요약이 없어요."}
            </p>
          </Section>

          <Section title="챗봇 대화 기록">
            {ticket.chat_log.length === 0 ? (
              <p className="text-sm text-ink/40">대화 기록이 없어요.</p>
            ) : (
              <div className="space-y-2">
                {ticket.chat_log.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <p
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === "user" ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-background"
                      }`}
                    >
                      {m.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title={`처리 메모 ${notes.length}`}>
            {notes.length > 0 && (
              <ul className="mb-3 space-y-2">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-xl border border-ink/10 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">{profiles.get(n.author_id)?.name ?? "알 수 없음"}</span>
                      <span className="text-ink/40">{formatDateTime(n.created_at)}</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">{n.body}</p>
                  </li>
                ))}
              </ul>
            )}
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="처리 내용을 남겨주세요"
              rows={3}
              className="w-full resize-none rounded-xl border border-ink/15 p-3.5 text-sm placeholder:text-ink/35 focus:border-primary focus:outline-none"
            />
            <Button onClick={handleAddNote} disabled={!noteBody.trim()} className="mt-2 w-full">
              메모 추가
            </Button>
          </Section>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2.5 text-sm font-bold">{title}</h3>
      {children}
    </section>
  );
}
