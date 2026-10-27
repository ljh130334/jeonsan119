// RoleGuard(클라이언트 목업 인증) 아래라 서버에선 렌더되지 않으므로 즉시 렌더 검증 제외
export const instant = false;

export default function BoardPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold">칸반보드</h1>
      <p className="mt-2 text-sm text-ink/60">준비 중입니다.</p>
    </div>
  );
}
