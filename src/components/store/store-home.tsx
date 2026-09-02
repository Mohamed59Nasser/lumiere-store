"use client";

import Link from "next/link";
import {
  Sparkles,
  Truck,
  RotateCcw,
  ShieldCheck,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { ProductCard } from "./product-card";
import type { CategoryInfo, ProductInfo } from "@/server/queries";

type Data = {
  categories: CategoryInfo[];
  featured: ProductInfo[];
  newArrivals: ProductInfo[];
  best: ProductInfo[];
};

function Section({
  title,
  link,
  children,
}: {
  title: string;
  link?: string;
  children: React.ReactNode;
}) {
  const { t } = useStore();
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-cream-50 md:text-3xl">
            {title}
          </h2>
          <div className="divider mt-2 max-w-40" />
        </div>
        {link && (
          <Link
            href={link}
            className="flex items-center gap-1 text-xs font-bold text-gold-400 transition hover:gap-2"
          >
            {t("view_all")}
            <ArrowLeft size={14} className="rtl:rotate-0 ltr:rotate-180" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default function StoreHome({ data }: { data: Data }) {
  const { t, lang, settings } = useStore();
  const phone = settings.phone || "01159055625";
  const wa = "2" + phone.replace(/^0/, "");

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt="Lumière"
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-ink-950 via-ink-950/80 to-ink-950/30 ltr:bg-gradient-to-r" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/60" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-4 py-24">
          <div className="max-w-xl">
            <span className="anim-up inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-ink-950/60 px-4 py-1.5 text-xs font-bold text-gold-300 backdrop-blur">
              <Sparkles size={13} />
              {t("hero_badge")}
            </span>
            <h1 className="anim-up anim-d1 mt-6 font-display text-4xl leading-tight font-bold text-cream-50 md:text-6xl">
              {t("hero_title")}
              <br />
              <span className="gold-text">{t("hero_title_2")}</span>
            </h1>
            <p className="anim-up anim-d2 mt-5 max-w-md text-base leading-8 text-cream-300">
              {t("hero_sub")}
            </p>
            <div className="anim-up anim-d3 mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-gold">
                {t("cta_shop")}
              </Link>
              <Link href="/shop?sort=new" className="btn-ghost">
                {t("cta_new")}
              </Link>
            </div>
            <div className="anim-up anim-d4 mt-10 flex flex-wrap items-center gap-6 text-xs text-cream-400">
              <span className="flex items-center gap-2">
                <Truck size={15} className="text-gold-500" />
                {t("free_over", { t: settings.freeShipThreshold || "1500" })}
              </span>
              <span className="flex items-center gap-2">
                <RotateCcw size={15} className="text-gold-500" />
                {t("return_14")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {data.categories.length > 0 && (
        <section className="border-y border-line bg-ink-900/50">
          <div className="mx-auto max-w-7xl px-4 py-10">
            <h2 className="mb-6 text-center font-display text-2xl font-bold text-cream-50">
              {t("sec_categories")}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {data.categories.map((c, i) => (
                 <Link
                   key={c.id}
                   href={`/shop?cat=${c.id}`}
                   className={`anim-up anim-d${Math.min(i + 1, 4)} group flex flex-col items-center gap-2.5`}
                 >
                <span className="grid size-20 place-items-center overflow-hidden rounded-full border-2 border-line transition group-hover:border-gold-500 group-hover:shadow-[0_0_24px_rgba(212,175,55,0.25)]">
                  {c.thumb ? (
                    <img
                      src={c.thumb}
                      alt={lang === "ar" ? c.nameAr : c.nameEn}
                      className="size-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <Sparkles className="text-gold-600" />
                  )}
                </span>
                <span className="text-xs font-bold text-cream-300 transition group-hover:text-gold-300">
                  {lang === "ar" ? c.nameAr : c.nameEn}
                </span>
              </Link>
            ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED */}
      <Section title={t("sec_featured")} link="/shop">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </Section>

      {/* PROMO BANNER */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="relative overflow-hidden rounded-3xl border border-line">
          <img
            src="/images/banner.jpg"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/70 to-ink-950/40 ltr:bg-gradient-to-b ltr:from-transparent ltr:via-transparent ltr:to-transparent" />
          <div className="relative flex min-h-64 flex-col items-start justify-center gap-3 p-8 md:p-12">
            <h3 className="font-display text-3xl font-bold text-cream-50 md:text-4xl">
              {t("promo_title")}
            </h3>
            <p className="max-w-md text-sm leading-7 text-cream-300">
              {t("promo_sub")}
            </p>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn-gold mt-2">
              <MessageCircle size={16} />
              {t("promo_cta")}
            </a>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <Section title={t("sec_new")} link="/shop?sort=new">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.newArrivals.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </Section>

      {/* WHY US */}
      <section className="border-y border-line bg-ink-900/50">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-cream-50">
            {t("why_title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: t("why_1"), sub: t("why_1s") },
              { icon: Truck, title: t("why_2"), sub: t("why_2s") },
              { icon: RotateCcw, title: t("why_3"), sub: t("why_3s") },
              { icon: MessageCircle, title: t("why_4"), sub: t("why_4s") },
            ].map((f) => (
              <div key={f.title} className="card flex items-start gap-4 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400">
                  <f.icon size={19} />
                </span>
                <div>
                  <div className="font-display text-sm font-bold text-cream-100">
                    {f.title}
                  </div>
                  <div className="mt-1 text-xs leading-6 text-cream-500">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <Section title={t("sec_best")}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.best.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </Section>
    </div>
  );
}
