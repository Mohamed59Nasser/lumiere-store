import { getAdminCustomers } from "@/server/queries";
import CustomersClient from "@/components/admin/customers-client";

export const metadata = { title: "العملاء — لوميير" };

export default async function AdminCustomers() {
  let rows = [] as Awaited<ReturnType<typeof getAdminCustomers>>;
  try {
    rows = await getAdminCustomers();
  } catch {
    /* db not ready */
  }
  return <CustomersClient rows={rows} />;
}
