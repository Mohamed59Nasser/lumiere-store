"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Star, Search } from "lucide-react";
import { cls, fmtMoney } from "@/lib/utils";
import { deleteProduct, toggleProduct } from "@/server/actions";
import type { CategoryInfo, ProductInfo } from "@/server/queries";

export default function ProductsClient({
  products,
  categories,
}: {
  products: ProductInfo[];
  categories: CategoryInfo[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [busyId, setBusyId] = useState("");

  const filtered = useMemo(() => {
    let list = products;
    if (cat) list = list.filter((p) => p.categoryId === cat);
    if (q.trim()) {
      const n = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.nameAr.includes(q.trim()) || p.nameEn.toLowerCase().includes(n)
      );
    }
    return list;
  }, [products, q, cat]);

  const del = async (id: string, name: string) => {
    if (!confirm(`متأكدة من حذف «${name}»؟ الأوردرات القديمة هتفضل محفوظة.`)) return;
    setBusyId(id);
    await deleteProduct(id);
    setBusyId("");
    router.refresh();
  };

  const toggle = async (id: string) => {
    await toggleProduct(id);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-50">المنتجات</h1>
          <p className="mt-1 text-xs text-cream-500">{products.length} منتج</p>
        </div>
        <Link href="/admin/products/new" className="btn-gold">
          <Plus size={15} />
          منتج جديد
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute top-1/2 right-3.5 -translate-y-1/2 text-cream-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="دوسي على منتج..."
            className="input !pr-9"
          />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="input w-48">
          <option value="">كل الفئات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.nameAr}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] text-cream-500">
              <th className="p-4 text-right font-semibold">المنتج</th>
              <th className="p-4 text-right font-semibold">الفئة</th>
              <th className="p-4 text-right font-semibold">السعر</th>
              <th className="p-4 text-right font-semibold">المخزون</th>
              <th className="p-4 text-right font-semibold">التقييم</th>
              <th className="p-4 text-right font-semibold">مميز</th>
              <th className="p-4 text-right font-semibold">حالة</th>
              <th className="p-4 text-left font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-line/50 last:border-0 hover:bg-ink-850/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.mainImage}
                      alt=""
                      className="size-12 rounded-xl border border-line object-cover"
                    />
                    <div>
                      <div className="font-bold text-cream-100">{p.nameAr}</div>
                      <div className="text-[11px] text-cream-500" dir="ltr">
                        {p.nameEn}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-cream-300">{p.categoryAr}</td>
                <td className="p-4">
                  <div className="font-bold text-gold-300">{fmtMoney(p.price)}</div>
                  {p.comparePrice ? (
                    <div className="text-[10px] text-cream-500 line-through">
                      {fmtMoney(p.comparePrice)}
                    </div>
                  ) : null}
                </td>
                <td className="p-4">
                  <span
                    className={cls(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      p.totalStock === 0
                        ? "bg-bad/10 text-bad"
                        : p.totalStock <= 5
                          ? "bg-warn/10 text-warn"
                          : "bg-good/10 text-good"
                    )}
                  >
                    {p.totalStock}
                  </span>
                </td>
                <td className="p-4 text-cream-300">
                  {p.ratingCount > 0 ? (
                    <span className="flex items-center gap-1">
                      <Star size={12} className="fill-gold-500 text-gold-500" />
                      {p.rating}
                    </span>
                  ) : (
                    <span className="text-cream-500">—</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {p.featured && (
                      <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-bold text-gold-300">
                        مميز
                      </span>
                    )}
                    {p.bestSeller && (
                      <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-bold text-gold-300">
                        مبيع
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggle(p.id)}
                    className={cls(
                      "rounded-full px-3 py-1 text-[11px] font-bold transition",
                      p.active
                        ? "bg-good/10 text-good"
                        : "bg-ink-800 text-cream-500"
                    )}
                  >
                    {p.active ? "نشط" : "موقوف"}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="grid size-8 place-items-center rounded-lg border border-line text-cream-300 transition hover:border-gold-500/50 hover:text-gold-300"
                      title="تعديل"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => del(p.id, p.nameAr)}
                      disabled={busyId === p.id}
                      className="grid size-8 place-items-center rounded-lg border border-line text-cream-300 transition hover:border-bad/50 hover:text-bad"
                      title="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-10 text-center text-sm text-cream-500">
                  مفيش منتجات — ضيفي أول منتج
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
