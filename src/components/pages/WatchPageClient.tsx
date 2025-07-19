"use client";
import React from "react";
import { YouTubeWatchLayout } from "@/components/watch/YouTubeWatchLayout";
import { IAnimeEpisodeDetails } from "@/types/anime";
import { useRouter } from "next/navigation";

interface WatchPageProps {
  episodeDetails: IAnimeEpisodeDetails;
  animeId: string;
  posterUrl?: string;
}

export default function WatchPageClient({ episodeDetails, animeId, posterUrl }: WatchPageProps) {
  const router = useRouter();

  const handleEpisodeChange = (episodeNumber: number) => {
    router.push(`/anime/${animeId}/watch/${episodeNumber}`);
  };

  return <YouTubeWatchLayout episodeDetails={episodeDetails} onEpisodeChange={handleEpisodeChange} posterUrl={posterUrl} />;
} 