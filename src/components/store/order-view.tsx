"use client";

import Link from "next/link";
import {
  Package,
  Truck,
  Home,
  PhoneCall,
  MessageCircle,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { cls, fmtMoney, fmtDateTime } from "@/lib/utils";

type Order = {
  id: string;
  orderNo: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  proofImage: string | null;
  proofSender: string;
  createdAt: Date;
};
type Item = {
  id: string;
  productName: string;
  variantLabel: string;
  price: number;
  qty: number;
  image: string;
};
type EventRow = { id: string; label: string; at: Date };

export function PayStatusPill({ ps }: { ps: string }) {
  const { t } = useStore();
  const map: Record<string, string> = {
    cod: "border-line bg-ink-800 text-cream-300",
    unconfirmed: "border-warn/40 bg-warn/10 text-warn",
    confirmed: "border-good/40 bg-good/10 text-good",
    rejected: "border-bad/40 bg-bad/10 text-bad",
    collected: "border-good/40 bg-good/10 text-good",
  };
  const label: Record<string, string> = {
    cod: "ps_cod",
    unconfirmed: "ps_unconfirmed",
    confirmed: "ps_confirmed",
    rejected: "ps_rejected",
    collected: "ps_collected",
  };
  return (
    <span className={cls("rounded-full border px-3 py-1 text-[11px] font-bold", map[ps] ?? map.cod)}>
      {t(label[ps] ?? "ps_cod")}
    </span>
  );
}

export default function OrderView({
  order,
  items,
  events,
}: {
  order: Order;
  items: Item[];
  events: EventRow[];
}) {
  const { t, lang, settings } = useStore();
  const phoneStore = settings.phone || "01159055625";
  const wa = "2" + phoneStore.replace(/^0/, "");

  const steps = ["new", "preparing", "shipping", "delivered"];
  const cancelled = order.status === "cancelled";
  const currentIdx = steps.indexOf(order.status);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-cream-500">{t("track_title")}</div>
          <h1 className="font-display text-3xl font-bold text-cream-50" dir="ltr">
            {order.orderNo}
          </h1>
        </div>
        <PayStatusPill ps={order.paymentStatus} />
      </div>

      {/* stepper */}
      <div className="card p-6">
        {cancelled ? (
          <div className="flex items-center gap-3 text-bad">
            <XCircle size={22} />
            <span className="font-display text-lg font-bold">{t("st_cancelled")}</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {steps.map((st, i) => {
              const done = i <= currentIdx;
              const icons = {
                new: Package,
                preparing: Clock,
                shipping: Truck,
                delivered: Home,
              } as const;
              const Icon = icons[st as keyof typeof icons];
              return (
                <div key={st} className="flex flex-col items-center gap-2">
                  <div className="flex w-full items-center">
                    <div className={cls("h-0.5 flex-1", i === 0 ? "bg-transparent" : done ? "bg-gold-500" : "bg-ink-700")} />
                    <span
                      className={cls(
                        "grid size-11 shrink-0 place-items-center rounded-full border transition",
                        done
                          ? "border-gold-500 bg-gold-500/15 text-gold-400"
                          : "border-line text-cream-500"
                      )}
                    >
                      <Icon size={18} />
                    </span>
                    <div className={cls("h-0.5 flex-1", i === steps.length - 1 ? "bg-transparent" : i < currentIdx ? "bg-gold-500" : "bg-ink-700")} />
                  </div>
                  <span className={cls("text-center text-[11px] font-bold", done ? "text-gold-300" : "text-cream-500")}>
                    {t("st_" + st)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* events timeline */}
        <div className="mt-8 space-y-0">
          {[...events].reverse().map((ev, i) => (
            <div key={ev.id} className="relative flex gap-4 pb-6 last:pb-0">
              {i < events.length - 1 && (
                <span className="absolute top-6 left-[9px] h-full w-px bg-line" />
              )}
              <span
                className={cls(
                  "relative mt-1 grid size-5 shrink-0 place-items-center rounded-full border",
                  i === 0
                    ? "border-gold-500 bg-gold-500/20 text-gold-400"
                    : "border-line text-cream-500"
                )}
              >
                <CheckCircle2 size={12} />
              </span>
              <div>
                <div className={cls("text-sm font-bold", i === 0 ? "text-gold-300" : "text-cream-300")}>
                  {ev.label}
                </div>
                <div className="text-[11px] text-cream-500">
                  {fmtDateTime(ev.at, lang)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* items */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="mb-4 font-display text-lg font-bold text-cream-50">
            {t("items")}
          </h3>
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-4">
                <img src={it.image} alt="" className="size-16 rounded-xl border border-line object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-cream-100">{it.productName}</div>
                  <div className="text-xs text-cream-500">{it.variantLabel}</div>
                </div>
                <div className="text-xs text-cream-400">× {it.qty}</div>
                <div className="text-sm font-bold text-gold-400">
                  {fmtMoney(it.price * it.qty, lang)}
                </div>
              </div>
            ))}
          </div>

          <div className="divider my-5" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-cream-300">
              <span>{t("subtotal")}</span>
              <span>{fmtMoney(order.subtotal, lang)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-good">
                <span>{t("discount")}</span>
                <span>-{fmtMoney(order.discount, lang)}</span>
              </div>
            )}
            <div className="flex justify-between text-cream-300">
              <span>{t("shipping")}</span>
              <span>{order.shipping === 0 ? t("free") : fmtMoney(order.shipping, lang)}</span>
            </div>
            <div className="flex justify-between pt-1 font-display text-lg font-bold text-gold-400">
              <span>{t("total")}</span>
              <span>{fmtMoney(order.total, lang)}</span>
            </div>
          </div>
        </div>

        {/* side */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-cream-50">
              <MapPin size={16} className="text-gold-500" />
              {t("your_info")}
            </h3>
            <div className="space-y-1.5 text-sm text-cream-300">
              <div className="font-bold text-cream-100">{order.customerName}</div>
              <div dir="ltr" className="text-start">{order.phone}</div>
              <div>{order.address}</div>
              {order.city && <div>{order.city}</div>}
              {order.notes && (
                <div className="mt-2 rounded-lg bg-ink-850 px-3 py-2 text-xs text-cream-400">
                  {order.notes}
                </div>
              )}
            </div>
          </div>

          {order.proofImage && (
            <div className="card p-6">
              <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-cream-50">
                <ImageIcon size={16} className="text-gold-500" />
                {t("proof")}
              </h3>
              <img
                src={order.proofImage}
                alt="proof"
                className="w-full rounded-xl border border-line object-cover"
              />
              {order.proofSender && (
                <div className="mt-2 text-xs text-cream-400">
                  {t("proof_from")}: <span dir="ltr">{order.proofSender}</span>
                </div>
              )}
            </div>
          )}

          <div className="card space-y-2 p-6">
            <h3 className="mb-3 font-display text-base font-bold text-cream-50">
              {t("contact_us")}
            </h3>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn-gold w-full">
              <MessageCircle size={15} />
              {t("whatsapp")}
            </a>
            <a href={`tel:${phoneStore}`} className="btn-ghost w-full">
              <PhoneCall size={15} />
              <span dir="ltr">{phoneStore}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="text-xs font-bold text-gold-400 hover:underline">
          ← {t("back_home")}
        </Link>
      </div>
    </div>
  );
}
