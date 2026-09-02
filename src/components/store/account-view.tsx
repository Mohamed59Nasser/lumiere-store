"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Package,
  Heart,
  User,
  Trash2,
  ShoppingBag,
  LogOut,
  Clock,
} from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { cls, fmtMoney, fmtDate, validPhone } from "@/lib/utils";
import { logout, updateProfile } from "@/server/actions";
import { Stars } from "./product-card";
import type { ProductInfo } from "@/server/queries";

type OrderRow = {
  id: string;
  orderNo: string;
  total: number;
  status: string;
  createdAt: Date;
  items: { id: string; image: string; productName: string; qty: number }[];
};

export type AccountData = {
  customer: { id: string; name: string; email: string; phone: string };
  orders: OrderRow[];
  wishlist: ProductInfo[];
} | null;

export function StatusPill({ status }: { status: string }) {
  const { t } = useStore();
  const map: Record<string, string> = {
    new: "border-warn/40 bg-warn/10 text-warn",
    preparing: "border-gold-500/40 bg-gold-500/10 text-gold-300",
    shipping: "border-gold-500/40 bg-gold-500/10 text-gold-300",
    delivered: "border-good/40 bg-good/10 text-good",
    cancelled: "border-bad/40 bg-bad/10 text-bad",
  };
  return (
    <span
      className={cls(
        "rounded-full border px-3 py-1 text-[11px] font-bold",
        map[status] ?? map.new
      )}
    >
      {t("st_" + status)}
    </span>
  );
}

export default function AccountView({
  data,
  initialTab,
}: {
  data: AccountData;
  initialTab?: string;
}) {
  const { t, lang, customer, toast } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<string>(initialTab || "orders");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
    }
  }, [customer]);

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  if (!data || !customer) {
    return (
      <div className="mx-auto grid max-w-md place-items-center px-4 py-24 text-center">
        <div className="card w-full p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full border border-line bg-ink-850">
            <User size={26} className="text-gold-500" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold text-cream-50">
            {t("login_required")}
          </h1>
          <Link href="/login?next=/account" className="btn-gold mt-6 w-full">
            {t("go_login")}
          </Link>
        </div>
      </div>
    );
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast(t("fill_all"), "err");
      return;
    }
    if (phone && !validPhone(phone)) {
      toast(t("bad_phone"), "err");
      return;
    }
    const r = await updateProfile({ name, phone, password: pass || undefined });
    if (r.ok) {
      setPass("");
      toast(t("saved"));
      router.refresh();
    }
  };

  const tabs = [
    { k: "orders", label: t("ac_orders"), icon: Package },
    { k: "wish", label: t("ac_wish"), icon: Heart },
    { k: "profile", label: t("ac_profile"), icon: User },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full border border-gold-500/40 bg-gold-500/10 font-display text-xl font-bold text-gold-400">
          {customer.name[0]}
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-50">
            {customer.name}
          </h1>
          <div className="text-xs text-cream-500" dir="ltr">
            {customer.email}
          </div>
        </div>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto">
        {tabs.map((tb) => (
          <button
            key={tb.k}
            onClick={() => setTab(tb.k)}
            className={cls(
              "flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition",
              tab === tb.k
                ? "border-gold-500 bg-gold-500/15 text-gold-300"
                : "border-line text-cream-300 hover:border-gold-500/40"
            )}
          >
            <tb.icon size={15} />
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="space-y-4">
          {data.orders.length === 0 ? (
            <div className="card grid place-items-center gap-3 p-16 text-center">
              <Package size={36} className="text-ink-500" />
              <div className="text-sm text-cream-400">{t("no_orders")}</div>
              <Link href="/shop" className="btn-gold mt-2">
                {t("explore")}
              </Link>
            </div>
          ) : (
            data.orders.map((o) => (
              <Link
                key={o.id}
                href={`/order/${o.id}`}
                className="card flex flex-wrap items-center gap-4 p-5 transition hover:border-gold-500/40"
              >
                <div className="flex -space-x-3 space-x-reverse">
                  {o.items.slice(0, 3).map((it) => (
                    <img
                      key={it.id}
                      src={it.image}
                      alt=""
                      className="size-12 rounded-xl border-2 border-ink-900 object-cover"
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-bold text-cream-100" dir="ltr">
                      {o.orderNo}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-cream-500">
                      <Clock size={11} />
                      {fmtDate(o.createdAt, lang)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-cream-500">
                    {o.items.length} {t("items")}
                  </div>
                </div>
                <StatusPill status={o.status} />
                <span className="font-display text-base font-bold text-gold-400">
                  {fmtMoney(o.total, lang)}
                </span>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === "wish" && (
        <div>
          {data.wishlist.length === 0 ? (
            <div className="card grid place-items-center gap-3 p-16 text-center">
              <Heart size={36} className="text-ink-500" />
              <div className="text-sm text-cream-400">{t("ac_wish_empty")}</div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.wishlist.map((p: ProductInfo) => (
                <WishRow key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "profile" && (
        <form onSubmit={saveProfile} className="card max-w-lg space-y-4 p-6">
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
            />
          </div>
          <div>
            <label className="label">
              {t("password")}{" "}
              <span className="text-cream-500">
                ({lang === "ar" ? "اختياري" : "optional"})
              </span>
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="input"
              dir="ltr"
              placeholder="••••••"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-gold">
              {t("save")}
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/");
                router.refresh();
              }}
              className="btn-danger"
            >
              <LogOut size={14} />
              {t("logout")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function WishRow({ p }: { p: ProductInfo }) {
  const { t, lang, toggleWish, addToCart } = useStore();
  return (
    <div className="card flex items-center gap-4 p-4">
      <Link href={`/product/${p.id}`} className="block size-20 shrink-0 overflow-hidden rounded-xl bg-ink-850">
        <img src={p.mainImage} alt="" className="size-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/product/${p.id}`}
          className="block truncate font-display text-sm font-bold text-cream-100 hover:text-gold-300"
        >
          {lang === "ar" ? p.nameAr : p.nameEn}
        </Link>
        <div className="mt-0.5">
          <Stars value={p.rating} size={11} />
        </div>
        <div className="mt-1 text-sm font-bold text-gold-400">
          {fmtMoney(p.price, lang)}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => {
            const v = p.variants[0];
            if (!v || v.stock <= 0) return;
            addToCart({
              variantId: v.id,
              productId: p.id,
              nameAr: p.nameAr,
              nameEn: p.nameEn,
              variantLabelAr: v.labelAr,
              variantLabelEn: v.labelEn,
              price: v.price,
              image: v.image || p.mainImage,
              stock: v.stock,
            });
          }}
          className="btn-gold !px-3 !py-2 text-[11px]"
        >
          <ShoppingBag size={13} />
          {t("add_cart")}
        </button>
        <button
          onClick={() => toggleWish(p.id)}
          className="flex items-center justify-center gap-1 text-[11px] font-semibold text-cream-500 transition hover:text-bad"
        >
          <Trash2 size={12} />
          {t("close")}
        </button>
      </div>
    </div>
  );
}
