"use client";
import React, { useState, useEffect, use } from "react";
import AnimeDetails from "@/components/anime/AnimeDetails";
import RelatedAnime from "@/components/anime/RelatedAnime";
import EpisodeList from "@/components/anime/EpisodeList";
import { useAnime } from "@/context/AnimeContext";
import RelatedCharacters from "@/components/anime/RelatedCharacters";
import RelatedStaff from "@/components/anime/RelatedStaff";
import Loading from "@/components/Loading";
import RecommendedAnime from "@/components/anime/RecommendedAnime";
import { IAnime } from "@/types/anime";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface AnimePageProps {
  anime: IAnime;
}

export default function AnimePageClient({ anime }: AnimePageProps) {
  const [animeData, setAnimeData] = useState<IAnime | null>(anime);
  const [anilistAnime, setAnilistAnime] = useState<IAnime | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchAnilistDetails } = useAnime();
  const router = useRouter();
  const { language } = useLanguage();

  useEffect(() => {
    console.log("language", language);
    console.log("animeData", animeData);
    const fetchAnilistData = async () => {
      if (!animeData?.malId) return;
      try {
        // Fetch Anilist data if available
        const anilistAnime = await fetchAnilistDetails(animeData.malId);
        if (anilistAnime) {
          // Merge Anilist data into SnAnimeData
          const mergedAnime = {
            ...animeData,
            bannerImage: anilistAnime.bannerImage || animeData.bannerImage,
            title: anilistAnime.title || animeData.title,
            description: language === "en" ? anilistAnime.description : animeData.description,
            score: anilistAnime.averageScore || animeData.score,
            posterUrl: anilistAnime.posterUrl || animeData.posterUrl,
            totalEpisodes: (animeData.totalEpisodes > 0 ? animeData.totalEpisodes : (animeData.episodes?.length ?? 0 > 0 ? animeData.episodes?.length : anilistAnime.totalEpisodes ?? 0)) ?? 0
          };

          console.log("mergedAnime", mergedAnime);

          // Set the anime data state
          setAnimeData(mergedAnime);
          setAnilistAnime(anilistAnime);
        }
      } catch (err) {
        console.error("Error fetching anilist data:", err);
      }
    };

    if (animeData) {
      fetchAnilistData();
    }
  }, [animeData?.malId, fetchAnilistDetails]);

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
        
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black">
      <AnimeDetails anime={animeData} />
      <div className="px-4 md:px-8 lg:px-16  container mx-auto relative z-10">
        {animeData?.relatedAnime && animeData?.relatedAnime.length > 0 && <RelatedAnime relatedAnime={animeData.relatedAnime} />}
        {/* {animeData?.recommendations && animeData?.recommendations.length > 0 && <RecommendedAnime recommendations={animeData.recommendations} />} */}
        {/* {anilistAnime?.characters && anilistAnime?.characters.length > 0 && <RelatedCharacters characters={anilistAnime.characters} />} */}
        {/* {anilistAnime?.staff && anilistAnime?.staff.length > 0 && <RelatedStaff staff={anilistAnime.staff} />} */}
        {
          animeData?.episodes && animeData?.episodes.length > 0 && <EpisodeList episodes={animeData.episodes} animeTitle={animeData.title} animeId={animeData.id} animeDescription={animeData.description} />
        }
      </div>
    </div>
  );
} 