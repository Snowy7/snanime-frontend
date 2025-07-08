import { Metadata } from "next";
import { SnAnimeService } from "@/services/snanime";
import AnimePageClient from "../../../components/pages/AnimePageClient";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const snanime = SnAnimeService.getInstance();
  const anime = await snanime.getAnimeInfo(params.slug);

  if (!anime) {
    return {
      title: "Anime Not Found",
      description: "This anime could not be found.",
    };
  }

  const title = anime.title;
  const description = anime.description || `Watch ${anime.title} on SnAnime.`;

  return {
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

export default function AnimePage({ params }: { params: { slug: string } }) {
  return <AnimePageClient params={params} />;
}
