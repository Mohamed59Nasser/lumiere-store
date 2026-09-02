import { notFound } from "next/navigation";
import { getOrderData } from "@/server/queries";
import { getSession } from "@/lib/session";
import OrderView from "@/components/store/order-view";

type Data = Awaited<ReturnType<typeof getOrderData>>;

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data: Data | null = null;
  try {
    data = await getOrderData(id);
  } catch {
    /* db not ready */
  }
  if (!data || !data.order) notFound();

  const sess = await getSession().catch(() => null);
  const isOwner =
    sess?.kind === "customer" && sess.refId === data.order.customerId;
  const isAdmin = sess?.kind === "admin";
  if (!isOwner && !isAdmin) notFound();

  return <OrderView order={data.order} items={data.items} events={data.events} />;
}
