"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X, SearchX } from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { ProductCard } from "./product-card";
import { cls } from "@/lib/utils";
import type { CategoryInfo, ProductInfo } from "@/server/queries";

type Data = { products: ProductInfo[]; categories: CategoryInfo[] };

export default function ShopView({
  data,
  q,
  cat,
  sort,
}: {
  data: Data;
  q?: string;
  cat?: string;
  sort?: string;
}) {
  const { t, lang } = useStore();
  const [catF, setCatF] = useState<string>(cat || "");
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [sortF, setSortF] = useState<string>(sort || "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...data.products];
    if (catF) list = list.filter((p) => p.categoryId === catF);
    const min = parseFloat(minP) || 0;
    const max = parseFloat(maxP) || Infinity;
    list = list.filter((p) => p.price >= min && p.price <= max);
    if (sortF === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sortF === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sortF === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortF === "new")
      list.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    return list;
  }, [data.products, catF, minP, maxP, sortF]);

  const Filters = (
    <div className="space-y-7">
      <div>
        <div className="label">{t("category")}</div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setCatF("")}
            className={cls(
              "rounded-lg px-3 py-2 text-start text-sm font-semibold transition",
              !catF
                ? "bg-gold-500/15 text-gold-300"
                : "text-cream-300 hover:bg-ink-800"
            )}
          >
            {t("all_cats")}
          </button>
          {data.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCatF(c.id)}
              className={cls(
                "flex items-center justify-between rounded-lg px-3 py-2 text-start text-sm font-semibold transition",
                catF === c.id
                  ? "bg-gold-500/15 text-gold-300"
                  : "text-cream-300 hover:bg-ink-800"
              )}
            >
              <span>{lang === "ar" ? c.nameAr : c.nameEn}</span>
              <span className="text-[11px] text-cream-500">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="label">{t("price")}</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minP}
            onChange={(e) => setMinP(e.target.value)}
            placeholder={t("min")}
            className="input !py-2 text-xs"
          />
          <span className="text-cream-500">—</span>
          <input
            type="number"
            value={maxP}
            onChange={(e) => setMaxP(e.target.value)}
            placeholder={t("max")}
            className="input !py-2 text-xs"
          />
        </div>
      </div>

      <button
        onClick={() => {
          setCatF("");
          setMinP("");
          setMaxP("");
          setSortF("");
        }}
        className="text-xs font-bold text-gold-400 underline-offset-4 hover:underline"
      >
        {t("clear_filters")}
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-cream-50">
            {q ? `« ${q} »` : t("shop_title")}
          </h1>
          <div className="mt-1 text-xs text-cream-500">
            {filtered.length} {t("products_n")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="btn-ghost !px-4 !py-2 text-xs md:hidden"
          >
            <SlidersHorizontal size={14} />
            {t("filters")}
          </button>
          <select
            value={sortF}
            onChange={(e) => setSortF(e.target.value)}
            className="input w-44 !py-2.5 text-xs"
          >
            <option value="">{t("sort")}</option>
            <option value="new">{t("sort_new")}</option>
            <option value="price_asc">{t("sort_price_asc")}</option>
            <option value="price_desc">{t("sort_price_desc")}</option>
            <option value="rating">{t("sort_rating")}</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="card sticky top-24 p-5">{Filters}</div>
        </aside>

        <div className="min-w-0 flex-1">
          {filtered.length === 0 ? (
            <div className="card grid place-items-center gap-3 p-16 text-center">
              <SearchX size={40} className="text-ink-500" />
              <div className="font-display text-lg font-bold text-cream-200">
                {t("no_results")}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="anim-in absolute top-0 bottom-0 right-0 w-72 overflow-y-auto bg-ink-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display font-bold text-cream-100">
                {t("filters")}
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-cream-400">
                <X size={18} />
              </button>
            </div>
            {Filters}
          </div>
        </div>
      )}
    </div>
  );
}
