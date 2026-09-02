"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  Ticket,
  ArrowLeft,
} from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { cls, fmtMoney } from "@/lib/utils";
import { validateCoupon } from "@/server/actions";

const COUPON_KEY = "lumiere_coupon";

export default function CartPage() {
  const {
    t,
    lang,
    settings,
    cart,
    cartReady,
    cartSubtotal,
    setQty,
    removeItem,
    clearCart,
    toast,
  } = useStore();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );

  // restore saved coupon after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COUPON_KEY);
      if (raw) setCoupon(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const freeShip = parseFloat(settings.freeShipThreshold || "1500");
  const shipFee = parseFloat(settings.shippingFee || "50");
  const discount = coupon?.discount || 0;
  const afterDiscount = Math.max(0, cartSubtotal - discount);
  const shipping = afterDiscount >= freeShip || cart.length === 0 ? 0 : shipFee;
  const total = afterDiscount + shipping;
  const progress = Math.min(100, (afterDiscount / freeShip) * 100);

  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const r = await validateCoupon(code, cartSubtotal);
    if (r.ok) {
      const c = { code: code.trim().toUpperCase(), discount: r.discount as number };
      setCoupon(c);
      setCode("");
      try {
        localStorage.setItem(COUPON_KEY, JSON.stringify(c));
      } catch {
        /* ignore */
      }
      toast(t("coupon_ok"));
    } else {
      toast(
        t(
          r.error === "coupon_min" ? "coupon_min" : "coupon_bad",
          r.error === "coupon_min" ? { v: r.minOrder as number } : undefined
        ),
        "err"
      );
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    try {
      localStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  };

  if (cartReady && cart.length === 0) {
    return (
      <div className="mx-auto grid max-w-7xl place-items-center px-4 py-24 text-center">
        <div>
          <span className="mx-auto grid size-24 place-items-center rounded-full border border-line bg-ink-900">
            <ShoppingBag size={36} className="text-gold-600" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-bold text-cream-50">
            {t("cart_empty")}
          </h1>
          <p className="mt-2 text-sm text-cream-500">{t("cart_empty_sub")}</p>
          <Link href="/shop" className="btn-gold mt-6">
            {t("explore")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-cream-50">
          {t("cart_title")}{" "}
          <span className="text-base text-cream-500">({cart.length})</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-cream-500 transition hover:text-bad"
        >
          {t("clear_cart")}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.map((i) => (
            <div key={i.variantId} className="card flex gap-4 p-4">
              <Link
                href={`/product/${i.productId}`}
                className="block size-24 shrink-0 overflow-hidden rounded-xl bg-ink-850"
              >
                <img src={i.image} alt="" className="size-full object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${i.productId}`}
                      className="block truncate font-display text-sm font-bold text-cream-100 hover:text-gold-300"
                    >
                      {lang === "ar" ? i.nameAr : i.nameEn}
                    </Link>
                    <div className="mt-0.5 text-xs text-cream-500">
                      {lang === "ar" ? i.variantLabelAr : i.variantLabelEn}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(i.variantId)}
                    className="text-cream-500 transition hover:text-bad"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-line">
                    <button
                      className="p-2 text-cream-300 hover:text-gold-300"
                      onClick={() => setQty(i.variantId, i.qty - 1)}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-7 text-center text-sm font-bold">{i.qty}</span>
                    <button
                      className="p-2 text-cream-300 hover:text-gold-300"
                      onClick={() => setQty(i.variantId, i.qty + 1)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="font-display text-base font-bold text-gold-400">
                    {fmtMoney(i.price * i.qty, lang)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* coupon */}
          <div className="card p-5">
            <div className="label flex items-center gap-2">
              <Ticket size={13} className="text-gold-500" />
              {t("coupon")}
            </div>
            {coupon ? (
              <div className="flex items-center justify-between rounded-xl border border-good/30 bg-good/10 px-4 py-3">
                <span className="text-sm font-bold text-good">{coupon.code}</span>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-semibold text-cream-400 hover:text-bad"
                >
                  {t("close")}
                </button>
              </div>
            ) : (
              <form onSubmit={applyCoupon} className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t("coupon_ph")}
                  className="input"
                />
                <button type="submit" className="btn-ghost shrink-0 !px-5">
                  {t("apply")}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* summary */}
        <div>
          <div className="card sticky top-24 p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-cream-50">
              {t("total")}
            </h3>

            <div className="mb-4">
              <div className="mb-1.5 flex justify-between text-xs text-cream-400">
                <span>
                  {afterDiscount >= freeShip
                    ? t("free_reached")
                    : t("free_left", { v: Math.max(0, Math.round(freeShip - afterDiscount)) })}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-gold-600 to-gold-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-cream-300">
                <span>{t("subtotal")}</span>
                <span>{fmtMoney(cartSubtotal, lang)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-good">
                  <span>
                    {t("discount")} {coupon && `(${coupon.code})`}
                  </span>
                  <span>-{fmtMoney(discount, lang)}</span>
                </div>
              )}
              <div className="flex justify-between text-cream-300">
                <span>{t("shipping")}</span>
                <span className={cls(shipping === 0 && "font-bold text-good")}>
                  {shipping === 0 ? t("free") : fmtMoney(shipping, lang)}
                </span>
              </div>
              <div className="divider my-3" />
              <div className="flex justify-between font-display text-lg font-bold text-gold-400">
                <span>{t("total")}</span>
                <span>{fmtMoney(total, lang)}</span>
              </div>
            </div>

            <CheckoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutButton() {
  const { t, customer } = useStore();
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(customer ? "/checkout" : "/login?next=/checkout")}
      className="btn-gold mt-5 w-full"
    >
      {customer ? t("checkout") : t("go_login")}
      <ArrowLeft size={15} className="rtl:rotate-0 ltr:rotate-180" />
    </button>
  );
}
