"use client";

import { useDraggable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/Badge";
import {
  CATEGORY_LABEL,
  PRIORITY_COLOR,
  PRIORITY_LABEL,
  formatDuration,
  formatTicketId,
} from "@/lib/constants";
import type { Ticket } from "@/types";

interface TicketCardProps {
  ticket: Ticket;
  assigneeName: string | null;
  now: number;
  selected?: boolean;
  dragging?: boolean; // DragOverlay로 들고 있는 카드
}

function elapsedText(ticket: Ticket, now: number): string {
  const created = new Date(ticket.created_at).getTime();
  if (ticket.status === "done" && ticket.resolved_at) {
    return `${formatDuration(new Date(ticket.resolved_at).getTime() - created)} 만에 완료`;
  }
  return `${formatDuration(now - created)} 경과`;
}

export function TicketCardView({ ticket, assigneeName, now, selected, dragging }: TicketCardProps) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 text-left ${
        selected ? "border-primary ring-1 ring-primary" : "border-ink/10 hover:border-ink/20"
      } ${
        // 집을 때 0°→2°로 기울며 살짝 커지고(starting:), 놓을 때(오버레이의 data-dropping) 다시 펴짐
        dragging
          ? "scale-[1.03] rotate-2 cursor-grabbing shadow-xl shadow-ink/10 transition-[rotate,scale,box-shadow] duration-200 ease-out starting:scale-100 starting:rotate-0 starting:shadow-none in-data-dropping:scale-100 in-data-dropping:rotate-0 in-data-dropping:shadow-none"
          : "transition-colors"
      }`}
    >
      <div className="flex h-5 items-center justify-between">
        <span className="text-xs font-semibold text-ink/40 tabular-nums">{formatTicketId(ticket.id)}</span>
        {ticket.priority === "urgent" && (
          <Badge className={PRIORITY_COLOR.urgent}>{PRIORITY_LABEL.urgent}</Badge>
        )}
      </div>
      <p className="mt-1.5 line-clamp-2 text-[15px] leading-snug font-bold">{ticket.title}</p>
      <Badge className="mt-2.5 bg-background text-ink/60">{CATEGORY_LABEL[ticket.category]}</Badge>
      <div className="mt-3 flex items-center justify-between border-t border-ink/5 pt-3 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-ink/70">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {assigneeName?.slice(0, 1) ?? "?"}
          </span>
          {assigneeName ?? "미배정"}
        </span>
        <span className="text-ink/40">{elapsedText(ticket, now)}</span>
      </div>
    </div>
  );
}

export function DraggableTicketCard(props: TicketCardProps & { onOpen: () => void }) {
  const { onOpen, ...viewProps } = props;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: props.ticket.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
      // 집을 때만 서서히 흐려지고, 놓은 뒤엔 즉시 원래대로(오버레이와 바로 교대)
      // 꾹 누를 때 텍스트 선택·iOS 길게누르기 메뉴가 뜨지 않게
      className={`cursor-grab rounded-2xl outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-primary/40 active:cursor-grabbing ${
        isDragging ? "opacity-40 transition-opacity duration-200" : ""
      }`}
    >
      <TicketCardView {...viewProps} />
    </div>
  );
}
