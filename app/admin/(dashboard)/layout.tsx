import { requireAdmin } from "@/lib/auth/guard";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeaderTitle } from "@/components/admin/header-title";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-beige-100/40">
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <AdminHeaderTitle userLabel={user.fullName ?? user.email} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
