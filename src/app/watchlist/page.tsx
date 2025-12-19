import { Metadata } from "next";
import WatchlistPageClient from "@/components/pages/WatchlistPageClient";

export const metadata: Metadata = {
  title: "My Watchlist - SnAnime",
  description: "Track and manage your anime watchlist. Keep up with your watching, completed, and planned anime.",
};

export default function WatchlistPage() {
  return <WatchlistPageClient />;
}

