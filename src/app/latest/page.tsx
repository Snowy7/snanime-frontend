import { Metadata } from "next";
import LatestPageClient from "@/components/pages/LatestPageClient";
import { snanimeService } from "@/services/global";
import { getServerLanguage } from "@/lib/server-utils";

export const metadata: Metadata = {
  title: "Latest Episodes - SnAnime",
  description: "Watch the latest anime episodes. Stay up to date with new releases on SnAnime.",
};

export default async function LatestPage() {
  const language = await getServerLanguage();
  const latestEpisodes = await snanimeService.getLatestAnime({ page: "1", limit: "30" }, language);
  
  return <LatestPageClient initialData={latestEpisodes} />;
}

