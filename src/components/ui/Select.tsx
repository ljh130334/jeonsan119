"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  "aria-label": string;
  className?: string;
}

// 네이티브 select 대신 디자인에 맞춘 드롭다운 (ARIA select-only combobox 패턴, 키보드 지원)
export function Select({ value, options, onChange, "aria-label": ariaLabel, className = "" }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openMenu() {
    setActiveIndex(Math.max(0, selectedIndex));
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    const last = options.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: Math.min(last, activeIndex + 1),
      ArrowUp: Math.max(0, activeIndex - 1),
      Home: 0,
      End: last,
    };
    if (e.key in moves) {
      e.preventDefault();
      setActiveIndex(moves[e.key]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(activeIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // 상세 패널의 Esc 닫기와 겹치지 않게
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-xl border bg-white pr-3 pl-3.5 text-sm font-semibold transition-colors focus-visible:outline-none ${
          open ? "border-primary ring-1 ring-primary" : "border-ink/15 hover:border-ink/30 focus-visible:border-primary"
        }`}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-4 shrink-0 text-ink/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute top-full left-0 z-30 mt-1.5 max-h-72 w-max min-w-full overflow-y-auto rounded-2xl border border-ink/5 bg-white p-1.5 shadow-xl shadow-ink/10 transition-[opacity,translate] duration-150 ease-out starting:-translate-y-1 starting:opacity-0"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActiveIndex(i)}
                onClick={() => choose(i)}
                className={`flex h-10 cursor-pointer items-center justify-between gap-4 rounded-xl px-3 text-sm ${
                  i === activeIndex ? "bg-background" : ""
                } ${isSelected ? "font-bold text-primary" : "font-medium text-ink/80"}`}
              >
                {o.label}
                {isSelected && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                    aria-hidden
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
