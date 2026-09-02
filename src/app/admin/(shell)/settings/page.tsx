import { getSettingsMap } from "@/server/queries";
import SettingsClient from "@/components/admin/settings-client";

export const metadata = { title: "الإعدادات — لوميير" };

export default async function AdminSettings() {
  let settings: Record<string, string> = {};
  try {
    settings = await getSettingsMap();
  } catch {
    /* db not ready */
  }
  return <SettingsClient settings={settings} />;
}
