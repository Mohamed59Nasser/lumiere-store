import { getAdminCategories } from "@/server/queries";
import CategoriesClient from "@/components/admin/categories-client";

export const metadata = { title: "الفئات — لوميير" };

export default async function AdminCategories() {
  let rows = [] as Awaited<ReturnType<typeof getAdminCategories>>;
  try {
    rows = await getAdminCategories();
  } catch {
    /* db not ready */
  }
  return <CategoriesClient rows={rows} />;
}
