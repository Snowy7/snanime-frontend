import { Metadata } from "next";
import BrowsePageClient from "@/components/pages/BrowsePageClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const searchQuery = searchParams.search || "";
  const title = searchQuery ? `Search results for \"${searchQuery}\"` : "Browse Anime";
  const description = searchQuery
    ? `Find the best anime results for \"${searchQuery}\" on SnAnime.`
    : "Browse and discover a wide variety of anime on SnAnime. Filter by genre, type, status, and more to find your next favorite series.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default function BrowsePage() {
  return <BrowsePageClient />;
}
