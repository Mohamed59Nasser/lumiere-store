import Link from "next/link";
import {
  Banknote,
  Wallet,
  Clock,
  Users,
  Package,
  TrendingUp,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { getDashboardData } from "@/server/queries";
import { StatusPill, PayStatusPill, PAY_METHOD_LABEL } from "@/components/admin/pills";
import { fmtMoney, fmtDate } from "@/lib/utils";

export const metadata = { title: "لوحة التحكم — لوميير" };

export default async function AdminDashboard() {
  let d = null as Awaited<ReturnType<typeof getDashboardData>> | null;
  try {
    d = await getDashboardData();
  } catch {
    /* db not ready */
  }
  if (!d) {
    return (
      <div className="card p-10 text-center text-sm text-cream-400">
        قاعدة البيانات لسه بتجهز — جربي ترفعي الصفحة تاني
      </div>
    );
  }

  const maxDay = Math.max(...d.days.map((x) => x.total), 1);
  const totalMethodSum = d.byMethod.reduce((a, m) => a + m.sum, 0) || 1;

  const cards = [
    { label: "إجمالي المبيعات", value: fmtMoney(d.revenue), icon: TrendingUp, sub: "بدون الملغي" },
    { label: "المحصّل", value: fmtMoney(d.collected), icon: CheckCircle2, sub: "مؤكد + كاش مستلم" },
    { label: "بانتظار تأكيد الدفع", value: fmtMoney(d.pendingSum), icon: Clock, sub: `${d.pendingCount} أوردر` },
    { label: "طلبات النهاردة", value: String(d.todayCount), icon: Package, sub: "جديدة" },
    { label: "العملاء", value: String(d.customerCount), icon: Users, sub: "حسابات" },
    { label: "المنتجات", value: String(d.productCount), icon: Wallet, sub: "في الكاتالوج" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream-50">لوحة التحكم</h1>
        <p className="mt-1 text-xs text-cream-500">نظرة سريعة على متجر لوميير</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <span className="grid size-9 place-items-center rounded-xl bg-gold-500/10 text-gold-400">
              <c.icon size={17} />
            </span>
            <div className="mt-3 font-display text-xl font-bold text-cream-50">
              {c.value}
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-cream-500">
              {c.label}
            </div>
            <div className="text-[10px] text-cream-500/70">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* chart */}
        <div className="card p-6 xl:col-span-2">
          <h3 className="mb-5 font-display text-base font-bold text-cream-50">
            المبيعات — آخر 14 يوم
          </h3>
          <div className="flex h-44 items-end gap-1.5">
            {d.days.map((day, i) => (
              <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-gold-700 to-gold-400 transition group-hover:from-gold-600 group-hover:to-gold-300"
                  style={{ height: `${Math.max(3, (day.total / maxDay) * 100)}%` }}
                />
                <span className="text-[9px] text-cream-500">{day.label}</span>
                <div className="pointer-events-none absolute -top-8 hidden rounded-lg bg-ink-800 px-2 py-1 text-[10px] font-bold text-gold-300 group-hover:block">
                  {fmtMoney(day.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* payment breakdown */}
        <div className="card p-6">
          <h3 className="mb-5 font-display text-base font-bold text-cream-50">
            التحصيل حسب طريقة الدفع
          </h3>
          <div className="space-y-5">
            {d.byMethod.map((m) => {
              const Icon = m.key === "cod" ? Banknote : m.key === "wallet" ? Wallet : Smartphone;
              return (
                <div key={m.key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-cream-200">
                      <Icon size={14} className="text-gold-500" />
                      {m.label}
                      <span className="text-cream-500">({m.count})</span>
                    </span>
                    <span className="font-bold text-gold-300">{fmtMoney(m.sum)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-gold-600 to-gold-400"
                      style={{ width: `${(m.sum / totalMethodSum) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-cream-500">
                    المحصّل: <span className="text-good">{fmtMoney(m.collectedSum)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* recent orders */}
        <div className="card p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-cream-50">
              أحدث الأوردرات
            </h3>
            <Link href="/admin/orders" className="text-xs font-bold text-gold-400 hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="space-y-2">
            {d.recent.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line px-4 py-3 transition hover:border-gold-500/40"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-cream-100" dir="ltr">
                    {o.orderNo}
                  </div>
                  <div className="text-[11px] text-cream-500">
                    {o.customerName} — {fmtDate(o.createdAt)}
                  </div>
                </div>
                <span className="rounded-full bg-ink-800 px-2.5 py-1 text-[10px] font-bold text-cream-300">
                  {PAY_METHOD_LABEL[o.paymentMethod]}
                </span>
                <div className="ms-auto flex items-center gap-2">
                  <PayStatusPill ps={o.paymentStatus} />
                  <StatusPill status={o.status} />
                  <span className="text-sm font-bold text-gold-300">
                    {fmtMoney(o.total)}
                  </span>
                </div>
              </Link>
            ))}
            {d.recent.length === 0 && (
              <div className="py-8 text-center text-xs text-cream-500">لسه مفيش أوردرات</div>
            )}
          </div>
        </div>

        {/* top products */}
        <div className="card p-6">
          <h3 className="mb-4 font-display text-base font-bold text-cream-50">
            الأكثر مبيعاً
          </h3>
          <div className="space-y-3">
            {d.top.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-gold-500/10 text-xs font-bold text-gold-400">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-cream-200">{p.name}</div>
                  <div className="text-[10px] text-cream-500">
                    {p.qty} قطعة — {fmtMoney(p.revenue)}
                  </div>
                </div>
              </div>
            ))}
            {d.top.length === 0 && (
              <div className="py-8 text-center text-xs text-cream-500">لسه مفيش مبيعات</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
