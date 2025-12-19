import { Metadata } from "next";
import ProfilePageClient from "@/components/pages/ProfilePageClient";

export const metadata: Metadata = {
  title: "Profile - SnAnime",
  description: "View and manage your SnAnime profile.",
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}

