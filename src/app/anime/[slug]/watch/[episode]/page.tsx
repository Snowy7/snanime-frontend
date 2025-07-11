import { Metadata } from "next";
import { SnAnimeService } from "@/services/snanime.old";
import WatchPageClient from "../../../../../components/pages/WatchPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; episode: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const snanime = SnAnimeService.getInstance();
  const anime = await snanime.getAnimeInfo(resolvedParams.slug);
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
          url: anime.image,
          width: 300,
          height: 400,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [anime.image],
    },
  };
}

interface WatchPageProps {
  params: Promise<{
    slug: string;
    episode: string;
  }>;
}

export default function WatchPage({ params }: WatchPageProps) {
  return <WatchPageClient unresolvedParams={params} />;
}
