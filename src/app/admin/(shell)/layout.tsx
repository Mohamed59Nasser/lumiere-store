import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/server/queries";
import { AdminShell } from "@/components/admin/admin-chrome";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let admin = null as { name: string } | null;
  let pendingCount = 0;
  try {
    admin = await getAdminSession();
    if (admin) {
      const p = await db
        .select()
        .from(orders)
        .where(eq(orders.paymentStatus, "unconfirmed"));
      pendingCount = p.length;
    }
  } catch {
    /* db not ready */
  }
  if (!admin) redirect("/admin/login");
  return <AdminShell name={admin.name} pendingCount={pendingCount}>{children}</AdminShell>;
}
