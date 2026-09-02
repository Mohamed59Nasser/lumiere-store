import { cls } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  new: { label: "جديد", className: "border-warn/40 bg-warn/10 text-warn" },
  preparing: { label: "قيد التجهيز", className: "border-gold-500/40 bg-gold-500/10 text-gold-300" },
  shipping: { label: "جاري التوصيل", className: "border-gold-500/40 bg-gold-500/10 text-gold-300" },
  delivered: { label: "تم التسليم", className: "border-good/40 bg-good/10 text-good" },
  cancelled: { label: "ملغي", className: "border-bad/40 bg-bad/10 text-bad" },
};

const PAY_MAP: Record<string, { label: string; className: string }> = {
  cod: { label: "كاش عند الاستلام", className: "border-line bg-ink-800 text-cream-300" },
  unconfirmed: { label: "بانتظار التأكيد", className: "border-warn/40 bg-warn/10 text-warn" },
  confirmed: { label: "مؤكّد", className: "border-good/40 bg-good/10 text-good" },
  rejected: { label: "مرفوض", className: "border-bad/40 bg-bad/10 text-bad" },
  collected: { label: "اتتحصّل", className: "border-good/40 bg-good/10 text-good" },
};

export const PAY_METHOD_LABEL: Record<string, string> = {
  cod: "كاش",
  wallet: "محفظة",
  instapay: "انستا باي",
};

export function StatusPill({ status }: { status: string }) {
  const m = STATUS_MAP[status] ?? STATUS_MAP.new;
  return (
    <span className={cls("rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap", m.className)}>
      {m.label}
    </span>
  );
}

export function PayStatusPill({ ps }: { ps: string }) {
  const m = PAY_MAP[ps] ?? PAY_MAP.cod;
  return (
    <span className={cls("rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap", m.className)}>
      {m.label}
    </span>
  );
}
