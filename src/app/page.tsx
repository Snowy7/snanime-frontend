import HomeClient from "@/components/pages/HomeClient";
import { snanimeService } from "@/services/global";
import { IAnimeSpotlight, IAnimeLatest } from "@/types/anime";
import { getServerLanguage } from "@/lib/server-utils";

export const metadata = {
  title: "SnAnime",
  description: "SnAnime - Your ultimate destination for streaming high-quality anime. Discover new series, watch the latest episodes, and immerse yourself in the world of anime.",
  metadataBase: new URL("https://snanime.snowydev.xyz"),
  openGraph: {
    title: "SnAnime",
    description: "Watch your favorite anime in high quality with SnAnime. Stream the latest episodes, discover new series, and enjoy a seamless viewing experience.",
    url: "https://snanime.snowydev.xyz",
    siteName: "SnAnime",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default async function Home() {
  const language = await getServerLanguage();
  
  const tops: IAnimeSpotlight[] = (await snanimeService.getSpotlightAnime(language)) || [];
  const latestEpisodes = 
    (await snanimeService.getLatestAnime(undefined, language)) || {
      items: [],
      total: 0,
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };

  return <HomeClient tops={tops} latest={latestEpisodes} />;
}
