import { notFound } from "next/navigation";
import { getProductData } from "@/server/queries";
import ProductView from "@/components/store/product-view";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data = {
    product: null as Awaited<ReturnType<typeof getProductData>>["product"],
    related: [] as Awaited<ReturnType<typeof getProductData>>["related"],
    reviews: [] as Awaited<ReturnType<typeof getProductData>>["reviews"],
    myReview: null as Awaited<ReturnType<typeof getProductData>>["myReview"],
  };
  try {
    data = (await getProductData(id))!;
  } catch {
    /* db not ready */
  }
  const product = data.product;
  if (!product) notFound();
  return (
    <ProductView
      product={product}
      related={data.related}
      reviews={data.reviews}
      myReview={data.myReview}
    />
  );
}
