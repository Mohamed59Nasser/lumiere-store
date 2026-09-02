"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ChevronDown, Search } from "lucide-react";
import { cls, fmtMoney, fmtDate } from "@/lib/utils";
import { useStore } from "@/lib/store-provider";
import { deleteCustomer } from "@/server/actions";
import { StatusPill, PayStatusPill, PAY_METHOD_LABEL } from "./pills";

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt: Date;
  orderCount: number;
  spend: number;
  lastOrder: Date | null;
  orders: {
    id: string;
    orderNo: string;
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: Date;
  }[];
};

export default function CustomersClient({ rows }: { rows: Row[] }) {
  const { toast } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState("");

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const n = q.trim().toLowerCase();
    return (
      r.name.toLowerCase().includes(n) ||
      r.email.toLowerCase().includes(n) ||
      r.phone.includes(n)
    );
  });

  const del = async (id: string, name: string) => {
    if (!confirm(`متأكدة من حذف حساب «${name}»؟ الأوردرات هتفضل محفوظة.`)) return;
    setBusy(id);
    await deleteCustomer(id);
    setBusy("");
    toast("اتحذف الحساب");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-50">العملاء</h1>
          <p className="mt-1 text-xs text-cream-500">{rows.length} عميلة</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute top-1/2 right-3.5 -translate-y-1/2 text-cream-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="دوسي على اسم / إيميل / رقم..."
            className="input !pr-9 w-64"
          />
        </div>
      </div>

      <div className="card divide-y divide-line/60">
        {filtered.map((r) => (
          <div key={r.id}>
            <div className="flex flex-wrap items-center gap-3 p-4">
              <span className="grid size-10 place-items-center rounded-full bg-gold-500/10 font-display font-bold text-gold-400">
                {r.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-cream-100">{r.name}</span>
                  {!r.active && (
                    <span className="rounded-full bg-bad/10 px-2 py-0.5 text-[10px] font-bold text-bad">
                      محذوف
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-cream-500" dir="ltr">
                  {r.email} — {r.phone || "بلا رقم"}
                </div>
              </div>
              <div className="text-left text-xs">
                <div className="text-cream-300">
                  {r.orderCount} أوردر — <span className="font-bold text-gold-300">{fmtMoney(r.spend)}</span>
                </div>
                <div className="text-[10px] text-cream-500">
                  آخر أوردر: {r.lastOrder ? fmtDate(r.lastOrder) : "—"}
                </div>
              </div>
              <button
                onClick={() => setOpen(open === r.id ? null : r.id)}
                className="grid size-8 place-items-center rounded-lg border border-line text-cream-300 transition hover:border-gold-500/50"
              >
                <ChevronDown size={15} className={cls("transition", open === r.id && "rotate-180")} />
              </button>
              <button
                onClick={() => del(r.id, r.name)}
                disabled={busy === r.id}
                className="grid size-8 place-items-center rounded-lg border border-line text-cream-300 transition hover:border-bad/50 hover:text-bad"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {open === r.id && (
              <div className="anim-in border-t border-line/60 bg-ink-850/50 p-4">
                <div className="mb-3 text-xs font-bold text-cream-400">
                  أوردرات العميل ({r.orders.length})
                </div>
                {r.orders.length === 0 ? (
                  <div className="text-xs text-cream-500">لسه مفيش أوردرات</div>
                ) : (
                  <div className="space-y-2">
                    {r.orders.map((o) => (
                      <a
                        key={o.id}
                        href={`/admin/orders/${o.id}`}
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-line px-4 py-2.5 transition hover:border-gold-500/40"
                      >
                        <span className="text-xs font-bold text-gold-300" dir="ltr">{o.orderNo}</span>
                        <span className="text-[11px] text-cream-500">{fmtDate(o.createdAt)}</span>
                        <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[10px] font-bold text-cream-300">
                          {PAY_METHOD_LABEL[o.paymentMethod]}
                        </span>
                        <span className="ms-auto flex items-center gap-2">
                          <PayStatusPill ps={o.paymentStatus} />
                          <StatusPill status={o.status} />
                          <span className="text-xs font-bold text-gold-300">{fmtMoney(o.total)}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-cream-500">مفيش عميلات</div>
        )}
      </div>
    </div>
  );
}
