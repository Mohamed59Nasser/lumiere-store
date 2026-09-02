import { getAccountData } from "@/server/queries";
import AccountView from "@/components/store/account-view";

export const metadata = { title: "حسابي — Lumière | لوميير" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  let data: Parameters<typeof AccountView>[0]["data"] = null;
  try {
    data = (await getAccountData()) as Parameters<
      typeof AccountView
    >[0]["data"];
  } catch {
    /* db not ready */
  }
  return <AccountView data={data} initialTab={tab} />;
}
