import { getAdminCategories } from "@/server/queries";
import ProductForm from "@/components/admin/product-form";

export const metadata = { title: "منتج جديد — لوميير" };

export default async function NewProduct() {
  let categories = [] as Awaited<ReturnType<typeof getAdminCategories>>;
  try {
    categories = await getAdminCategories();
  } catch {
    /* db not ready */
  }
  return (
    <ProductForm product={null} rawVariants={[]} categories={categories} />
  );
}
