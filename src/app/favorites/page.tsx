import { Metadata } from "next";
import FavoritesPageClient from "@/components/pages/FavoritesPageClient";

export const metadata: Metadata = {
  title: "My Favorites - SnAnime",
  description: "Your favorite anime collection. Quick access to the anime you love most.",
};

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}

