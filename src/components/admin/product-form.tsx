"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ImagePlus, Plus, X } from "lucide-react";
import { cls, resizeImageFile } from "@/lib/utils";
import { useStore } from "@/lib/store-provider";
import { saveProduct } from "@/server/actions";

export type ProductSeed = {
  id?: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  categoryId: string;
  comparePrice: number | null;
  images: string[];
  featured: boolean;
  bestSeller: boolean;
  active: boolean;
};

type CatOpt = { id: string; nameAr: string; nameEn: string };

type VRow = {
  key: string;
  labelAr: string;
  labelEn: string;
  price: string;
  stock: string;
  image: string;
};

type RawVariant = {
  id: string;
  labelAr: string;
  labelEn: string;
  price: number;
  stock: number;
  image: string | null;
};

export default function ProductForm({
  product,
  rawVariants,
  categories,
}: {
  product: ProductSeed | null;
  rawVariants: RawVariant[];
  categories: CatOpt[];
}) {
  const router = useRouter();
  const { toast } = useStore();

  const [nameAr, setNameAr] = useState(product?.nameAr ?? "");
  const [nameEn, setNameEn] = useState(product?.nameEn ?? "");
  const [descAr, setDescAr] = useState(product?.descAr ?? "");
  const [descEn, setDescEn] = useState(product?.descEn ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [comparePrice, setComparePrice] = useState(product?.comparePrice ? String(product.comparePrice) : "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [bestSeller, setBestSeller] = useState(product?.bestSeller ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [images, setImages] = useState<string[]>(product?.images?.length ? product.images : []);
  const [variants, setVariants] = useState<VRow[]>(
    rawVariants.length
      ? rawVariants.map((v) => ({
          key: v.id,
          labelAr: v.labelAr,
          labelEn: v.labelEn,
          price: String(v.price),
          stock: String(v.stock),
          image: v.image ?? "",
        }))
      : [{ key: "v1", labelAr: "", labelEn: "", price: "", stock: "10", image: "" }]
  );
  const [busy, setBusy] = useState(false);

  const addImages = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files).slice(0, 6)) {
      const url = await resizeImageFile(f, 1100, 0.82);
      setImages((prev) => [...prev, url]);
    }
  };

  const setVariantImage = async (key: string, f: File | null) => {
    if (!f) return;
    const url = await resizeImageFile(f, 900, 0.8);
    setVariants((prev) => prev.map((v) => (v.key === key ? { ...v, image: url } : v)));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await saveProduct({
      id: product?.id,
      nameAr,
      nameEn,
      descAr,
      descEn,
      categoryId,
      price: 0,
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      mainImage: images[0] ?? "",
      images,
      featured,
      bestSeller,
      active,
      variants: variants.map((v) => ({
        id: v.key,
        labelAr: v.labelAr,
        labelEn: v.labelEn,
        price: parseFloat(v.price) || 0,
        stock: parseInt(v.stock) || 0,
        image: v.image || undefined,
      })),
    });
    setBusy(false);
    if (r.ok) {
      toast("اتحفظ");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast("كملي البيانات المطلوبة (اسم + متغير بسعر)", "err");
    }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-cream-50">
          {product ? "تعديل منتج" : "منتج جديد"}
        </h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => router.back()} className="btn-ghost !px-4 !py-2 text-xs">
            رجوع
          </button>
          <button type="submit" disabled={busy} className="btn-gold !px-6 !py-2 text-sm">
            {busy ? "..." : "حفظ"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* basic */}
        <div className="card space-y-4 p-6">
          <h3 className="font-display text-sm font-bold text-gold-400">المعلومات الأساسية</h3>
          <div>
            <label className="label">الاسم (عربي) *</label>
            <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">الاسم (إنجليزي)</label>
            <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="input" dir="ltr" />
          </div>
          <div>
            <label className="label">الفئة *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nameAr} — {c.nameEn}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">الوصف (عربي)</label>
            <textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} rows={3} className="input resize-none" />
          </div>
          <div>
            <label className="label">الوصف (إنجليزي)</label>
            <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} className="input resize-none" dir="ltr" />
          </div>
          <div>
            <label className="label">سعر قديم (اختياري — يظهر مشطوب)</label>
            <input type="number" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} className="input" dir="ltr" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { label: "مميز (رئيسية)", v: featured, set: setFeatured },
              { label: "أكثر مبيعاً", v: bestSeller, set: setBestSeller },
              { label: "نشط", v: active, set: setActive },
            ].map((tg) => (
              <button
                key={tg.label}
                type="button"
                onClick={() => tg.set(!tg.v)}
                className={cls(
                  "rounded-xl border px-3 py-2.5 text-[11px] font-bold transition",
                  tg.v
                    ? "border-gold-500 bg-gold-500/15 text-gold-300"
                    : "border-line text-cream-400"
                )}
              >
                {tg.label}
              </button>
            ))}
          </div>
        </div>

        {/* images */}
        <div className="card space-y-4 p-6">
          <h3 className="font-display text-sm font-bold text-gold-400">
            الصور <span className="text-cream-500">(الأولى = الرئيسية)</span>
          </h3>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((img, i) => (
              <div key={img.slice(0, 40) + i} className="group relative aspect-square overflow-hidden rounded-xl border border-line">
                <img src={img} alt="" className="size-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 right-1 rounded-md bg-gold-500 px-1.5 py-0.5 text-[9px] font-bold text-ink-950">
                    رئيسية
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, x) => x !== i))}
                  className="absolute top-1 left-1 grid size-6 place-items-center rounded-full bg-ink-950/80 text-cream-200 opacity-0 transition group-hover:opacity-100 hover:text-bad"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-line text-cream-500 transition hover:border-gold-500/50 hover:text-gold-400">
              <ImagePlus size={22} />
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addImages(e.target.files)} />
            </label>
          </div>
          <p className="text-[11px] text-cream-500">ارفعي حتى 10 صور — بتتضغط أوتوماتيك عشان الصفحة تبقى سريعة.</p>
        </div>
      </div>

      {/* variants */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-gold-400">
            المتغيرات <span className="text-cream-500">(لون / مقاس — كل واحد بسعره ومخزنه)</span>
          </h3>
          <button
            type="button"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                { key: "v" + Date.now().toString(36), labelAr: "", labelEn: "", price: "", stock: "10", image: "" },
              ])
            }
            className="btn-ghost !px-4 !py-2 text-xs"
          >
            <Plus size={13} />
            متغير
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={v.key} className="grid items-center gap-3 rounded-2xl border border-line bg-ink-850 p-4 md:grid-cols-[auto_1fr_1fr_110px_110px_auto]">
              <label className="grid size-14 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-line text-cream-500 transition hover:border-gold-500/50">
                {v.image ? (
                  <img src={v.image} alt="" className="size-full object-cover" />
                ) : (
                  <ImagePlus size={16} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setVariantImage(v.key, e.target.files?.[0] ?? null)}
                />
              </label>
              <input
                value={v.labelAr}
                onChange={(e) =>
                  setVariants((prev) => prev.map((x) => (x.key === v.key ? { ...x, labelAr: e.target.value } : x)))
                }
                placeholder="التسمية (ذهبي / S...)"
                className="input !py-2.5 text-xs"
              />
              <input
                value={v.labelEn}
                onChange={(e) =>
                  setVariants((prev) => prev.map((x) => (x.key === v.key ? { ...x, labelEn: e.target.value } : x)))
                }
                placeholder="English label"
                className="input !py-2.5 text-xs"
                dir="ltr"
              />
              <input
                type="number"
                value={v.price}
                onChange={(e) =>
                  setVariants((prev) => prev.map((x) => (x.key === v.key ? { ...x, price: e.target.value } : x)))
                }
                placeholder="السعر"
                className="input !py-2.5 text-xs"
                dir="ltr"
              />
              <input
                type="number"
                value={v.stock}
                onChange={(e) =>
                  setVariants((prev) => prev.map((x) => (x.key === v.key ? { ...x, stock: e.target.value } : x)))
                }
                placeholder="المخزون"
                className="input !py-2.5 text-xs"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setVariants((prev) => prev.filter((x) => x.key !== v.key))}
                disabled={variants.length === 1}
                className="grid size-9 place-items-center rounded-xl border border-line text-cream-400 transition hover:border-bad/50 hover:text-bad disabled:opacity-30"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-cream-500">
          الصورة جنب كل متغير هيظهر للعميل لما يختار اللون ده — اختياري.
        </p>
      </div>
    </form>
  );
}
