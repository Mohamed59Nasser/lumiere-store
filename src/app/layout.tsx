import type { Metadata } from "next";
import type { ReactNode } from "react";
import { El_Messiri, Tajawal, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { getStoreContext } from "@/server/queries";
import { StoreProvider } from "@/lib/store-provider";

const messiri = El_Messiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-messiri",
});
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Lumière | لوميير — إكسسوارات حريمي فاخرة",
  description:
    "سلاسل، خواتم، أقراط وأساور بتصاميم عصرية — شحن لكل مصر، استبدال خلال 14 يوم، والدفع كاش أو محفظة أو انستا باي.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let customer: { id: string; name: string; email: string; phone: string } | null =
    null;
  let wishlistIds: string[] = [];
  let settings: Record<string, string> = {};
  try {
    const ctx = await getStoreContext();
    customer = ctx.customer;
    wishlistIds = ctx.wishlistIds;
    settings = ctx.settings;
  } catch {
    /* db not ready yet */
  }

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${messiri.variable} ${tajawal.variable} ${cormorant.variable}`}
    >
      <body>
        <StoreProvider
          customer={customer}
          wishlistIds={wishlistIds}
          settings={settings}
        >
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
