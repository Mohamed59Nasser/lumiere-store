"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Tags,
  Ticket,
  Settings,
  Store,
  LogOut,
  Gem,
} from "lucide-react";
import { cls } from "@/lib/utils";
import { adminLogout } from "@/server/actions";
import { ToastHost } from "@/components/store/chrome";

const links = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/orders", label: "الأوردرات", icon: ClipboardList },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/categories", label: "الفئات", icon: Tags },
  { href: "/admin/coupons", label: "الكوبونات", icon: Ticket },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export function AdminShell({
  name,
  pendingCount,
  children,
}: {
  name: string;
  pendingCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const Nav = (
    <nav className="space-y-1">
      {links.map((l) => {
        const active = l.exact
          ? pathname === l.href
          : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cls(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              active
                ? "bg-gold-500/15 text-gold-300"
                : "text-cream-300 hover:bg-ink-800 hover:text-cream-100"
            )}
          >
            <l.icon size={17} />
            {l.label}
            {l.href === "/admin/orders" && pendingCount > 0 && (
              <span className="ms-auto grid min-w-5 place-items-center rounded-full bg-warn px-1.5 py-0.5 text-[10px] font-bold text-ink-950">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink-950">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-60 flex-col border-l border-line bg-ink-900 p-4 lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-2 px-2 pt-2">
          <span className="grid size-9 place-items-center rounded-xl bg-gold-500/15 text-gold-400">
            <Gem size={18} />
          </span>
          <div>
            <div className="font-display text-base leading-none font-bold text-cream-50">
              لوميير
            </div>
            <div className="mt-0.5 text-[10px] font-semibold text-gold-500">
              لوحة الإدارة
            </div>
          </div>
        </Link>
        {Nav}
        <div className="mt-auto space-y-1 border-t border-line pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-cream-300 transition hover:bg-ink-800"
          >
            <Store size={17} />
            عرض المتجر
          </Link>
          <button
            onClick={async () => {
              await adminLogout();
              router.replace("/admin/login");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-bad transition hover:bg-bad/10"
          >
            <LogOut size={17} />
            خروج
          </button>
        </div>
      </aside>

      {/* mobile topbar */}
      <div className="sticky top-0 z-40 border-b border-line bg-ink-900/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-gold-500/15 text-gold-400">
              <Gem size={15} />
            </span>
            <span className="font-display text-sm font-bold text-cream-50">
              لوميير — إدارة
            </span>
          </Link>
          <button
            onClick={async () => {
              await adminLogout();
              router.replace("/admin/login");
            }}
            className="text-xs font-bold text-bad"
          >
            خروج
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-3">
          {links.map((l) => {
            const active = l.exact
              ? pathname === l.href
              : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cls(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition",
                  active
                    ? "border-gold-500 bg-gold-500/15 text-gold-300"
                    : "border-line text-cream-300"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="lg:mr-60">
        <header className="hidden items-center justify-between border-b border-line bg-ink-900/50 px-8 py-4 lg:flex">
          <div className="text-sm text-cream-400">
            أهلين <span className="font-bold text-gold-300">{name}</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-cream-300 transition hover:text-gold-300"
          >
            <Store size={14} />
            عرض المتجر
          </Link>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
      <ToastHost />
    </div>
  );
}
