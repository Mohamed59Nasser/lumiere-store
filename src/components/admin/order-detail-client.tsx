"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  Home,
  Ban,
  MapPin,
  Phone,
  MessageCircle,
  Copy,
  User,
} from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { cls, fmtMoney, fmtDateTime } from "@/lib/utils";
import { setOrderStatus, confirmPayment, rejectPayment } from "@/server/actions";
import { StatusPill, PayStatusPill, PAY_METHOD_LABEL } from "./pills";

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
  couponCode: string | null;
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

export default function OrderDetailClient({
  order,
  items,
  events,
}: {
  order: Order;
  items: Item[];
  events: EventRow[];
}) {
  const { toast } = useStore();
  const router = useRouter();
  const [busy, setBusy] = useState("");

  const act = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    await fn();
    setBusy("");
    toast("اتعمل");
    router.refresh();
  };

  const nextStatus: Record<string, { to: string; label: string; icon: typeof Package } | null> = {
    new: { to: "preparing", label: "ابدئي التجهيز", icon: Package },
    preparing: { to: "shipping", label: "جاري التوصيل", icon: Truck },
    shipping: { to: "delivered", label: "تم التسليم", icon: Home },
    delivered: null,
    cancelled: null,
  };
  const ns = nextStatus[order.status];

  const wa = "2" + order.phone.replace(/^0/, "");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="grid size-9 place-items-center rounded-xl border border-line text-cream-300 transition hover:border-gold-500/50"
          >
            <ArrowRight size={16} className="rtl:rotate-180" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-cream-50" dir="ltr">
              {order.orderNo}
            </h1>
            <div className="text-[11px] text-cream-500">
              {fmtDateTime(order.createdAt)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <PayStatusPill ps={order.paymentStatus} />
          <StatusPill status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* items */}
          <div className="card p-6">
            <h3 className="mb-4 font-display text-base font-bold text-cream-50">المنتجات</h3>
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-4">
                  <img src={it.image} alt="" className="size-14 rounded-xl border border-line object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-cream-100">{it.productName}</div>
                    <div className="text-xs text-cream-500">{it.variantLabel}</div>
                  </div>
                  <div className="text-xs text-cream-400">× {it.qty}</div>
                  <div className="text-sm font-bold text-gold-300">{fmtMoney(it.price * it.qty)}</div>
                </div>
              ))}
            </div>
            <div className="divider my-4" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-cream-300">
                <span>الإجمالي الفرعي</span>
                <span>{fmtMoney(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-good">
                  <span>خصم {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-{fmtMoney(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-cream-300">
                <span>الشحن</span>
                <span>{order.shipping === 0 ? "مجاني" : fmtMoney(order.shipping)}</span>
              </div>
              <div className="flex justify-between pt-1 font-display text-lg font-bold text-gold-400">
                <span>الإجمالي</span>
                <span>{fmtMoney(order.total)}</span>
              </div>
            </div>
          </div>

          {/* timeline */}
          <div className="card p-6">
            <h3 className="mb-4 font-display text-base font-bold text-cream-50">سجل الأوردر</h3>
            <div>
              {[...events].reverse().map((ev, i, arr) => (
                <div key={ev.id} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < arr.length - 1 && (
                    <span className="absolute top-5 left-[8px] h-full w-px bg-line" />
                  )}
                  <span
                    className={cls(
                      "relative mt-0.5 grid size-4.5 size-5 shrink-0 place-items-center rounded-full border",
                      i === 0
                        ? "border-gold-500 bg-gold-500/20 text-gold-400"
                        : "border-line text-cream-500"
                    )}
                  >
                    <span className={cls("size-1.5 rounded-full", i === 0 ? "bg-gold-400" : "bg-ink-500")} />
                  </span>
                  <div>
                    <div className={cls("text-sm font-bold", i === 0 ? "text-gold-300" : "text-cream-300")}>
                      {ev.label}
                    </div>
                    <div className="text-[11px] text-cream-500">{fmtDateTime(ev.at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* actions */}
          <div className="card space-y-3 p-6">
            <h3 className="font-display text-base font-bold text-cream-50">إجراءات</h3>

            {order.paymentMethod !== "cod" &&
              (order.paymentStatus === "unconfirmed" || order.paymentStatus === "rejected") && (
                <>
                  <button
                    disabled={busy !== ""}
                    onClick={() => act("confirm", () => confirmPayment(order.id))}
                    className="btn-gold w-full"
                  >
                    <CheckCircle2 size={16} />
                    تأكيد الدفع
                  </button>
                  {order.paymentStatus === "unconfirmed" && (
                    <button
                      disabled={busy !== ""}
                      onClick={() => act("reject", () => rejectPayment(order.id))}
                      className="btn-danger w-full !py-3"
                    >
                      <XCircle size={14} />
                      رفض الدفع
                    </button>
                  )}
                </>
              )}

            {ns && (
              <button
                disabled={busy !== ""}
                onClick={() => act("status", () => setOrderStatus(order.id, ns.to))}
                className="btn-ghost w-full"
              >
                <ns.icon size={16} />
                {ns.label}
              </button>
            )}

            {order.status !== "cancelled" && order.status !== "delivered" && (
              <button
                disabled={busy !== ""}
                onClick={() => {
                  if (!confirm("متأكدة من إلغاء الأوردر؟ المخزن هيترجع تاني.")) return;
                  act("cancel", () => setOrderStatus(order.id, "cancelled"));
                }}
                className="btn-danger w-full !py-3"
              >
                <Ban size={14} />
                إلغاء الأوردر
              </button>
            )}
          </div>

          {/* customer */}
          <div className="card space-y-2 p-6 text-sm">
            <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-cream-50">
              <User size={16} className="text-gold-500" />
              بيانات العميل
            </h3>
            <div className="font-bold text-cream-100">{order.customerName}</div>
            <a href={`tel:${order.phone}`} className="flex items-center gap-2 text-cream-300 hover:text-gold-300">
              <Phone size={14} className="text-gold-500" />
              <span dir="ltr">{order.phone}</span>
            </a>
            <div className="flex items-start gap-2 text-cream-300">
              <MapPin size={14} className="mt-0.5 shrink-0 text-gold-500" />
              <span>
                {order.address}
                {order.city && ` — ${order.city}`}
              </span>
            </div>
            {order.notes && (
              <div className="mt-1 rounded-lg bg-ink-850 px-3 py-2 text-xs text-cream-400">
                {order.notes}
              </div>
            )}
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost mt-2 w-full !py-2.5 text-xs"
            >
              <MessageCircle size={14} />
              شات واتساب
            </a>
          </div>

          {/* payment */}
          <div className="card space-y-3 p-6">
            <h3 className="font-display text-base font-bold text-cream-50">الدفع</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-cream-400">الطريقة</span>
              <span className="font-bold text-cream-100">
                {PAY_METHOD_LABEL[order.paymentMethod]}
              </span>
            </div>
            {order.paymentMethod !== "cod" && (
              <>
                {order.proofImage ? (
                  <div>
                    <img
                      src={order.proofImage}
                      alt="proof"
                      className="max-h-56 w-full rounded-xl border border-line object-cover"
                    />
                    {order.proofSender && (
                      <div className="mt-2 flex items-center justify-between text-xs text-cream-400">
                        <span>حوّل من: <span dir="ltr">{order.proofSender}</span></span>
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(order.proofSender);
                              toast("اتنسخ");
                            } catch {
                              /* ignore */
                            }
                          }}
                          className="flex items-center gap-1 text-gold-400 hover:underline"
                        >
                          <Copy size={11} />
                          نسخ
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs font-bold text-bad">
                    مفيش صورة تحويل
                  </div>
                )}
              </>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-cream-400">القيمة</span>
              <span className="font-bold text-gold-300">{fmtMoney(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
