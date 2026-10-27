// 로고의 심장박동 파동을 화면 가로로 늘인 배경 장식.
// 심전도 모니터처럼 왼쪽→오른쪽으로 드러났다 사라지기를 반복 (globals.css의 animate-ecg-sweep)
// 화면 폭에 맞춰 늘어나므로 선 그리기(dash) 대신 clip-path로 드러냄 → 어떤 폭에서도 끝까지 그려짐

const BEAT = 300;
const HEIGHT = 160;
const BASE = HEIGHT / 2;

// 한 박동: P파(작은 언덕) → QRS(짧은 하강, 높은 스파이크, 깊은 하강) → T파(완만한 언덕)
function beat(x: number): string {
  return [
    `L${x + 60} ${BASE}`,
    `Q${x + 75} ${BASE - 11} ${x + 90} ${BASE}`,
    `L${x + 110} ${BASE}`,
    `L${x + 116} ${BASE + 9}`,
    `L${x + 126} ${BASE - 64}`,
    `L${x + 137} ${BASE + 45}`,
    `L${x + 144} ${BASE}`,
    `L${x + 168} ${BASE}`,
    `Q${x + 188} ${BASE - 21} ${x + 208} ${BASE}`,
    `L${x + BEAT} ${BASE}`,
  ].join(" ");
}

// beats: 화면 폭에 넣을 박동 수 (모바일 2, PC 4)
export function HeartbeatLine({ beats, className = "" }: { beats: number; className?: string }) {
  const width = BEAT * beats;
  const path = `M0 ${BASE} ${Array.from({ length: beats }, (_, i) => beat(i * BEAT)).join(" ")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${HEIGHT}`}
      preserveAspectRatio="none"
      className={`pointer-events-none h-40 w-full animate-ecg-sweep motion-reduce:animate-none ${className}`}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="stroke-primary/15"
      />
    </svg>
  );
}
