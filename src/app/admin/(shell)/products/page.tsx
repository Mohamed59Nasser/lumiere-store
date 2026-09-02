import { getAllProducts, getCategories } from "@/server/queries";
import ProductsClient from "@/components/admin/products-client";

export const metadata = { title: "المنتجات — لوميير" };

export default async function AdminProducts() {
  let products = [] as Awaited<ReturnType<typeof getAllProducts>>;
  let categories = [] as Awaited<ReturnType<typeof getCategories>>;
  try {
    [products, categories] = await Promise.all([
      getAllProducts(true),
      getCategories(),
    ]);
  } catch {
    /* db not ready */
  }
  return <ProductsClient products={products} categories={categories} />;
}
