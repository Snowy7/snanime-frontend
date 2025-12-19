import { Metadata } from "next";
import TrendingPageClient from "@/components/pages/TrendingPageClient";
import { anilistService } from "@/services/global";

export const metadata: Metadata = {
  title: "Trending Anime - SnAnime",
  description: "Discover the hottest trending anime right now. See what everyone is watching on SnAnime.",
};

export default async function TrendingPage() {
  const trendingAnime = await anilistService.getSpotlight(1, 24);
  
  return <TrendingPageClient initialData={trendingAnime} />;
}

