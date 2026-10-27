import { AppHeader } from "@/components/AppHeader";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <AppHeader role="admin" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
