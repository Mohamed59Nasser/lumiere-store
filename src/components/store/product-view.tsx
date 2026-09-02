"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Zap,
  Heart,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
  Send,
} from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { cls, fmtMoney, fmtDate, validPhone } from "@/lib/utils";
import { addReview } from "@/server/actions";
import { ProductCard, Stars } from "./product-card";
import type { ProductInfo } from "@/server/queries";

type ReviewRow = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
};

export default function ProductView({
  product: p,
  related,
  reviews,
  myReview,
}: {
  product: ProductInfo;
  related: ProductInfo[];
  reviews: ReviewRow[];
  myReview: { rating: number; comment: string } | null;
}) {
  const { t, lang, settings, addToCart, wishlist, toggleWish, customer, toast } =
    useStore();
  const router = useRouter();
  const [sel, setSel] = useState(0);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [comment, setComment] = useState(myReview?.comment ?? "");
  const [sending, setSending] = useState(false);

  const gallery = useMemo(() => {
    const imgs = [p.mainImage];
    for (const v of p.variants) if (v.image && !imgs.includes(v.image)) imgs.push(v.image);
    for (const i of p.images) if (!imgs.includes(i)) imgs.push(i);
    return imgs.filter(Boolean);
  }, [p]);

  const v = p.variants[sel];
  const inWish = wishlist.includes(p.id);
  const freeShip = parseFloat(settings.freeShipThreshold || "1500");
  const shipFee = parseFloat(settings.shippingFee || "50");
  const price = v ? v.price : p.price;

  const selectVariant = (i: number) => {
    setSel(i);
    setQty(1);
    const img = p.variants[i].image;
    if (img) {
      const idx = gallery.indexOf(img);
      if (idx >= 0) setImgIdx(idx);
    }
  };

  const doAdd = () => {
    if (!v || v.stock <= 0) return;
    addToCart(
      {
        variantId: v.id,
        productId: p.id,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        variantLabelAr: v.labelAr,
        variantLabelEn: v.labelEn,
        price: v.price,
        image: v.image || p.mainImage,
        stock: v.stock,
      },
      qty
    );
  };

  const buyNow = () => {
    if (!v || v.stock <= 0) return;
    addToCart(
      {
        variantId: v.id,
        productId: p.id,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        variantLabelAr: v.labelAr,
        variantLabelEn: v.labelEn,
        price: v.price,
        image: v.image || p.mainImage,
        stock: v.stock,
      },
      qty
    );
    router.push("/checkout");
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    if (!rating || !comment.trim()) {
      toast(t("fill_all"), "err");
      return;
    }
    setSending(true);
    const r = await addReview(p.id, rating, comment);
    setSending(false);
    if (r.ok) {
      toast(t("saved"));
      router.refresh();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* gallery */}
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-ink-850">
            <img
              src={gallery[imgIdx] || p.mainImage}
              alt={lang === "ar" ? p.nameAr : p.nameEn}
              className="aspect-square w-full object-cover"
            />
            {v && v.stock <= 0 && (
              <div className="absolute inset-x-0 bottom-0 bg-ink-950/85 py-3 text-center text-sm font-bold text-cream-100">
                {t("out_of_stock")}
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((g, i) => (
                <button
                  key={g + i}
                  onClick={() => setImgIdx(i)}
                  className={cls(
                    "size-16 shrink-0 overflow-hidden rounded-xl border-2 transition",
                    i === imgIdx ? "border-gold-500" : "border-line opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={g} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div>
          <div className="text-xs font-semibold text-cream-500">
            {lang === "ar" ? p.categoryAr : p.categoryEn}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold text-cream-50 md:text-4xl">
            {lang === "ar" ? p.nameAr : p.nameEn}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <Stars value={p.rating} count={p.ratingCount} size={15} />
            <span className="text-xs text-cream-500">
              {p.ratingCount} {t("reviews")}
            </span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-4xl font-bold text-gold-400">
              {fmtMoney(price, lang)}
            </span>
            {p.comparePrice && p.comparePrice > price && (
              <span className="pb-1 text-sm text-cream-500 line-through">
                {fmtMoney(p.comparePrice, lang)}
              </span>
            )}
          </div>

          {p.variants.length > 0 && (
            <div className="mt-6">
              <div className="label">{t("select_variant")}</div>
              <div className="flex flex-wrap gap-2">
                {p.variants.map((vv, i) => (
                  <button
                    key={vv.id}
                    disabled={vv.stock <= 0}
                    onClick={() => selectVariant(i)}
                    className={cls(
                      "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                      i === sel
                        ? "border-gold-500 bg-gold-500/15 text-gold-300"
                        : "border-line text-cream-300 hover:border-gold-500/40",
                      vv.stock <= 0 && "cursor-not-allowed opacity-40"
                    )}
                  >
                    {vv.image && (
                      <img src={vv.image} alt="" className="size-5 rounded-full object-cover" />
                    )}
                    {lang === "ar" ? vv.labelAr : vv.labelEn || vv.labelAr}
                    <span className="text-xs text-cream-500">
                      {fmtMoney(vv.price, lang)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <span className="label !mb-0">{t("qty")}</span>
            <div className="flex items-center rounded-full border border-line">
              <button
                className="p-2.5 text-cream-300 transition hover:text-gold-300"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus size={15} />
              </button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <button
                className="p-2.5 text-cream-300 transition hover:text-gold-300"
                onClick={() => setQty((q) => Math.min(Math.max(1, v?.stock ?? 1), q + 1))}
              >
                <Plus size={15} />
              </button>
            </div>
            {v && v.stock > 0 && v.stock <= 5 && (
              <span className="text-xs font-semibold text-warn">
                {v.stock} ×
              </span>
            )}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              disabled={!v || v.stock <= 0}
              onClick={doAdd}
              className="btn-gold flex-1 min-w-44"
            >
              <ShoppingBag size={16} />
              {t("add_cart")}
            </button>
            <button
              disabled={!v || v.stock <= 0}
              onClick={buyNow}
              className="btn-ghost flex-1 min-w-40"
            >
              <Zap size={16} />
              {t("buy_now")}
            </button>
            <button
              onClick={() => toggleWish(p.id)}
              className={cls(
                "grid size-12 place-items-center rounded-full border transition",
                inWish
                  ? "border-gold-500 bg-gold-500/15 text-gold-400"
                  : "border-line text-cream-300 hover:border-gold-500/50"
              )}
            >
              <Heart size={18} className={inWish ? "fill-gold-400" : ""} />
            </button>
          </div>

          <div className="card mt-8 space-y-3 p-5 text-sm">
            <div className="flex items-center gap-3 text-cream-200">
              <Truck size={17} className="shrink-0 text-gold-500" />
              {price >= freeShip
                ? t("free_over", { t: freeShip })
                : `${t("ship_fee", { f: shipFee })} — ${t("free_over", { t: freeShip })}`}
            </div>
            <div className="flex items-center gap-3 text-cream-200">
              <RotateCcw size={17} className="shrink-0 text-gold-500" />
              {t("return_14")}
            </div>
            <div className="flex items-center gap-3 text-cream-200">
              <ShieldCheck size={17} className="shrink-0 text-gold-500" />
              {t("quality")}
            </div>
          </div>

          {(p.descAr || p.descEn) && (
            <div className="mt-6">
              <h3 className="label !mb-2 font-display text-sm font-bold text-gold-400">
                {t("desc")}
              </h3>
              <p className="text-sm leading-8 text-cream-300">
                {lang === "ar" ? p.descAr : p.descEn || p.descAr}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* REVIEWS */}
      <section className="mt-16 grid gap-8 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-cream-50">
            {t("write_review")}
          </h3>
          {customer ? (
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <div className="label">{t("your_rating")}</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setRating(i)}
                      className="transition hover:scale-110"
                    >
                      <Star
                        size={26}
                        className={
                          i <= rating
                            ? "fill-gold-500 text-gold-500"
                            : "text-ink-600"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("comment_ph")}
                rows={3}
                className="input resize-none"
              />
              <button type="submit" disabled={sending} className="btn-gold">
                <Send size={15} />
                {t("submit")}
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-gold-400 underline-offset-4 hover:underline"
            >
              {t("login_to_review")} ←
            </Link>
          )}
        </div>

        <div>
          <h3 className="mb-4 font-display text-lg font-bold text-cream-50">
            {t("reviews")}{" "}
            <span className="text-sm text-cream-500">({reviews.length})</span>
          </h3>
          {reviews.length === 0 ? (
            <div className="card p-8 text-center text-sm text-cream-500">
              {t("no_reviews")}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-gold-500/15 font-display text-sm font-bold text-gold-400">
                        {r.customerName[0]}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-cream-100">
                          {r.customerName}
                        </div>
                        <div className="text-[11px] text-cream-500">
                          {fmtDate(r.createdAt, lang)}
                        </div>
                      </div>
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="mt-3 text-sm leading-7 text-cream-300">
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold text-cream-50">
            {t("related")}
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((rp) => (
              <ProductCard key={rp.id} p={rp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
