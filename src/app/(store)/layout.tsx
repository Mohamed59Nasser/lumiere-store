import type { ReactNode } from "react";
import { Navbar, Footer, ToastHost } from "@/components/store/chrome";
import { getCategories, getSettingsMap } from "@/server/queries";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  let cats = [] as {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    count: number;
    thumb: string;
  }[];
  let settings: Record<string, string> = {};
  try {
    [cats, settings] = await Promise.all([getCategories(), getSettingsMap()]);
  } catch {
    /* db not ready */
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar categories={cats} settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer categories={cats} settings={settings} />
      <ToastHost />
    </div>
  );
}
