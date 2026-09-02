"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { cls } from "@/lib/utils";
import { useStore } from "@/lib/store-provider";
import { saveCoupon, deleteCoupon, toggleCoupon } from "@/server/actions";

type Row = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  active: boolean;
  usedCount: number;
};

export default function CouponsClient({ rows }: { rows: Row[] }) {
  const { toast } = useStore();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await saveCoupon({
      code,
      type,
      value: parseFloat(value) || 0,
      minOrder: parseFloat(minOrder) || 0,
      active: true,
    });
    if (r.ok) {
      setCode("");
      setValue("");
      setMinOrder("");
      toast("اتضاف");
      router.refresh();
    } else {
      toast("كملي بيانات الكوبون", "err");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream-50">الكوبونات</h1>
        <p className="mt-1 text-xs text-cream-500">كوبونات الخصم للعملاء</p>
      </div>

      <form onSubmit={add} className="card grid gap-3 p-6 md:grid-cols-[1fr_130px_110px_130px_auto]">
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="الكود (WELCOME10)" className="input" dir="ltr" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="input">
          <option value="percent">نسبة %</option>
          <option value="fixed">مبلغ ثابت</option>
        </select>
        <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "percent" ? "10" : "50"} className="input" dir="ltr" />
        <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="حد أدنى (0)" className="input" dir="ltr" />
        <button type="submit" className="btn-gold">
          <Plus size={15} />
          إضافة
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] text-cream-500">
              <th className="p-4 text-right font-semibold">الكود</th>
              <th className="p-4 text-right font-semibold">الخصم</th>
              <th className="p-4 text-right font-semibold">حد أدنى</th>
              <th className="p-4 text-right font-semibold">مرات الاستخدام</th>
              <th className="p-4 text-right font-semibold">حالة</th>
              <th className="p-4 text-left font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-line/50 last:border-0">
                <td className="p-4 font-bold text-gold-300" dir="ltr">{c.code}</td>
                <td className="p-4 text-cream-200">
                  {c.type === "percent" ? `${c.value}%` : `${c.value} ج.م`}
                </td>
                <td className="p-4 text-cream-300">{c.minOrder > 0 ? `${c.minOrder} ج.م` : "—"}</td>
                <td className="p-4 text-cream-300">{c.usedCount}</td>
                <td className="p-4">
                  <button
                    onClick={async () => {
                      await toggleCoupon(c.id);
                      router.refresh();
                    }}
                    className={cls(
                      "rounded-full px-3 py-1 text-[11px] font-bold transition",
                      c.active ? "bg-good/10 text-good" : "bg-ink-800 text-cream-500"
                    )}
                  >
                    {c.active ? "نشط" : "موقوف"}
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={async () => {
                      if (!confirm(`حذف الكود ${c.code}؟`)) return;
                      await deleteCoupon(c.id);
                      router.refresh();
                    }}
                    className="grid size-8 place-items-center rounded-lg border border-line text-cream-300 transition hover:border-bad/50 hover:text-bad"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-sm text-cream-500">
                  مفيش كوبونات — ضيفي أول كوبون فوق
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
