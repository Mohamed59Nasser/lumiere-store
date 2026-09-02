"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Search,
  Phone,
  Mail,
  AtSign,
  MessageCircle,
  Globe,
} from "lucide-react";
import { useStore } from "@/lib/store-provider";
import { cls } from "@/lib/utils";

type Cat = { id: string; nameAr: string; nameEn: string; slug: string; thumb: string };

export function Logo({ nameAr }: { nameAr: string }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="font-latin text-2xl font-semibold italic text-gold-400">
        Lumière
      </span>
      <span className="text-gold-600">✦</span>
      <span className="font-display text-xl font-semibold text-cream-50">
        {nameAr}
      </span>
    </Link>
  );
}

export function Navbar({
  categories,
  settings,
}: {
  categories: Cat[];
  settings: Record<string, string>;
}) {
  const { t, lang, setLang, cartCount, cartReady, wishlist, customer } =
    useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const ann = lang === "ar" ? settings.annAr : settings.annEn;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
    setOpen(false);
  };

  const nameAr = settings.storeNameAr || "لوميير";

  return (
    <div className="sticky top-0 z-40">
      {ann ? (
        <div className="bg-ink-950 border-b border-line/60 px-4 py-2 text-center text-xs font-medium text-gold-300">
          {ann}
        </div>
      ) : null}
      <header className="border-b border-line bg-ink-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-2 text-cream-300 hover:bg-ink-800 lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label="menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Logo nameAr={nameAr} />
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-cream-200 lg:flex">
            <Link
              href="/"
              className={cls(
                "transition hover:text-gold-400",
                pathname === "/" && "text-gold-400"
              )}
            >
              {t("nav_home")}
            </Link>
            <Link
              href="/shop"
              className={cls(
                "transition hover:text-gold-400",
                pathname?.startsWith("/shop") && "text-gold-400"
              )}
            >
              {t("nav_shop")}
            </Link>
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/shop?cat=${c.id}`}
                className="transition hover:text-gold-400"
              >
                {lang === "ar" ? c.nameAr : c.nameEn}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-cream-200 transition hover:border-gold-500/50 hover:text-gold-300"
              title="Language"
            >
              <Globe size={13} />
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            <form onSubmit={submitSearch} className="hidden items-center md:flex">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search_ph")}
                className="w-44 rounded-s-full border border-line bg-ink-850 py-2 ps-4 pe-2 text-xs outline-none transition placeholder:text-cream-500 focus:border-gold-500/50"
              />
              <button
                type="submit"
                className="grid size-8 place-items-center rounded-e-full bg-gold-500 text-ink-950 transition hover:bg-gold-400"
                aria-label="search"
              >
                <Search size={14} />
              </button>
            </form>

            <Link
              href="/account?tab=wish"
              className="relative rounded-lg p-2 text-cream-200 transition hover:bg-ink-800 hover:text-gold-300"
              title={t("wishlist")}
            >
              <Heart size={20} />
              {cartReady && wishlist.length > 0 && (
                <span className="absolute -top-0.5 -left-0.5 grid size-4 place-items-center rounded-full bg-gold-500 text-[10px] font-bold text-ink-950">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="relative rounded-lg p-2 text-cream-200 transition hover:bg-ink-800 hover:text-gold-300"
              title={t("cart")}
            >
              <ShoppingBag size={20} />
              {cartReady && cartCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 grid size-4 place-items-center rounded-full bg-gold-500 text-[10px] font-bold text-ink-950">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href={customer ? "/account" : "/login"}
              className="flex items-center gap-2 rounded-lg p-2 text-cream-200 transition hover:bg-ink-800 hover:text-gold-300"
              title={t("account")}
            >
              <User size={20} />
              {customer && (
                <span className="hidden text-xs font-semibold xl:block">
                  {customer.name.split(" ")[0]}
                </span>
              )}
            </Link>
          </div>
        </div>

        {open && (
          <div className="border-t border-line bg-ink-900 px-4 py-4 lg:hidden">
            <form onSubmit={submitSearch} className="mb-3 flex md:hidden">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search_ph")}
                className="input rounded-e-none"
              />
              <button type="submit" className="btn-gold rounded-s-none px-4">
                <Search size={16} />
              </button>
            </form>
            <div className="flex flex-col gap-1 text-sm font-semibold">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 hover:bg-ink-800"
              >
                {t("nav_home")}
              </Link>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 hover:bg-ink-800"
              >
                {t("nav_shop")}
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?cat=${c.id}`}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-cream-300 hover:bg-ink-800"
                >
                  {lang === "ar" ? c.nameAr : c.nameEn}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export function Footer({
  categories,
  settings,
}: {
  categories: Cat[];
  settings: Record<string, string>;
}) {
  const { t, lang } = useStore();
  const phone = settings.phone || "01159055625";
  const wa = "2" + phone.replace(/^0/, "");
  const email = settings.email || "care@lumiere.eg";
  const ig = settings.instagram || "lumiere.eg";
  const nameAr = settings.storeNameAr || "لوميير";
  const nameEn = settings.storeNameEn || "Lumière";

  return (
    <footer className="border-t border-line bg-ink-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo nameAr={nameAr} />
          <p className="mt-4 text-sm leading-7 text-cream-400">
            {t("footer_about")}
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-full border border-line text-cream-300 transition hover:border-gold-500/60 hover:text-gold-300"
              title={t("whatsapp")}
            >
              <MessageCircle size={16} />
            </a>
            <a
              href={`https://instagram.com/${ig.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-full border border-line text-cream-300 transition hover:border-gold-500/60 hover:text-gold-300"
              title="Instagram"
            >
              <AtSign size={16} />
            </a>
            <a
              href={`tel:${phone}`}
              className="grid size-9 place-items-center rounded-full border border-line text-cream-300 transition hover:border-gold-500/60 hover:text-gold-300"
              title={t("call")}
            >
              <Phone size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-bold text-gold-400">
            {t("category")}
          </h4>
          <ul className="space-y-2.5 text-sm text-cream-300">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/shop?cat=${c.id}`}
                  className="transition hover:text-gold-300"
                >
                  {lang === "ar" ? c.nameAr : c.nameEn}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-bold text-gold-400">
            {t("quick_links")}
          </h4>
          <ul className="space-y-2.5 text-sm text-cream-300">
            <li>
              <Link href="/shop" className="transition hover:text-gold-300">
                {t("nav_shop")}
              </Link>
            </li>
            <li>
              <Link
                href="/account"
                className="transition hover:text-gold-300"
              >
                {t("track_order")}
              </Link>
            </li>
            <li>
              <Link
                href="/account?tab=wish"
                className="transition hover:text-gold-300"
              >
                {t("wishlist")}
              </Link>
            </li>
            <li>
              <Link
                href={lang === "ar" ? nameAr : nameEn ? "/" : "/"}
                className="transition hover:text-gold-300"
              >
                {t("nav_home")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-bold text-gold-400">
            {t("contact_us")}
          </h4>
          <ul className="space-y-3 text-sm text-cream-300">
            <li>
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 transition hover:text-gold-300"
              >
                <Phone size={14} className="text-gold-500" />
                <span dir="ltr">{phone}</span>
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition hover:text-gold-300"
              >
                <MessageCircle size={14} className="text-gold-500" />
                {t("whatsapp")}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 transition hover:text-gold-300"
              >
                <Mail size={14} className="text-gold-500" />
                <span dir="ltr">{email}</span>
              </a>
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {[t("pay_cod"), t("pay_wallet"), t("pay_insta")].map((m) => (
              <span
                key={m}
                className="rounded-full border border-line bg-ink-850 px-3 py-1 text-[11px] font-semibold text-cream-300"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-cream-500">
        {t("rights", { y: new Date().getFullYear() })}
      </div>
    </footer>
  );
}

export function ToastHost() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed top-20 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cls(
            "anim-in rounded-full border px-5 py-2.5 text-sm font-semibold shadow-2xl backdrop-blur",
            t.type === "ok"
              ? "border-gold-500/40 bg-ink-800/95 text-gold-300"
              : "border-bad/40 bg-ink-800/95 text-bad"
          )}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
