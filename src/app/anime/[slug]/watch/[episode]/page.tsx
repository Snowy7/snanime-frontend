import { Metadata } from "next";
import { SnAnimeService } from "@/services/snanime/service";
import WatchPageClient from "../../../../../components/pages/WatchPageClient";
import { notFound } from "next/navigation";
import { getServerLanguage } from "@/lib/server-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; episode: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const language = await getServerLanguage();
  const snanime = SnAnimeService.getInstance();
  const anime = await snanime.getAnimeInfo(resolvedParams.slug, language);
  const episodeNumber = resolvedParams.episode;

  if (!anime) {
    return {
      title: "Episode Not Found",
      description: "This episode could not be found.",
    };
  }

  const title = `Watch ${anime.title} Episode ${episodeNumber}`;
  const description = `Stream episode ${episodeNumber} of ${anime.title} in high quality on SnAnime.`;

  return {
    metadataBase: new URL("https://snanime.snowydev.xyz"),
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: anime.posterUrl,
          width: 300,
          height: 400,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [anime.posterUrl],
    },
  };
}

interface WatchPageProps {
  params: Promise<{
    slug: string;
    episode: string;
  }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguage();
  const snanime = SnAnimeService.getInstance();
  
  // Fetch both episode details and anime info for poster
  const [episodeDetails, animeInfo] = await Promise.all([
    snanime.getEpisodeDetails(resolvedParams.slug, resolvedParams.episode, language),
    snanime.getAnimeInfo(resolvedParams.slug, language)
  ]);
  
  if (!episodeDetails) {
    notFound();
  }

  console.log(episodeDetails);
  
  return (
    <WatchPageClient 
      episodeDetails={episodeDetails} 
      animeId={resolvedParams.slug}
      posterUrl={animeInfo?.posterUrl}
    />
  );
}
