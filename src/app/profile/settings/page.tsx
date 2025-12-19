import { Metadata } from "next";
import SettingsPageClient from "@/components/pages/SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings - SnAnime",
  description: "Manage your SnAnime account settings.",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}

