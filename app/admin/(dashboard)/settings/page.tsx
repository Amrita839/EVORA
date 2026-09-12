import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/lib/settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsForm settings={settings} />;
}
