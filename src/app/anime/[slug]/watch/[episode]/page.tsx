import { Metadata } from "next";
"use client";
import React, { useState, useEffect } from "react";
import EpisodePlayer from "@/components/anime/EpisodePlayer";
import { useAnime } from "@/context/AnimeContext";
import { SnAnimeService } from "@/services/snanime";

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

interface WatchPageProps {
  params: Promise<{
    slug: string;
    episode: string;
  }>;
}

const WatchPage: React.FC<WatchPageProps> = ({ params }) => {
  const resolvedParams = React.use(params);
  const [episodeDetails, setEpisodeDetails] = useState<SnEpisodeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAnimeEpisode } = useAnime();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch episodes data
        const episode = await getAnimeEpisode(resolvedParams.slug, resolvedParams.episode);
        if (!episode) {
          throw new Error("Episode not found");
        }
        setEpisodeDetails(episode);
      } catch (err) {
        setError("Failed to load episode data");
        console.error("Error fetching episode data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.slug, resolvedParams.episode]);

  const handleEpisodeChange = (episodeNumber: number) => {
    // TODO: Update URL without full page reload using router.push
    window.location.href = `/anime/${resolvedParams.slug}/watch/${episodeNumber}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading episode...</p>
          <p className="text-neutral-400 text-sm mt-2">Preparing your viewing experience</p>
        </div>
      </div>
    );
  }

  if (error || !episodeDetails) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-red-500 text-2xl">⚠</div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-neutral-400 mb-6">{error || "Episode not found"}</p>
          <button onClick={() => window.history.back()} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <EpisodePlayer episodeDetails={episodeDetails} onEpisodeChange={handleEpisodeChange} />;
};

export default WatchPage;
