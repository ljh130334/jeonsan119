import { MyTickets } from "./MyTickets";

// RoleGuard(클라이언트 목업 인증) 아래라 서버에선 렌더되지 않으므로 즉시 렌더 검증 제외
export const instant = false;

export default function MyTicketsPage() {
  return <MyTickets />;
}
