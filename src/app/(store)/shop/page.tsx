import { getShopData } from "@/server/queries";
import ShopView from "@/components/store/shop-view";

export const metadata = { title: "المتجر — Lumière | لوميير" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  let data = {
    products: [] as Awaited<ReturnType<typeof getShopData>>["products"],
    categories: [] as Awaited<ReturnType<typeof getShopData>>["categories"],
  };
  try {
    data = await getShopData(sp.q, sp.cat);
  } catch {
    /* db not ready */
  }
  return <ShopView data={data} q={sp.q} cat={sp.cat} sort={sp.sort} />;
}
