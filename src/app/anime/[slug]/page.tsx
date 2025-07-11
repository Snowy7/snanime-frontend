import { Metadata } from "next";
import { SnAnimeService } from "@/services/snanime.old";
import AnimePageClient from "../../../components/pages/AnimePageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const snanime = SnAnimeService.getInstance();
  const anime = await snanime.getAnimeInfo(resolvedParams.slug);

  if (!anime) {
    return {
      title: "Anime Not Found",
      description: "This anime could not be found.",
    };
  }

  const title = anime.title;
  const description = anime.description || `Watch ${anime.title} on SnAnime.`;

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
          alt: anime.title,
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

interface AnimePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function AnimePage({ params }: AnimePageProps) {
  return <AnimePageClient unresolvedParams={params} />;
}
