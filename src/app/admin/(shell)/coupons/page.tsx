import { getAdminCoupons } from "@/server/queries";
import CouponsClient from "@/components/admin/coupons-client";

export const metadata = { title: "الكوبونات — لوميير" };

export default async function AdminCoupons() {
  let rows = [] as Awaited<ReturnType<typeof getAdminCoupons>>;
  try {
    rows = await getAdminCoupons();
  } catch {
    /* db not ready */
  }
  return <CouponsClient rows={rows} />;
}
