"use client";
import React, { useState, useEffect } from "react";
import AnimeDetails from "@/components/anime/AnimeDetails";
import RelatedAnime from "@/components/anime/RelatedAnime";
import EpisodeList from "@/components/anime/EpisodeList";
import { useAnime } from "@/context/AnimeContext";
import RelatedCharacters from "@/components/anime/RelatedCharacters";
import RelatedStaff from "@/components/anime/RelatedStaff";
import Loading from "@/components/Loading";
import RecommendedAnime from "@/components/anime/RecommendedAnime";

export default function AnimePageClient({ params }: { params: { slug: string } }) {
  const [animeData, setAnimeData] = useState<SnAnimeData | null>(null);
  const [anilistAnime, setAnilistAnime] = useState<AnilistAnime | null>(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [loadingMoreEpisodes, setLoadingMoreEpisodes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAnimeById, getAnilistAnimeById, getAnimeEpisodes } = useAnime();

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        const anime = await getAnimeById(params.slug);
        if (!anime) {
          throw new Error("Anime not found");
        }

        // Fetch Anilist data if available
        const anilistAnime = await getAnilistAnimeById(anime.malID.toString());
        if (anilistAnime) {
          // Merge Anilist data into SnAnimeData
          anime.banner = anilistAnime.bannerUrl || anime.banner;
          anime.title = anilistAnime.title || anime.title;
          anime.description = anilistAnime.description || anime.description;
          anime.rating = anilistAnime.rating || anime.rating;
          anime.image = anilistAnime.posterUrl || anime.image;
        }

        // Set the anime data state
        setAnimeData(anime);
        setAnilistAnime(anilistAnime);
        setError(null);
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
      const episodes = await getAnimeEpisodes(params.slug, 1, 20);
      setLoadingEpisodes(false);
    };
    fetchAnimeEpisodes();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  if (error || !animeData) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-neutral-400">{error || "Anime not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black">
      <AnimeDetails anime={animeData} />{" "}
      <div className="px-4 md:px-8 lg:px-16  container mx-auto relative z-10">
        {animeData?.relatedAnime && animeData?.relatedAnime.length > 0 && <RelatedAnime relatedAnime={animeData.relatedAnime} />}
        {animeData?.recommendations && animeData?.recommendations.length > 0 && <RecommendedAnime recommendations={animeData.recommendations} />}
        {anilistAnime?.characters && anilistAnime?.characters.length > 0 && <RelatedCharacters characters={anilistAnime.characters} />}
        {anilistAnime?.staff && anilistAnime?.staff.length > 0 && <RelatedStaff staff={anilistAnime.staff} />}
        {loadingEpisodes ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <EpisodeList
            episodes={animeData.episodes}
            animeTitle={animeData.title}
            animeId={animeData.id}
            animeDescription={animeData.description}
            loadingMore={loadingMoreEpisodes}
          />
        )}
      </div>
    </div>
  );
} 