import { AppHeader } from "@/components/AppHeader";
import { RoleGuard } from "@/components/RoleGuard";

export default function EmployeeLayout({ children }: LayoutProps<"/">) {
  return (
    <RoleGuard role="employee">
      <AppHeader role="employee" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-24 md:px-6 md:py-10">
        {children}
      </main>
    </RoleGuard>
  );
}
