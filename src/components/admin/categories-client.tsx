"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { saveCategory, deleteCategory } from "@/server/actions";

type Row = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  sort: number;
  count: number;
};

export default function CategoriesClient({ rows }: { rows: Row[] }) {
  const { toast } = useStore();
  const router = useRouter();
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editAr, setEditAr] = useState("");
  const [editEn, setEditEn] = useState("");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await saveCategory({ nameAr, nameEn, slug: "", sort: rows.length });
    if (r.ok) {
      setNameAr("");
      setNameEn("");
      toast("اتضافت الفئة");
      router.refresh();
    } else {
      toast("اكتبي اسم الفئة", "err");
    }
  };

  const saveEdit = async (id: string) => {
    const r = await saveCategory({ id, nameAr: editAr, nameEn: editEn, slug: "", sort: 0 });
    if (r.ok) {
      setEditing(null);
      toast("اتحفظ");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-cream-50">الفئات</h1>
        <p className="mt-1 text-xs text-cream-500">
          ضيفي أو شيلي فئات براحتك — مفيش حد محسوب
        </p>
      </div>

      <form onSubmit={add} className="card grid gap-3 p-6 md:grid-cols-[1fr_1fr_auto]">
        <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="اسم الفئة (عربي) — مثلاً: أقراط" className="input" />
        <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="English name — Earrings" className="input" dir="ltr" />
        <button type="submit" className="btn-gold">
          <Plus size={15} />
          إضافة فئة
        </button>
      </form>

      <div className="card divide-y divide-line/60">
        {rows.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 p-4">
            {editing === c.id ? (
              <>
                <input value={editAr} onChange={(e) => setEditAr(e.target.value)} className="input flex-1 min-w-40" />
                <input value={editEn} onChange={(e) => setEditEn(e.target.value)} className="input flex-1 min-w-40" dir="ltr" />
                <button onClick={() => saveEdit(c.id)} className="btn-gold !px-4 !py-2 text-xs">
                  <Check size={14} />
                  حفظ
                </button>
                <button onClick={() => setEditing(null)} className="btn-ghost !px-4 !py-2 text-xs">
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <div className="text-sm font-bold text-cream-100">{c.nameAr}</div>
                  <div className="text-[11px] text-cream-500" dir="ltr">
                    {c.nameEn} · {c.slug}
                  </div>
                </div>
                <span className="rounded-full bg-ink-800 px-3 py-1 text-[11px] font-bold text-cream-300">
                  {c.count} منتج
                </span>
                <button
                  onClick={() => {
                    setEditing(c.id);
                    setEditAr(c.nameAr);
                    setEditEn(c.nameEn);
                  }}
                  className="grid size-8 place-items-center rounded-lg border border-line text-cream-300 transition hover:border-gold-500/50 hover:text-gold-300"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={async () => {
                    if (c.count > 0) {
                      toast("في منتجات مرتبطة بالفئة — انقليهم الأول", "err");
                      return;
                    }
                    if (!confirm(`حذف فئة «${c.nameAr}»؟`)) return;
                    await deleteCategory(c.id);
                    toast("اتحذفت");
                    router.refresh();
                  }}
                  className="grid size-8 place-items-center rounded-lg border border-line text-cream-300 transition hover:border-bad/50 hover:text-bad"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <div className="p-10 text-center text-sm text-cream-500">
            مفيش فئات — ضيفي أول فئة
          </div>
        )}
      </div>
    </div>
  );
}
