import { Logo } from "@/components/Logo";
import { getProfiles } from "@/lib/api";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const profiles = await getProfiles();
  // 목업: 역할별 첫 번째 사용자로 로그인
  const employee = profiles.find((p) => p.role === "employee");
  const admin = profiles.find((p) => p.role === "admin");
  if (!employee || !admin) throw new Error("목업 사용자가 없습니다.");

  return (
    <main className="flex flex-1 flex-col bg-white md:items-center md:justify-center md:bg-background md:px-6 md:py-16">
      <div className="flex w-full flex-1 flex-col px-5 pt-14 pb-6 md:max-w-md md:flex-none md:rounded-3xl md:bg-white md:p-10 md:shadow-xl md:shadow-ink/5">
        <Logo />
        <h1 className="mt-10 text-[26px] leading-snug font-extrabold">
          어떤 역할로
          <br />
          시작할까요?
        </h1>
        <p className="mt-2 text-[15px] text-ink/50">목업 단계라 역할만 고르면 바로 들어갈 수 있어요.</p>
        <LoginForm employee={employee} admin={admin} />
      </div>
    </main>
  );
}
