"use client";

import { useEffect, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  CATEGORY_LABEL,
  PRIORITY_COLOR,
  PRIORITY_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  formatDateTime,
  formatDuration,
  formatTicketId,
} from "@/lib/constants";
import type { Ticket } from "@/types";

interface MyTicketPanelProps {
  ticket: Ticket;
  assigneeName: string | null;
  onClose: () => void;
}

export function MyTicketPanel({ ticket, assigneeName, onClose }: MyTicketPanelProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 별도 이력 테이블이 없으므로 시각 기록(created/started/resolved)으로 진행 상황을 보여줌
  const steps = [
    { label: "접수", at: ticket.created_at, hint: "문의가 접수됐어요" },
    { label: "처리 시작", at: ticket.started_at, hint: "담당자가 처리를 시작했어요" },
    { label: "완료", at: ticket.resolved_at, hint: "처리가 끝났어요" },
  ].filter((step) => step.at || step.label !== "처리 시작" || !ticket.resolved_at); // 접수에서 바로 완료된 경우 처리 시작 단계 생략

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/20" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-label={`${formatTicketId(ticket.id)} 상세`}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl shadow-ink/10"
      >
        <header className="flex items-start gap-3 border-b border-ink/5 px-6 py-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-sm font-semibold text-ink/40 tabular-nums">
                {formatTicketId(ticket.id)}
              </span>
              <Badge className={STATUS_COLOR[ticket.status]}>{STATUS_LABEL[ticket.status]}</Badge>
              <Badge className={PRIORITY_COLOR[ticket.priority]}>{PRIORITY_LABEL[ticket.priority]}</Badge>
              <Badge className="bg-background text-ink/60">{CATEGORY_LABEL[ticket.category]}</Badge>
            </div>
            <h2 className="mt-3 text-xl leading-snug font-extrabold break-words">{ticket.title}</h2>
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
          <div className="flex items-center gap-3 rounded-2xl bg-background p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              {assigneeName?.slice(0, 1) ?? "?"}
            </span>
            <div>
              <p className="text-xs text-ink/45">담당자</p>
              <p className="font-bold">{assigneeName ?? "배정 대기 중"}</p>
            </div>
          </div>

          <Section title="진행 상황">
            <ol>
              {steps.map((step, i) => {
                const done = step.at !== null;
                const isLast = i === steps.length - 1;
                return (
                  <li key={step.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                          done ? "bg-primary text-white" : "border-2 border-ink/15 bg-white"
                        }`}
                      >
                        {done && (
                          <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        )}
                      </span>
                      {!isLast && (
                        <span className={`my-1 w-0.5 flex-1 rounded-full ${steps[i + 1].at ? "bg-primary" : "bg-ink/10"}`} />
                      )}
                    </div>
                    <div className={isLast ? "" : "pb-6"}>
                      <p className={`text-sm font-bold ${done ? "" : "text-ink/35"}`}>{step.label}</p>
                      <p className={`mt-0.5 text-sm ${done ? "text-ink/55" : "text-ink/30"}`}>
                        {step.at ? `${formatDateTime(step.at)} · ${step.hint}` : "대기 중"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
            {ticket.resolved_at && (
              <p className="mt-4 rounded-xl bg-primary/5 px-4 py-3 text-sm text-ink/70">
                접수부터 완료까지{" "}
                <span className="font-bold text-primary">
                  {formatDuration(new Date(ticket.resolved_at).getTime() - new Date(ticket.created_at).getTime())}
                </span>{" "}
                걸렸어요.
              </p>
            )}
          </Section>

          <Section title="문의 내용">
            <p className="rounded-xl bg-background p-4 text-sm leading-relaxed break-words whitespace-pre-wrap">
              {ticket.description}
            </p>
          </Section>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold">{title}</h3>
      {children}
    </section>
  );
}
