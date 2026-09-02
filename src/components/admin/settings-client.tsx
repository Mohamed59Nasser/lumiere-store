"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Store, Truck, Wallet, MessageCircle } from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { saveSettings } from "@/server/actions";

export default function SettingsClient({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const { toast } = useStore();
  const router = useRouter();
  const [f, setF] = useState<Record<string, string>>({
    storeNameAr: settings.storeNameAr || "لوميير",
    storeNameEn: settings.storeNameEn || "Lumière",
    annAr:
      settings.annAr || "🚚 شحن مجاني للطلبات فوق 1500 ج.م — استبدال خلال 14 يوم",
    annEn:
      settings.annEn ||
      "Free shipping over EGP 1500 — 14-day easy returns",
    shippingFee: settings.shippingFee || "60",
    freeShipThreshold: settings.freeShipThreshold || "1500",
    walletNumber: settings.walletNumber || "01159055625",
    instapayNumber: settings.instapayNumber || "01159055625",
    whatsapp: settings.whatsapp || "01159055625",
    phone: settings.phone || "01159055625",
    email: settings.email || "care@lumiere.eg",
    instagram: settings.instagram || "lumiere.eg",
  });
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await saveSettings(f);
    setBusy(false);
    if (r.ok) {
      toast("اتحفظت الإعدادات");
      router.refresh();
    }
  };

  const Field = ({
    k,
    label,
    ltr,
    textarea,
  }: {
    k: string;
    label: string;
    ltr?: boolean;
    textarea?: boolean;
  }) => (
    <div>
      <label className="label">{label}</label>
      {textarea ? (
        <textarea value={f[k]} onChange={(e) => set(k, e.target.value)} rows={2} className="input resize-none" />
      ) : (
        <input
          value={f[k]}
          onChange={(e) => set(k, e.target.value)}
          className="input"
          dir={ltr ? "ltr" : undefined}
        />
      )}
    </div>
  );

  return (
    <form onSubmit={save} className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-50">الإعدادات</h1>
          <p className="mt-1 text-xs text-cream-500">كل حاجة بتظهر للمتجر بتتغير من هنا</p>
        </div>
        <button type="submit" disabled={busy} className="btn-gold">
          <Save size={15} />
          {busy ? "..." : "حفظ كل حاجة"}
        </button>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-gold-400">
          <Store size={16} />
          بيانات المتجر
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field k="storeNameAr" label="اسم المتجر (عربي)" />
          <Field k="storeNameEn" label="اسم المتجر (إنجليزي)" ltr />
          <div className="sm:col-span-2">
            <Field k="annAr" label="شريط الإعلانات (عربي)" textarea />
          </div>
          <div className="sm:col-span-2">
            <Field k="annEn" label="شريط الإعلانات (إنجليزي)" textarea />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-gold-400">
          <Truck size={16} />
          الشحن
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field k="shippingFee" label="رسوم الشحن (ج.م)" ltr />
          <Field k="freeShipThreshold" label="الشحن مجاني فوق (ج.م)" ltr />
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-gold-400">
          <Wallet size={16} />
          الدفع والتحويل
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field k="walletNumber" label="رقم المحفظة (العميل يحول عليه)" ltr />
          <Field k="instapayNumber" label="رقم انستا باي (العميل يحول عليه)" ltr />
        </div>
        <p className="text-[11px] text-cream-500">
          الأوردرات اللي بتتبعت بال تحويل هتفضل «بانتظار التأكيد» لحد ما تدوسي تأكيد في صفحة الأوردر.
        </p>
      </div>

      <div className="card space-y-4 p-6">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-gold-400">
          <MessageCircle size={16} />
          التواصل
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field k="whatsapp" label="واتساب (01xxxxxxxxx)" ltr />
          <Field k="phone" label="رقم الهاتف" ltr />
          <Field k="email" label="الإيميل" ltr />
          <Field k="instagram" label="إنستجرام" ltr />
        </div>
      </div>

      <button type="submit" disabled={busy} className="btn-gold w-full sm:w-auto">
        <Save size={15} />
        {busy ? "..." : "حفظ كل حاجة"}
      </button>
    </form>
  );
}
