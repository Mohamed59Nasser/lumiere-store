import { notFound } from "next/navigation";
import { getAdminProduct } from "@/server/queries";
import ProductForm from "@/components/admin/product-form";

export const metadata = { title: "تعديل منتج — لوميير" };

export default async function EditProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data: Awaited<ReturnType<typeof getAdminProduct>> | null = null;
  try {
    data = await getAdminProduct(id);
  } catch {
    /* db not ready */
  }
  if (!data?.product) notFound();

  const p = data.product;
  let images: string[] = [];
  try {
    images = JSON.parse(p.images || "[]");
  } catch {
    images = [];
  }
  if (p.mainImage && !images.includes(p.mainImage)) images.unshift(p.mainImage);

  return (
    <ProductForm
      product={{
        id: p.id,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        descAr: p.descAr,
        descEn: p.descEn,
        categoryId: p.categoryId,
        comparePrice: p.comparePrice,
        images,
        featured: p.featured,
        bestSeller: p.bestSeller,
        active: p.active,
      }}
      rawVariants={data.variants}
      categories={data.categories}
    />
  );
}
