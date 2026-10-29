"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  defaultDropAnimationSideEffects,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import { Select } from "@/components/ui/Select";
import { getProfiles, getTickets, updateTicketStatus } from "@/lib/api";
import {
  CATEGORY_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/lib/constants";
import { useAuthStore } from "@/store/auth";
import type { Profile, Ticket, TicketCategory, TicketStatus } from "@/types";
import { DraggableTicketCard, TicketCardView } from "./TicketCard";
import { TicketDetailPanel } from "./TicketDetailPanel";

const CATEGORIES = Object.keys(CATEGORY_LABEL) as TicketCategory[];

// 놓을 때: 새 자리로 감속하며 이동 + 기울기/크기 복귀(카드의 in-data-dropping 스타일).
// 착지하는 동안 실제 카드는 숨겼다가 끝나는 순간 즉시 보여줌(페이드 없음 → 깜빡임 없음)
const dropAnimation: DropAnimation = {
  duration: 220,
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  sideEffects: (params) => {
    params.dragOverlay.node.setAttribute("data-dropping", "");
    return defaultDropAnimationSideEffects({ styles: { active: { opacity: "0" } } })(params);
  },
};

// 긴급 먼저, 같은 우선순위면 오래된 순
function compareTickets(a: Ticket, b: Ticket): number {
  if (a.priority !== b.priority) return a.priority === "urgent" ? -1 : 1;
  return a.created_at.localeCompare(b.created_at);
}

export function KanbanBoard() {
  const user = useAuthStore((s) => s.user);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [category, setCategory] = useState<TicketCategory | "all">("all");
  const [assignee, setAssignee] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    Promise.all([getTickets(), getProfiles()]).then(([t, p]) => {
      setTickets(t);
      setProfiles(p);
    });
  }, []);

  // 경과시간 갱신
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const sensors = useSensors(
    // 마우스: 6px 이상 움직여야 드래그 시작 → 그냥 클릭은 상세 열기
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // 터치: 꾹 누르면(250ms) 드래그 시작 → 그냥 밀면 보드 가로 스크롤
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const profileMap = useMemo(
    () => new Map(profiles.map((p) => [p.id, p])),
    [profiles],
  );
  const admins = useMemo(
    () => profiles.filter((p) => p.role === "admin"),
    [profiles],
  );

  const visible = (tickets ?? []).filter(
    (t) =>
      (category === "all" || t.category === category) &&
      (assignee === "all" || t.assignee_id === assignee),
  );
  const selected = tickets?.find((t) => t.id === selectedId) ?? null;
  const dragging = tickets?.find((t) => t.id === draggingId) ?? null;

  const replaceTicket = useCallback((updated: Ticket) => {
    setTickets(
      (prev) => prev?.map((t) => (t.id === updated.id ? updated : t)) ?? prev,
    );
  }, []);

  const closePanel = useCallback(() => setSelectedId(null), []);

  function handleDragStart({ active }: DragStartEvent) {
    setDraggingId(Number(active.id));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setDraggingId(null);
    if (!over) return;
    const id = Number(active.id);
    const status = over.id as TicketStatus;
    const ticket = tickets?.find((t) => t.id === id);
    if (!ticket || ticket.status === status) return;

    // 먼저 화면에서 옮기고, 시각 기록(started_at/resolved_at)은 api 결과로 반영
    replaceTicket({ ...ticket, status });
    updateTicketStatus(id, status).then(replaceTicket);
  }

  const nameOf = (id: string | null) =>
    id ? (profileMap.get(id)?.name ?? null) : null;

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">칸반보드</h1>
          <p className="mt-1 text-sm text-ink/50">
            카드를 끌어서(모바일은 꾹 눌러서) 상태를 바꾸고, 눌러서 상세를 확인해요.
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            aria-label="카테고리"
            value={category}
            onChange={(v) => setCategory(v as TicketCategory | "all")}
            options={[
              { value: "all", label: "전체 카테고리" },
              ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] })),
            ]}
            className="flex-1 md:w-36 md:flex-none"
          />
          <Select
            aria-label="담당자"
            value={assignee}
            onChange={setAssignee}
            options={[
              { value: "all", label: "전체 담당자" },
              ...admins.map((a) => ({ value: a.id, label: a.name })),
            ]}
            className="flex-1 md:w-36 md:flex-none"
          />
        </div>
      </div>

      {tickets === null ? (
        <p className="mt-10 text-center text-sm text-ink/40">불러오는 중…</p>
      ) : (
        <DndContext
          id="kanban"
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDraggingId(null)}
          // 모바일 가로 스크롤 보드에서 가장자리 자동 스크롤이 너무 빨라 가운데 열을 지나치지 않게 감속
          autoScroll={{ acceleration: 5, threshold: { x: 0.15, y: 0.2 } }}
        >
          {/* 드래그 중엔 스냅을 꺼서 자동 스크롤이 열 경계로 튀지 않게 */}
          <div
            className={`-mx-4 mt-6 flex gap-4 overflow-x-auto px-4 pb-2 scroll-px-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 ${
              draggingId === null ? "snap-x" : ""
            }`}
          >
            {STATUS_ORDER.map((status) => {
              const columnTickets = visible
                .filter((t) => t.status === status)
                .sort(compareTickets);
              return (
                <Column
                  key={status}
                  status={status}
                  count={columnTickets.length}
                >
                  {columnTickets.map((t) => (
                    <DraggableTicketCard
                      key={t.id}
                      ticket={t}
                      assigneeName={nameOf(t.assignee_id)}
                      now={now}
                      selected={t.id === selectedId}
                      onOpen={() => setSelectedId(t.id)}
                    />
                  ))}
                </Column>
              );
            })}
          </div>
          <DragOverlay dropAnimation={dropAnimation}>
            {/* dnd-kit은 오버레이의 첫 자식 크기를 재서 착지 위치를 계산함.
                기울기/확대가 측정에 섞이지 않도록 변형 없는 div로 한 번 감쌈 */}
            {dragging && (
              <div>
                <TicketCardView
                  ticket={dragging}
                  assigneeName={nameOf(dragging.assignee_id)}
                  now={now}
                  dragging
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {selected && user && (
        <TicketDetailPanel
          key={selected.id}
          ticket={selected}
          profiles={profileMap}
          admins={admins}
          currentUserId={user.id}
          onChange={replaceTicket}
          onClose={closePanel}
        />
      )}
    </div>
  );
}

function Column({
  status,
  count,
  children,
}: {
  status: TicketStatus;
  count: number;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-80 w-[85%] shrink-0 snap-start flex-col rounded-3xl p-3 transition-colors md:w-auto ${
        isOver ? "bg-primary/5 ring-2 ring-primary/30 ring-inset" : "bg-ink/3"
      }`}
    >
      <h2 className="flex items-center gap-2 px-2 pt-1 pb-3 text-[15px] font-bold">
        {STATUS_LABEL[status]}
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_COLOR[status]}`}
        >
          {count}
        </span>
      </h2>
      <div className="flex flex-1 flex-col gap-2.5">
        {count === 0 ? (
          <p className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-ink/10 py-10 text-sm text-ink/35">
            티켓이 없어요
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
