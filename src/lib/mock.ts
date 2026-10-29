import type { Faq, Profile, Ticket, TicketCategory, TicketNote } from "@/types";

export const profiles: Profile[] = [
  { id: "u-emp-1", name: "김민수", department: "총무과", role: "employee" },
  { id: "u-emp-2", name: "이서연", department: "민원봉사과", role: "employee" },
  { id: "u-adm-1", name: "박정훈", department: "정보통신과", role: "admin" },
  { id: "u-adm-2", name: "최유진", department: "정보통신과", role: "admin" },
  { id: "u-adm-3", name: "정현우", department: "정보통신과", role: "admin" },
];

// 카테고리별 고정 담당자
export const categoryAssignee: Record<TicketCategory, string> = {
  network: "u-adm-1",
  hardware: "u-adm-2",
  software: "u-adm-3",
  account: "u-adm-1",
  etc: "u-adm-2",
};

export const faqs: Faq[] = [
  {
    id: 1,
    category: "account",
    question: "행정포털 비밀번호를 잊어버렸어요.",
    answer: "로그인 화면의 '비밀번호 초기화'를 눌러 공무원증 번호로 본인 인증 후 재설정할 수 있습니다.",
    keywords: ["비밀번호", "초기화", "패스워드"],
  },
  {
    id: 2,
    category: "network",
    question: "인터넷이 갑자기 안 돼요.",
    answer: "PC 뒷면 랜선이 꽂혀 있는지 확인하고, 재부팅 후에도 안 되면 문의를 접수해 주세요.",
    keywords: ["인터넷", "랜선", "네트워크", "와이파이"],
  },
  {
    id: 3,
    category: "hardware",
    question: "프린터에서 인쇄가 안 돼요.",
    answer: "프린터 전원과 용지를 확인하고, 제어판 > 장치 및 프린터에서 기본 프린터가 맞는지 확인해 주세요.",
    keywords: ["프린터", "인쇄", "출력"],
  },
  {
    id: 4,
    category: "software",
    question: "한글(HWP) 프로그램이 실행되지 않아요.",
    answer: "PC를 재부팅한 뒤 다시 실행해 보세요. 계속되면 라이선스 만료일 수 있으니 문의를 접수해 주세요.",
    keywords: ["한글", "hwp", "한컴"],
  },
];

export const tickets: Ticket[] = [
  {
    id: 1,
    title: "3층 회의실 인터넷 연결 불가",
    description: "3층 대회의실에서 노트북 인터넷이 연결되지 않습니다. 오후 2시 회의가 있어 급합니다.",
    category: "network",
    priority: "urgent",
    status: "open",
    requester_id: "u-emp-1",
    assignee_id: "u-adm-1",
    ai_summary: "3층 대회의실 네트워크 장애, 회의 전 조치 필요",
    chat_log: [
      { role: "user", content: "3층 대회의실에서 노트북 인터넷이 연결되지 않습니다. 오후 2시 회의가 있어 급합니다." },
      { role: "assistant", content: "긴급 문의로 접수했습니다. 접수번호는 #0001입니다." },
    ],
    created_at: "2026-10-26T09:12:00+09:00",
    updated_at: "2026-10-26T09:12:00+09:00",
    started_at: null,
    resolved_at: null,
  },
  {
    id: 2,
    title: "모니터 화면 깜빡임",
    description: "듀얼 모니터 중 오른쪽 모니터 화면이 계속 깜빡입니다.",
    category: "hardware",
    priority: "normal",
    status: "in_progress",
    requester_id: "u-emp-2",
    assignee_id: "u-adm-2",
    ai_summary: "보조 모니터 깜빡임, 케이블 또는 모니터 불량 의심",
    chat_log: [
      { role: "user", content: "듀얼 모니터 중 오른쪽 모니터 화면이 계속 깜빡입니다." },
      { role: "assistant", content: "문의를 접수했습니다. 접수번호는 #0002입니다." },
    ],
    created_at: "2026-10-24T14:30:00+09:00",
    updated_at: "2026-10-25T10:00:00+09:00",
    started_at: "2026-10-25T10:00:00+09:00",
    resolved_at: null,
  },
  {
    id: 3,
    title: "전자결재 시스템 권한 요청",
    description: "부서 이동으로 전자결재에서 새 부서 문서가 보이지 않습니다. 권한 변경 부탁드립니다.",
    category: "account",
    priority: "normal",
    status: "done",
    requester_id: "u-emp-1",
    assignee_id: "u-adm-1",
    ai_summary: "부서 이동에 따른 전자결재 권한 변경 요청",
    chat_log: [
      { role: "user", content: "부서 이동으로 전자결재에서 새 부서 문서가 보이지 않습니다." },
      { role: "assistant", content: "문의를 접수했습니다. 접수번호는 #0003입니다." },
    ],
    created_at: "2026-10-22T11:00:00+09:00",
    updated_at: "2026-10-22T16:20:00+09:00",
    started_at: "2026-10-22T13:00:00+09:00",
    resolved_at: "2026-10-22T16:20:00+09:00",
  },
  {
    id: 4,
    title: "엑셀 파일 열 때 오류 발생",
    description: "공유폴더의 엑셀 파일을 열면 '파일이 손상되었습니다' 오류가 납니다.",
    category: "software",
    priority: "normal",
    status: "done",
    requester_id: "u-emp-2",
    assignee_id: "u-adm-3",
    ai_summary: "공유폴더 엑셀 파일 손상 오류",
    chat_log: [
      { role: "user", content: "공유폴더의 엑셀 파일을 열면 '파일이 손상되었습니다' 오류가 납니다." },
      { role: "assistant", content: "문의를 접수했습니다. 접수번호는 #0004입니다." },
    ],
    created_at: "2026-10-20T09:40:00+09:00",
    updated_at: "2026-10-21T10:10:00+09:00",
    started_at: "2026-10-20T15:00:00+09:00",
    resolved_at: "2026-10-21T10:10:00+09:00",
  },
  {
    id: 5,
    title: "사무실 이전에 따른 PC 이설",
    description: "다음 주 사무실 이전 예정이라 PC 4대 이설을 요청드립니다.",
    category: "etc",
    priority: "normal",
    status: "open",
    requester_id: "u-emp-1",
    assignee_id: "u-adm-2",
    ai_summary: "사무실 이전 PC 4대 이설 요청",
    chat_log: [
      { role: "user", content: "다음 주 사무실 이전 예정이라 PC 4대 이설을 요청드립니다." },
      { role: "assistant", content: "문의를 접수했습니다. 접수번호는 #0005입니다." },
    ],
    created_at: "2026-10-27T08:50:00+09:00",
    updated_at: "2026-10-27T08:50:00+09:00",
    started_at: null,
    resolved_at: null,
  },
];

export const ticketNotes: TicketNote[] = [
  {
    id: 1,
    ticket_id: 2,
    author_id: "u-adm-2",
    body: "HDMI 케이블 교체 예정. 재고 확인 중.",
    created_at: "2026-10-25T10:05:00+09:00",
  },
  {
    id: 2,
    ticket_id: 3,
    author_id: "u-adm-1",
    body: "전자결재 부서 권한 변경 완료.",
    created_at: "2026-10-22T16:20:00+09:00",
  },
];
