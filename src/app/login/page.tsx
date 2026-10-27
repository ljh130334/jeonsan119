import { Logo } from "@/components/Logo";
import { getProfiles } from "@/lib/api";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const profiles = await getProfiles();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white p-8">
        <Logo className="mb-2" />
        <p className="mb-8 text-sm text-ink/60">사용자를 선택해 로그인하세요.</p>
        <LoginForm profiles={profiles} />
      </div>
    </main>
  );
}
