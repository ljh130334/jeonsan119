"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { getMyTickets, getProfiles } from "@/lib/api";
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
import { useAuthStore } from "@/store/auth";
import type { Profile, Ticket, TicketStatus } from "@/types";
import { MyTicketPanel } from "./MyTicketPanel";

export function MyTickets() {
  const user = useAuthStore((s) => s.user);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tab, setTab] = useState<TicketStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([getMyTickets(user.id), getProfiles()]).then(([t, p]) => {
      // 최근 접수 순
      setTickets(t.sort((a, b) => b.created_at.localeCompare(a.created_at)));
      setProfiles(p);
    });
  }, [user]);

  const closePanel = useCallback(() => setSelectedId(null), []);

  const all = tickets ?? [];
  const visible = tab === "all" ? all : all.filter((t) => t.status === tab);
  const selected = all.find((t) => t.id === selectedId) ?? null;
  const tabs: { value: TicketStatus | "all"; label: string; count: number }[] = [
    { value: "all", label: "전체", count: all.length },
    ...STATUS_ORDER.map((s) => ({
      value: s,
      label: STATUS_LABEL[s],
      count: all.filter((t) => t.status === s).length,
    })),
  ];

  return (
    <div>
      {/* 칸반보드와 같은 머리글 구성: 왼쪽 제목, 오른쪽(모바일은 아래) 필터 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">내 문의</h1>
          <p className="mt-1 text-sm text-ink/50">접수한 문의의 처리 상황을 확인해요.</p>
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-2xl bg-ink/5 p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              aria-pressed={tab === t.value}
              className={`flex h-10 flex-1 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold whitespace-nowrap transition-colors md:flex-none md:px-4 ${
                tab === t.value ? "bg-white text-ink shadow-sm shadow-ink/5" : "text-ink/45 hover:text-ink/70"
              }`}
            >
              {t.label}
              <span className={`tabular-nums ${tab === t.value ? "text-primary" : ""}`}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {tickets === null ? (
        <p className="mt-10 text-center text-sm text-ink/40">불러오는 중…</p>
      ) : visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-3xl border border-ink/10 bg-white px-6 py-14 text-center">
          <p className="font-bold">
            {tab === "all" ? "아직 접수한 문의가 없어요" : `${STATUS_LABEL[tab]} 상태인 문의가 없어요`}
          </p>
          {tab === "all" && (
            <>
              <p className="mt-1 text-sm text-ink/50">전산 문제가 생기면 챗봇에 편하게 물어보세요.</p>
              <Link
                href="/chat"
                className="mt-5 flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                챗봇에 문의하기
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="mt-6 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setSelectedId(t.id)}
                className={`w-full rounded-2xl border bg-white p-4 text-left transition-colors md:p-5 ${
                  t.id === selectedId ? "border-primary ring-1 ring-primary" : "border-ink/10 hover:border-ink/20"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="mr-0.5 text-xs font-semibold text-ink/40 tabular-nums">
                    {formatTicketId(t.id)}
                  </span>
                  <Badge className={STATUS_COLOR[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                  {t.priority === "urgent" && (
                    <Badge className={PRIORITY_COLOR.urgent}>{PRIORITY_LABEL.urgent}</Badge>
                  )}
                </div>
                <p className="mt-2 truncate text-[15px] font-bold">{t.title}</p>
                <p className="mt-1 text-xs text-ink/45">
                  {CATEGORY_LABEL[t.category]} · {formatDateTime(t.created_at)} 접수
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <MyTicketPanel
          key={selected.id}
          ticket={selected}
          assigneeName={profiles.find((p) => p.id === selected.assignee_id)?.name ?? null}
          onClose={closePanel}
        />
      )}
    </div>
  );
}
