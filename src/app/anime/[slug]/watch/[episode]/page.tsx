import { Metadata } from "next";
import { SnAnimeService } from "@/services/snanime";
import WatchPageClient from "../../../../../components/pages/WatchPageClient";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; episode: string };
}): Promise<Metadata> {
  const snanime = SnAnimeService.getInstance();
  const anime = await snanime.getAnimeInfo(params.slug);
  const episodeNumber = params.episode;

  if (!anime) {
    return {
      title: "Episode Not Found",
      description: "This episode could not be found.",
    };
  }

  const title = `Watch ${anime.title} Episode ${episodeNumber}`;
  const description = `Stream episode ${episodeNumber} of ${anime.title} in high quality on SnAnime.`;

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

export default function WatchPage({ params }: { params: { slug: string; episode: string } }) {
  return <WatchPageClient params={params} />;
}
