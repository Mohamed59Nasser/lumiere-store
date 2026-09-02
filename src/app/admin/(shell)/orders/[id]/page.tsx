import { notFound } from "next/navigation";
import { getAdminOrder } from "@/server/queries";
import OrderDetailClient from "@/components/admin/order-detail-client";

export const metadata = { title: "تفاصيل أوردر — لوميير" };

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data = null as Awaited<ReturnType<typeof getAdminOrder>>;
  try {
    data = await getAdminOrder(id);
  } catch {
    /* db not ready */
  }
  if (!data?.order) notFound();
  return <OrderDetailClient {...data} />;
}
