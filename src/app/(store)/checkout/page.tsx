import { getCheckoutData } from "@/server/queries";
import CheckoutView from "@/components/store/checkout-view";

export const metadata = { title: "إتمام الطلب — Lumière | لوميير" };

export default async function CheckoutPage() {
  let customer: { id: string; name: string; email: string; phone: string } | null =
    null;
  let settings: Record<string, string> = {};
  try {
    const d = await getCheckoutData();
    customer = d.customer;
    settings = d.settings;
  } catch {
    /* db not ready */
  }
  return <CheckoutView customer={customer} settings={settings} />;
}
