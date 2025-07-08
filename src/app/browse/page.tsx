import { Metadata } from "next";
import BrowsePageClient from "@/components/pages/BrowsePageClient";
import { Suspense } from "react";
import Loading from "@/components/Loading";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams.search || "";
  const title = searchQuery ? `Search results for \"${searchQuery}\"` : "Browse Anime";
  const description = searchQuery
    ? `Find the best anime results for \"${searchQuery}\" on SnAnime.`
    : "Browse and discover a wide variety of anime on SnAnime. Filter by genre, type, status, and more to find your next favorite series.";

  return {
    metadataBase: new URL("https://snanime.snowydev.xyz"),
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
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loading size="large" />
        </div>
      }
    >
      <BrowsePageClient />
    </Suspense>
  );
}
