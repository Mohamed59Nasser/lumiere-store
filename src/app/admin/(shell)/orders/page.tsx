import Link from "next/link";
import { getAdminOrders } from "@/server/queries";
import { StatusPill, PayStatusPill, PAY_METHOD_LABEL } from "@/components/admin/pills";
import { fmtMoney, fmtDate, cls } from "@/lib/utils";

export const metadata = { title: "الأوردرات — لوميير" };

const TABS = [
  { k: "", label: "الكل" },
  { k: "pending_pay", label: "بانتظار التأكيد" },
  { k: "new", label: "جديد" },
  { k: "preparing", label: "قيد التجهيز" },
  { k: "shipping", label: "جاري التوصيل" },
  { k: "delivered", label: "تم التسليم" },
  { k: "cancelled", label: "ملغي" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const { tab = "", q = "" } = await searchParams;
  let orders = [] as Awaited<ReturnType<typeof getAdminOrders>>;
  try {
    orders = await getAdminOrders(tab || undefined, q || undefined);
  } catch {
    /* db not ready */
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream-50">الأوردرات</h1>
        <p className="mt-1 text-xs text-cream-500">{orders.length} أوردر</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tb) => (
          <Link
            key={tb.k}
            href={`/admin/orders${tb.k ? `?tab=${tb.k}` : ""}`}
            className={cls(
              "rounded-full border px-4 py-2 text-xs font-bold transition",
              tab === tb.k
                ? "border-gold-500 bg-gold-500/15 text-gold-300"
                : "border-line text-cream-300 hover:border-gold-500/40"
            )}
          >
            {tb.label}
          </Link>
        ))}
        <form action="/admin/orders" className="ms-auto flex gap-2">
          <input type="hidden" name="tab" value={tab} />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="دوسي برقم الأوردر أو العميل..."
            className="input w-56 !py-2 text-xs"
          />
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] text-cream-500">
              <th className="p-4 text-right font-semibold">الأوردر</th>
              <th className="p-4 text-right font-semibold">العميل</th>
              <th className="p-4 text-right font-semibold">الإجمالي</th>
              <th className="p-4 text-right font-semibold">الدفع</th>
              <th className="p-4 text-right font-semibold">حالة الدفع</th>
              <th className="p-4 text-right font-semibold">الحالة</th>
              <th className="p-4 text-right font-semibold">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line/50 last:border-0 hover:bg-ink-850/50">
                <td className="p-4">
                  <Link href={`/admin/orders/${o.id}`} className="font-bold text-gold-300 hover:underline" dir="ltr">
                    {o.orderNo}
                  </Link>
                  <div className="text-[10px] text-cream-500">{o.items.length} منتج</div>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-cream-100">{o.customerName}</div>
                  <div className="text-[11px] text-cream-500" dir="ltr">{o.phone}</div>
                </td>
                <td className="p-4 font-bold text-gold-300">{fmtMoney(o.total)}</td>
                <td className="p-4">
                  <span className="rounded-full bg-ink-800 px-2.5 py-1 text-[10px] font-bold text-cream-300">
                    {PAY_METHOD_LABEL[o.paymentMethod]}
                  </span>
                </td>
                <td className="p-4"><PayStatusPill ps={o.paymentStatus} /></td>
                <td className="p-4"><StatusPill status={o.status} /></td>
                <td className="p-4 text-xs text-cream-400">{fmtDate(o.createdAt)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-sm text-cream-500">
                  مفيش أوردرات في التصنيف ده
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
