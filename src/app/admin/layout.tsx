import { AppHeader } from "@/components/AppHeader";
import { RoleGuard } from "@/components/RoleGuard";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <RoleGuard role="admin">
      <AppHeader role="admin" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-24 md:px-6 md:py-10">
        {children}
      </main>
    </RoleGuard>
  );
}
