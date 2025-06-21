"use client";
import React, { useState, useEffect } from "react";
import AnimeDetails from "@/components/anime/AnimeDetails";
import RelatedAnime from "@/components/anime/RelatedAnime";
import EpisodeList from "@/components/anime/EpisodeList";
import { useAnime } from "@/context/AnimeContext";
import RelatedCharacters from "@/components/anime/RelatedCharacters";
import RelatedStaff from "@/components/anime/RelatedStaff";

interface AnimePageProps {
  params: Promise<{
    slug: string;
  }>;
}

const AnimePage: React.FC<AnimePageProps> = ({ params }) => {
  const resolvedParams = React.use(params);
  const [animeData, setAnimeData] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<PaginatedResult<AnimeEpisode>>({ items: [], total: 0, page: 1, limit: 20, hasNextPage: false, hasPreviousPage: false });
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [loadingMoreEpisodes, setLoadingMoreEpisodes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAnimeById, getAnimeEpisodes } = useAnime();

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        const anime = await getAnimeById(resolvedParams.slug);
        if (!anime) {
          throw new Error("Anime not found");
        }
        setAnimeData(anime);
      } catch (err) {
        setError("Failed to load anime data");
        console.error("Error fetching anime data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimeData();

    const fetchAnimeEpisodes = async () => {
      setLoadingEpisodes(true);
      const episodes = await getAnimeEpisodes(resolvedParams.slug, 1, 20);
      setEpisodes(episodes);
      setLoadingEpisodes(false);
    };
    fetchAnimeEpisodes();
  }, [resolvedParams.slug]);

  const loadMoreEpisodes = async () => {
    if (loadingMoreEpisodes || episodes.items.length >= episodes.total) {
      return;
    }

    try {
      setLoadingMoreEpisodes(true);
      const nextPage = episodes.page + 1;
      const moreEpisodes = await getAnimeEpisodes(resolvedParams.slug, nextPage, 20);

      setEpisodes((prev) => ({
        ...moreEpisodes,
        items: [...prev.items, ...moreEpisodes.items],
      }));
    } catch (err) {
      console.error("Error loading more episodes:", err);
    } finally {
      setLoadingMoreEpisodes(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !animeData) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-neutral-400">{error || "Anime not found"}</p>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !animeData) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-neutral-400">{error || "Anime not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black">
      <AnimeDetails anime={animeData} />{" "}
      <div className="px-4 md:px-8 lg:px-16  container mx-auto relative z-10">
        {animeData.related && animeData.related.length > 0 && <RelatedAnime relatedAnime={animeData.related} />}
        {animeData.characters && animeData.characters.length > 0 && <RelatedCharacters characters={animeData.characters} />}
        {animeData.staff && animeData.staff.length > 0 && <RelatedStaff staff={animeData.staff} />}
        {loadingEpisodes ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <EpisodeList
            episodes={episodes}
            animeTitle={animeData.title}
            animeId={animeData.id}
            animeDescription={animeData.description}
            onLoadMore={loadMoreEpisodes}
            loadingMore={loadingMoreEpisodes}
            hasMore={episodes.items.length < episodes.total}
          />
        )}
      </div>
    </div>
  );
};

export default AnimePage;
