"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Wallet,
  Smartphone,
  Check,
  Upload,
  Copy,
  Lock,
  MessageCircle,
} from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { cls, fmtMoney, resizeImageFile, validPhone } from "@/lib/utils";
import { placeOrder } from "@/server/actions";

const COUPON_KEY = "lumiere_coupon";

type Props = {
  customer: { id: string; name: string; email: string; phone: string } | null;
  settings: Record<string, string>;
};

export default function CheckoutView({ customer, settings }: Props) {
  const { t, lang, cart, cartSubtotal, clearCart, toast } = useStore();
  const router = useRouter();

  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<"cod" | "wallet" | "instapay">("cod");
  const [proof, setProof] = useState("");
  const [proofSender, setProofSender] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ orderNo: string; orderId: string } | null>(
    null
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COUPON_KEY);
      if (raw) setCoupon(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      if (customer.phone) setPhone(customer.phone);
    }
  }, [customer]);

  const freeShip = parseFloat(settings.freeShipThreshold || "1500");
  const shipFee = parseFloat(settings.shippingFee || "50");
  const discount = coupon?.discount || 0;
  const afterDiscount = Math.max(0, cartSubtotal - discount);
  const shipping = afterDiscount >= freeShip ? 0 : shipFee;
  const total = afterDiscount + shipping;

  const walletNo = settings.walletNumber || "";
  const instaNo = settings.instapayNumber || "";
  const phoneStore = settings.phone || "01159055625";
  const wa = "2" + phoneStore.replace(/^0/, "");

  const onProofFile = async (f: File | null) => {
    if (!f) return;
    const url = await resizeImageFile(f, 900, 0.8);
    setProof(url);
  };

  const copy = async (v: string) => {
    try {
      await navigator.clipboard.writeText(v);
      toast(t("copied"));
    } catch {
      /* ignore */
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast(t("fill_all"), "err");
      return;
    }
    if (!validPhone(phone)) {
      toast(t("bad_phone"), "err");
      return;
    }
    if (method !== "cod" && (!proof || !proofSender.trim())) {
      toast(t("need_proof"), "err");
      return;
    }
    setBusy(true);
    const r = await placeOrder({
      name,
      phone,
      address,
      city,
      notes,
      paymentMethod: method,
      proofImage: method === "cod" ? undefined : proof,
      proofSender: method === "cod" ? undefined : proofSender,
      couponCode: coupon?.code,
      items: cart.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        qty: i.qty,
      })),
    });
    setBusy(false);
    if (r.ok) {
      try {
        localStorage.removeItem(COUPON_KEY);
      } catch {
        /* ignore */
      }
      clearCart();
      setDone({ orderNo: r.orderNo as string, orderId: r.orderId as string });
      router.refresh();
    } else {
      toast(t("fill_all"), "err");
    }
  };

  if (done) {
    return (
      <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
        <div className="anim-up w-full">
          <span className="mx-auto grid size-20 place-items-center rounded-full border border-good/40 bg-good/15">
            <Check size={36} className="text-good" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold text-cream-50">
            {t("order_placed")}
          </h1>
          <p className="mt-2 text-sm text-cream-400">{t("order_placed_sub")}</p>
          {method !== "cod" && (
            <div className="mt-4 rounded-xl border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn">
              {t("pay_review_note")}
            </div>
          )}
          <div className="card mt-6 flex items-center justify-between px-6 py-4">
            <span className="text-sm text-cream-400">{t("order")}</span>
            <span className="font-display text-lg font-bold text-gold-400" dir="ltr">
              {done.orderNo}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={`/order/${done.orderId}`} className="btn-gold">
              {t("track_order")}
            </Link>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn-ghost">
              <MessageCircle size={15} />
              {t("whatsapp")}
            </a>
            <Link href="/shop" className="btn-ghost">
              {t("cta_shop")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="mx-auto grid max-w-md place-items-center px-4 py-24 text-center">
        <div className="card w-full p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full border border-line bg-ink-850">
            <Lock size={26} className="text-gold-500" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold text-cream-50">
            {t("login_required")}
          </h1>
          <Link
            href="/login?next=/checkout"
            className="btn-gold mt-6 w-full"
          >
            {t("go_login")}
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto grid max-w-md place-items-center px-4 py-24 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-50">
            {t("cart_empty")}
          </h1>
          <Link href="/shop" className="btn-gold mt-5">
            {t("explore")}
          </Link>
        </div>
      </div>
    );
  }

  const methods = [
    { key: "cod" as const, icon: Banknote, title: t("pay_cod"), d: t("pay_cod_d") },
    { key: "wallet" as const, icon: Wallet, title: t("pay_wallet"), d: t("pay_wallet_d"), num: walletNo },
    { key: "instapay" as const, icon: Smartphone, title: t("pay_insta"), d: t("pay_insta_d"), num: instaNo },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 font-display text-3xl font-bold text-cream-50">
        {t("checkout_title")}
      </h1>
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* delivery */}
          <div className="card p-6">
            <h2 className="mb-5 font-display text-lg font-bold text-cream-50">
              1. {t("your_info")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{t("full_name")}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">{t("phone")}</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                  dir="ltr"
                  placeholder={t("ph_phone")}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">{t("address")}</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input"
                  placeholder={t("footer_about")}
                />
              </div>
              <div>
                <label className="label">{t("city")}</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">{t("notes")}</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
              </div>
            </div>
          </div>

          {/* payment */}
          <div className="card p-6">
            <h2 className="mb-5 font-display text-lg font-bold text-cream-50">
              2. {t("payment")}
            </h2>
            <div className="grid gap-3">
              {methods.map((m) => (
                <div key={m.key}>
                  <button
                    type="button"
                    onClick={() => setMethod(m.key)}
                    className={cls(
                      "flex w-full items-center gap-4 rounded-2xl border p-4 text-start transition",
                      method === m.key
                        ? "border-gold-500 bg-gold-500/10"
                        : "border-line hover:border-gold-500/40"
                    )}
                  >
                    <span
                      className={cls(
                        "grid size-10 shrink-0 place-items-center rounded-full border",
                        method === m.key
                          ? "border-gold-500 bg-gold-500/20 text-gold-400"
                          : "border-line text-cream-400"
                      )}
                    >
                      <m.icon size={18} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-bold text-cream-100">{m.title}</span>
                      <span className="block text-xs text-cream-500">{m.d}</span>
                    </span>
                    <span
                      className={cls(
                        "grid size-5 place-items-center rounded-full border",
                        method === m.key ? "border-gold-500" : "border-ink-500"
                      )}
                    >
                      {method === m.key && <span className="size-2.5 rounded-full bg-gold-500" />}
                    </span>
                  </button>

                  {method === m.key && m.key !== "cod" && m.num && (
                    <div className="anim-in mt-2 space-y-4 rounded-2xl border border-line bg-ink-850 p-4">
                      <div>
                        <div className="label">
                          {m.key === "wallet" ? t("wallet_number") : t("insta_number")}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex-1 rounded-xl bg-ink-900 px-4 py-3 font-display text-lg font-bold tracking-wider text-gold-300" dir="ltr">
                            {m.num}
                          </span>
                          <button
                            type="button"
                            onClick={() => copy(m.num)}
                            className="btn-ghost !px-4 !py-3 text-xs"
                          >
                            <Copy size={14} />
                            {t("copy")}
                          </button>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <div className="label">{t("proof")}</div>
                          <label
                            className={cls(
                              "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-xs font-semibold transition",
                              proof
                                ? "border-good/50 text-good"
                                : "border-line text-cream-400 hover:border-gold-500/50"
                            )}
                          >
                            <Upload size={15} />
                            {proof ? t("submit") + " ✓" : t("proof_hint")}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => onProofFile(e.target.files?.[0] ?? null)}
                            />
                          </label>
                          {proof && (
                            <img
                              src={proof}
                              alt="proof"
                              className="mt-2 h-28 rounded-xl border border-line object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <label className="label">{t("proof_sender")}</label>
                          <input
                            value={proofSender}
                            onChange={(e) => setProofSender(e.target.value)}
                            className="input"
                            dir="ltr"
                            placeholder="01xxxxxxxxx"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* summary */}
        <div>
          <div className="card sticky top-24 p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-cream-50">
              {t("items")} ({cart.length})
            </h3>
            <div className="max-h-64 space-y-3 overflow-y-auto pe-1">
              {cart.map((i) => (
                <div key={i.variantId} className="flex items-center gap-3">
                  <img src={i.image} alt="" className="size-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-cream-200">
                      {lang === "ar" ? i.nameAr : i.nameEn}
                    </div>
                    <div className="text-[11px] text-cream-500">
                      {lang === "ar" ? i.variantLabelAr : i.variantLabelEn} × {i.qty}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-cream-300">
                    {fmtMoney(i.price * i.qty, lang)}
                  </span>
                </div>
              ))}
            </div>
            <div className="divider my-4" />
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
            <button type="submit" disabled={busy} className="btn-gold mt-5 w-full">
              <Check size={16} />
              {busy ? "..." : t("checkout")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
