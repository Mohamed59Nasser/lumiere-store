"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ShoppingBag, X, Minus, Plus, Heart } from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { cls, fmtMoney } from "@/lib/utils";
import type { ProductInfo, VariantInfo } from "@/server/queries";

export function Stars({
  value,
  count,
  size = 13,
}: {
  value: number;
  count?: number;
  size?: number;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={
              i <= Math.round(value) ? "fill-gold-500 text-gold-500" : "text-ink-600"
            }
          />
        ))}
      </span>
      {typeof count === "number" && count > 0 && (
        <span className="text-[11px] text-cream-500">({count})</span>
      )}
    </span>
  );
}

export function ProductCard({
  p,
  className,
}: {
  p: ProductInfo;
  className?: string;
}) {
  const { t, lang, addToCart, wishlist, toggleWish } = useStore();
  const [sel, setSel] = useState(0);
  const [qv, setQv] = useState(false);
  const [qty, setQty] = useState(1);

  const v = p.variants[sel];
  const secondImg = p.images[1] || (p.variants[1]?.image ?? "");
  const isNew =
    Date.now() - new Date(p.createdAt).getTime() < 21 * 24 * 3600 * 1000;
  const disc =
    p.comparePrice && p.comparePrice > p.price
      ? Math.round((1 - p.price / p.comparePrice) * 100)
      : 0;
  const inWish = wishlist.includes(p.id);
  const name = lang === "ar" ? p.nameAr : p.nameEn;

  const doAdd = (variant: VariantInfo, q: number) => {
    addToCart(
      {
        variantId: variant.id,
        productId: p.id,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        variantLabelAr: variant.labelAr,
        variantLabelEn: variant.labelEn,
        price: variant.price,
        image: variant.image || p.mainImage,
        stock: variant.stock,
      },
      q
    );
    setQv(false);
  };

  return (
    <>
      <div
        className={cls(
          "group card relative overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-[0_10px_40px_rgba(0,0,0,0.45)]",
          className
        )}
      >
        <Link href={`/product/${p.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-ink-850">
            <img
              src={p.mainImage}
              alt={name}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
            />
            {secondImg && (
              <img
                src={secondImg}
                alt=""
                loading="lazy"
                className="absolute inset-0 size-full scale-105 object-cover opacity-0 transition duration-500 group-hover:opacity-100"
              />
            )}
            <div className="absolute top-3 flex flex-col gap-1.5">
              {isNew && (
                <span className="rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-bold text-ink-950">
                  {t("new_badge")}
                </span>
              )}
              {disc > 0 && (
                <span className="rounded-full bg-bad px-2.5 py-1 text-[10px] font-bold text-white">
                  -{disc}%
                </span>
              )}
            </div>
            {p.totalStock <= 0 && (
              <div className="absolute inset-x-0 bottom-0 bg-ink-950/85 py-2 text-center text-xs font-bold text-cream-200">
                {t("out_of_stock")}
              </div>
            )}
          </div>
        </Link>

        <button
          onClick={() => toggleWish(p.id)}
          className={cls(
            "absolute top-3 left-3 grid size-8 place-items-center rounded-full border backdrop-blur transition",
            inWish
              ? "border-gold-500/60 bg-gold-500/20 text-gold-400"
              : "border-line bg-ink-950/70 text-cream-300 hover:text-gold-300"
          )}
          title={t("wishlist")}
        >
          <Heart size={14} className={inWish ? "fill-gold-400" : ""} />
        </button>

        <div className="p-4">
          <div className="text-[11px] font-semibold text-cream-500">
            {lang === "ar" ? p.categoryAr : p.categoryEn}
          </div>
          <Link
            href={`/product/${p.id}`}
            className="mt-1 block truncate font-display text-sm font-bold text-cream-100 transition hover:text-gold-300"
          >
            {name}
          </Link>
          <div className="mt-1.5">
            <Stars value={p.rating} count={p.ratingCount} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-display text-base font-bold text-gold-400">
              {fmtMoney(v ? v.price : p.price, lang)}
            </span>
            {disc > 0 && (
              <span className="text-xs text-cream-500 line-through">
                {fmtMoney(p.comparePrice!, lang)}
              </span>
            )}
          </div>

          {p.variants.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.variants.slice(0, 4).map((vv, i) => (
                <button
                  key={vv.id}
                  onClick={() => setSel(i)}
                  title={lang === "ar" ? vv.labelAr : vv.labelEn || vv.labelAr}
                  className={cls(
                    "flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold transition",
                    i === sel
                      ? "border-gold-500 bg-gold-500/15 text-gold-300"
                      : "border-line text-cream-400 hover:border-gold-500/40",
                    vv.stock <= 0 && "opacity-40"
                  )}
                >
                  {vv.image ? (
                    <img src={vv.image} alt="" className="size-4 rounded-full object-cover" />
                  ) : (
                    <span className="size-2.5 rounded-full bg-ink-600" />
                  )}
                  {lang === "ar" ? vv.labelAr : vv.labelEn || vv.labelAr}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              disabled={!v || v.stock <= 0}
              onClick={() => v && doAdd(v, 1)}
              className="btn-gold flex-1 !px-3 !py-2.5 text-xs"
            >
              <ShoppingBag size={14} />
              {t("add_cart")}
            </button>
            <button
              onClick={() => setQv(true)}
              className="rounded-full border border-line px-3 text-xs font-semibold text-cream-300 transition hover:border-gold-500/50 hover:text-gold-300"
            >
              {t("qview")}
            </button>
          </div>
        </div>
      </div>

      {qv && v && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-4 backdrop-blur-sm"
          onClick={() => setQv(false)}
        >
          <div
            className="anim-up card grid w-full max-w-3xl gap-0 overflow-hidden md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square bg-ink-850">
              <img
                src={v.image || p.mainImage}
                alt={name}
                className="size-full object-cover"
              />
              <button
                onClick={() => setQv(false)}
                className="absolute top-3 left-3 grid size-8 place-items-center rounded-full bg-ink-950/70 text-cream-200 backdrop-blur transition hover:text-gold-300 md:hidden"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col p-6">
              <button
                onClick={() => setQv(false)}
                className="absolute top-4 left-4 hidden size-8 place-items-center rounded-full bg-ink-800 text-cream-300 transition hover:text-gold-300 md:grid"
              >
                <X size={16} />
              </button>
              <div className="text-[11px] font-semibold text-cream-500">
                {lang === "ar" ? p.categoryAr : p.categoryEn}
              </div>
              <h3 className="mt-1 font-display text-xl font-bold text-cream-50">
                {name}
              </h3>
              <div className="mt-2">
                <Stars value={p.rating} count={p.ratingCount} />
              </div>
              <div className="mt-3 font-display text-2xl font-bold text-gold-400">
                {fmtMoney(v.price, lang)}
              </div>

              <div className="mt-4">
                <div className="label">{t("select_variant")}</div>
                <div className="flex flex-wrap gap-2">
                  {p.variants.map((vv, i) => (
                    <button
                      key={vv.id}
                      disabled={vv.stock <= 0}
                      onClick={() => setSel(i)}
                      className={cls(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        i === sel
                          ? "border-gold-500 bg-gold-500/15 text-gold-300"
                          : "border-line text-cream-300 hover:border-gold-500/40",
                        vv.stock <= 0 && "cursor-not-allowed opacity-40"
                      )}
                    >
                      {lang === "ar" ? vv.labelAr : vv.labelEn || vv.labelAr} —{" "}
                      {fmtMoney(vv.price, lang)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <span className="label !mb-0">{t("qty")}</span>
                <div className="flex items-center rounded-full border border-line">
                  <button
                    className="p-2 text-cream-300 hover:text-gold-300"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{qty}</span>
                  <button
                    className="p-2 text-cream-300 hover:text-gold-300"
                    onClick={() => setQty((q) => Math.min(v.stock, q + 1))}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  disabled={v.stock <= 0}
                  onClick={() => doAdd(v, qty)}
                  className="btn-gold flex-1"
                >
                  <ShoppingBag size={15} />
                  {t("add_cart")}
                </button>
              </div>
              <Link
                href={`/product/${p.id}`}
                className="mt-3 text-center text-xs font-semibold text-gold-400 underline-offset-4 hover:underline"
              >
                {t("view_all")} ←
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
