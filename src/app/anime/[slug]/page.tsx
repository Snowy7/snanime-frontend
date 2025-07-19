import { Metadata } from "next";
import { snanimeService } from "@/services/global";
import AnimePageClient from "@/components/pages/AnimePageClient";
import { notFound } from "next/navigation";
import { getServerLanguage } from "@/lib/server-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const language = await getServerLanguage();
  const anime = await snanimeService.getAnimeInfo(resolvedParams.slug, language);

  if (!anime) {
    return {
      title: "Anime Not Found",
      description: "This anime could not be found.",
    };
  }

  const title = `${anime.title} - SnAnime`;
  const description = anime.description || `Watch ${anime.title} on SnAnime. Stream high-quality anime episodes online.`;

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

interface AnimePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AnimePage({ params }: AnimePageProps) {
  const resolvedParams = await params;
  const language = await getServerLanguage();
  const anime = await snanimeService.getAnimeInfo(resolvedParams.slug, language);

  if (!anime) {
    notFound();
  }

  return <AnimePageClient anime={anime} />;
}
