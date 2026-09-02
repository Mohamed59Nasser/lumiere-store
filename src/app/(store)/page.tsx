import { getHomeData } from "@/server/queries";
import StoreHome from "@/components/store/store-home";

export default async function Home() {
  let data = {
    categories: [] as Awaited<ReturnType<typeof getHomeData>>["categories"],
    featured: [] as Awaited<ReturnType<typeof getHomeData>>["featured"],
    newArrivals: [] as Awaited<ReturnType<typeof getHomeData>>["newArrivals"],
    best: [] as Awaited<ReturnType<typeof getHomeData>>["best"],
  };
  try {
    data = await getHomeData();
  } catch {
    /* db not ready */
  }
  return <StoreHome data={data} />;
}
