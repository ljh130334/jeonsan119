import { AppHeader } from "@/components/AppHeader";

export default function EmployeeLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppHeader role="employee" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
