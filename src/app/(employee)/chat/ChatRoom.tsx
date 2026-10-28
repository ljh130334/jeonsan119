"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { LogoSymbol } from "@/components/Logo";
import { Badge } from "@/components/ui/Badge";
import { createTicket, getProfiles, sendChatMessage } from "@/lib/api";
import { CATEGORY_LABEL, PRIORITY_COLOR, PRIORITY_LABEL, formatTicketId } from "@/lib/constants";
import { useAuthStore } from "@/store/auth";
import type { AiResult, ChatMessage, Profile, Ticket } from "@/types";

type NewChatItem = { kind: "user" | "bot"; content: string } | { kind: "ticket"; ticket: Ticket };
type ChatItem = NewChatItem & { id: number };

// FAQ로 답한 직후, "해결 안 됐어요"를 누르면 이 내용으로 티켓을 만든다
interface PendingFaq {
  itemId: number;
  question: string;
  result: AiResult;
  log: ChatMessage[];
}

const NOT_RESOLVED = "해결 안 됐어요";
const SUGGESTIONS = ["비밀번호를 잊어버렸어요", "프린터에서 인쇄가 안 돼요", "3층 회의실 인터넷이 안 돼요. 급해요!"];

export function ChatRoom() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingFaq | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProfiles().then(setProfiles);
  }, []);

  // 새 메시지·로딩 표시가 생기면 맨 아래로
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [items, loading]);

  function push(item: NewChatItem) {
    const id = nextId.current++;
    setItems((prev) => [...prev, { ...item, id }]);
    return id;
  }

  async function fileTicket(question: string, result: AiResult, log: ChatMessage[]) {
    if (!user) return;
    const ticket = await createTicket({
      title: result.title,
      description: question,
      category: result.category,
      priority: result.priority,
      requester_id: user.id,
      ai_summary: result.summary,
      chat_log: log,
    });
    push({ kind: "bot", content: "문의를 접수했어요. 담당자가 확인 후 연락드릴게요." });
    push({ kind: "ticket", ticket });
  }

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    setInput("");
    setPending(null);
    push({ kind: "user", content: question });
    setLoading(true);
    try {
      const result = await sendChatMessage(question);
      const log: ChatMessage[] = [
        { role: "user", content: question },
        { role: "assistant", content: result.reply },
      ];
      const itemId = push({ kind: "bot", content: result.reply });
      if (result.resolved_by_faq) {
        setPending({ itemId, question, result, log });
      } else {
        await fileTicket(question, result, log);
      }
    } catch {
      push({ kind: "bot", content: "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요." });
    } finally {
      setLoading(false);
    }
  }

  async function handleNotResolved() {
    if (!pending || loading) return;
    const { question, result, log } = pending;
    setPending(null);
    push({ kind: "user", content: NOT_RESOLVED });
    setLoading(true);
    try {
      await fileTicket(question, result, [...log, { role: "user", content: NOT_RESOLVED }]);
    } catch {
      push({ kind: "bot", content: "접수 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요." });
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // 한글 조합 중 Enter는 무시 (마지막 글자가 한 번 더 전송되는 문제 방지)
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  }

  const nameOf = (id: string | null) => profiles.find((p) => p.id === id)?.name ?? "미배정";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <div className="flex-1 space-y-4">
        <BotRow>
          <Bubble>
            안녕하세요{user ? `, ${user.name}님` : ""}! 전산 문의를 편하게 남겨주세요.
            <br />
            자주 묻는 질문이면 바로 답해드리고, 아니면 담당자에게 접수해 드릴게요.
          </Bubble>
        </BotRow>

        {items.length === 0 && (
          <div className="flex flex-wrap gap-2 pl-11">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-ink/10 bg-white px-3.5 py-2 text-sm font-medium text-ink/70 transition-colors hover:border-primary/40 hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {items.map((item, i) => {
          // 봇 메시지가 연달아 오면 아바타는 첫 번째에만
          const continued = i > 0 && items[i - 1].kind !== "user";
          if (item.kind === "user") {
            return (
              <div key={item.id} className="flex justify-end">
                <p className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-white">
                  {item.content}
                </p>
              </div>
            );
          }
          if (item.kind === "ticket") {
            return (
              <BotRow key={item.id} hideAvatar>
                <TicketReceipt ticket={item.ticket} assigneeName={nameOf(item.ticket.assignee_id)} />
              </BotRow>
            );
          }
          return (
            <BotRow key={item.id} hideAvatar={continued}>
              <Bubble>{item.content}</Bubble>
              {pending?.itemId === item.id && (
                <button
                  onClick={handleNotResolved}
                  disabled={loading}
                  className="mt-2 rounded-full border border-ink/15 bg-white px-3.5 py-2 text-sm font-semibold text-ink/70 transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-50"
                >
                  {NOT_RESOLVED}
                </button>
              )}
            </BotRow>
          );
        })}

        {loading && (
          <BotRow hideAvatar={items.at(-1)?.kind !== "user"}>
            <div className="flex h-11 items-center gap-1 rounded-2xl rounded-tl-md border border-ink/5 bg-white px-4" role="status" aria-label="답변을 작성하고 있어요">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="size-1.5 animate-bounce rounded-full bg-ink/30"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </BotRow>
        )}
        {/* 고정 입력창(+모바일 탭바)에 가려지지 않을 만큼 여유를 두고 스크롤 */}
        <div ref={endRef} className="scroll-mb-40 md:scroll-mb-28" />
      </div>

      {/* 모바일은 하단 탭바(약 60px) 위에 붙임 */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-[calc(3.75rem+env(safe-area-inset-bottom))] mt-6 bg-background pt-2 pb-3 md:bottom-0 md:pb-6"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-ink/10 bg-white p-2 pl-4 transition-colors focus-within:border-primary">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="어떤 문제가 있으신가요?"
            aria-label="문의 내용"
            className="field-sizing-content max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 placeholder:text-ink/35 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="보내기"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary/90 disabled:bg-primary/30"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

function BotRow({ children, hideAvatar }: { children: ReactNode; hideAvatar?: boolean }) {
  return (
    <div className="flex gap-3">
      {hideAvatar ? <span className="w-8 shrink-0" /> : <LogoSymbol className="size-8 shrink-0" />}
      <div className="flex min-w-0 max-w-[85%] flex-col items-start">{children}</div>
    </div>
  );
}

function Bubble({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl rounded-tl-md border border-ink/5 bg-white px-4 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap">
      {children}
    </p>
  );
}

function TicketReceipt({ ticket, assigneeName }: { ticket: Ticket; assigneeName: string }) {
  return (
    <div className="w-72 max-w-full rounded-2xl border border-ink/10 bg-white p-5">
      <p className="text-sm font-semibold text-primary">접수 완료</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums">{formatTicketId(ticket.id)}</p>
      <p className="mt-1 text-sm text-ink/50">접수번호로 처리 상황을 확인할 수 있어요.</p>
      <dl className="mt-4 grid grid-cols-[56px_1fr] gap-x-3 gap-y-2 border-t border-ink/5 pt-4 text-sm">
        <dt className="text-ink/45">제목</dt>
        <dd className="font-semibold break-words">{ticket.title}</dd>
        <dt className="text-ink/45">분류</dt>
        <dd className="flex flex-wrap gap-1.5">
          <Badge className="bg-background text-ink/60">{CATEGORY_LABEL[ticket.category]}</Badge>
          <Badge className={PRIORITY_COLOR[ticket.priority]}>{PRIORITY_LABEL[ticket.priority]}</Badge>
        </dd>
        <dt className="text-ink/45">담당자</dt>
        <dd className="font-semibold">{assigneeName}</dd>
      </dl>
      <Link
        href="/my-tickets"
        className="mt-4 flex h-10 items-center justify-center rounded-xl bg-background text-sm font-semibold text-ink/70 transition-colors hover:bg-ink/5"
      >
        내 문의에서 보기
      </Link>
    </div>
  );
}
