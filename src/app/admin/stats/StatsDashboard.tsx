"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getStats, type TicketStats } from "@/lib/api";
import { CATEGORY_LABEL, PRIORITY_LABEL, formatDuration } from "@/lib/constants";
import type { TicketCategory } from "@/types";

export function StatsDashboard() {
  const [stats, setStats] = useState<TicketStats | null>(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">통계</h1>
      <p className="mt-1 text-sm text-ink/50">전체 티켓 처리 현황을 한눈에 확인해요.</p>

      {stats === null ? (
        <p className="mt-10 text-center text-sm text-ink/40">불러오는 중…</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            <StatCard label="전체 티켓" value={stats.total} unit="건" />
            <StatCard label="접수" value={stats.byStatus.open} unit="건" caption="처리 대기 중" />
            <StatCard label="처리중" value={stats.byStatus.in_progress} unit="건" caption="담당자 처리 중" />
            <StatCard
              label="평균 처리시간"
              value={stats.avgResolutionMs === null ? "—" : formatDuration(stats.avgResolutionMs)}
              caption={`완료 ${stats.resolvedCount}건 기준`}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Panel title="카테고리별 분포" className="lg:col-span-2">
              <CategoryChart byCategory={stats.byCategory} />
            </Panel>
            <Panel title="우선순위 비율">
              <PriorityMeter urgent={stats.byPriority.urgent} normal={stats.byPriority.normal} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  caption,
}: {
  label: string;
  value: number | string;
  unit?: string;
  caption?: string;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 md:p-5">
      <p className="text-sm font-semibold text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-extrabold tabular-nums md:text-3xl">
        {value}
        {unit && <span className="ml-0.5 text-base font-bold text-ink/50">{unit}</span>}
      </p>
      {caption && <p className="mt-1 text-xs text-ink/40">{caption}</p>}
    </div>
  );
}

function Panel({ title, className = "", children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section className={`rounded-2xl border border-ink/10 bg-white p-5 md:p-6 ${className}`}>
      <h2 className="text-[15px] font-bold">{title}</h2>
      {children}
    </section>
  );
}

// 단일 시리즈라 한 가지 색(primary)만 사용. 많은 순으로 정렬해 크기 비교가 쉽게
function CategoryChart({ byCategory }: { byCategory: Record<TicketCategory, number> }) {
  const data = (Object.keys(CATEGORY_LABEL) as TicketCategory[])
    .map((c) => ({ label: CATEGORY_LABEL[c], count: byCategory[c] }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }} barCategoryGap={10}>
          {/* 막대 끝에 값이 붙어 있으므로 x축·격자는 생략 */}
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis
            type="category"
            dataKey="label"
            width={76}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-ink)", fillOpacity: 0.7, fontSize: 13 }}
          />
          <Tooltip cursor={{ fill: "var(--color-ink)", fillOpacity: 0.04 }} content={<ChartTooltip />} />
          <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} maxBarSize={28}>
            <LabelList dataKey="count" position="right" fill="var(--color-ink)" fontSize={13} fontWeight={700} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: { label: string; count: number } }[] }) {
  if (!active || !payload?.length) return null;
  const { label, count } = payload[0].payload;
  return (
    <div className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm shadow-lg shadow-ink/5">
      <span className="text-ink/60">{label}</span> <span className="ml-1 font-bold">{count}건</span>
    </div>
  );
}

// 두 값의 비율이라 파이 대신 막대 미터로 표시. 긴급은 브랜드 규칙대로 coral
function PriorityMeter({ urgent, normal }: { urgent: number; normal: number }) {
  const total = urgent + normal;
  const urgentPct = total ? Math.round((urgent / total) * 100) : 0;
  const rows = [
    { key: "urgent", label: PRIORITY_LABEL.urgent, count: urgent, pct: urgentPct, color: "bg-coral" },
    { key: "normal", label: PRIORITY_LABEL.normal, count: normal, pct: total ? 100 - urgentPct : 0, color: "bg-ink/15" },
  ];

  return (
    <div className="mt-4">
      <p className="text-3xl font-extrabold tabular-nums">
        {urgentPct}
        <span className="ml-0.5 text-base font-bold text-ink/50">%</span>
      </p>
      <p className="mt-1 text-sm text-ink/50">전체 티켓 중 긴급 비율</p>

      <div
        className="mt-5 flex h-3 gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={`긴급 ${urgent}건 ${rows[0].pct}%, 일반 ${normal}건 ${rows[1].pct}%`}
      >
        {total === 0 ? (
          <div className="flex-1 bg-ink/5" />
        ) : (
          rows
            .filter((r) => r.count > 0)
            .map((r) => <div key={r.key} className={r.color} style={{ flexGrow: r.count }} />)
        )}
      </div>

      <dl className="mt-5 space-y-2.5 text-sm">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${r.color}`} aria-hidden />
            <dt className="text-ink/70">{r.label}</dt>
            <dd className="ml-auto font-bold tabular-nums">
              {r.count}건 <span className="ml-1 font-normal text-ink/40">{r.pct}%</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
