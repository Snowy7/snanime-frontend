"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Calendar, Clock, Eye, Download } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface EpisodeListProps {
  episodes: SnAnimeEpisode[];
  animeTitle: string;
  animeId: string;
  animeDescription?: string;
  onLoadMore?: () => Promise<void>;
  loadingMore?: boolean;
  hasMore?: boolean;
}

const EpisodeList: React.FC<EpisodeListProps> = ({ 
  episodes, 
  animeTitle, 
  animeId, 
  animeDescription,
  onLoadMore,
  loadingMore = false,
  hasMore = false
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState<SnAnimeEpisode | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { t } = useLanguage();

  const handleEpisodeClick = (episode: SnAnimeEpisode) => {
    setSelectedEpisode(episode);
    // TODO: Navigate to episode player
    console.log(`Playing episode ${episode.number}: ${episode.title}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  function msToHMS(ms: number) {
    // 1- Convert to seconds:
    let seconds: number = ms / 1000;
    // 2- Extract hours:
    const hours: number = Math.floor(seconds / 3600); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    const minutes: number = Math.floor(seconds / 60); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;

    // 5- Return the formatted string:
    return `${hours}:${minutes.toFixed(0).padStart(2, "0")}:${seconds.toFixed(0).padStart(2, "0")}`;
  }

  return (
    <section className="py-8 md:py-12">
      <div className="mt-8 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{t("episodes")}</h2>
          <p className="text-neutral-400">
            {episodes.length} {t("ep_available")}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-neutral-900/50 rounded-lg p-1 border border-neutral-800">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === "list" ? "bg-red-600 text-white shadow-lg" : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === "grid" ? "bg-red-600 text-white shadow-lg" : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            Grid View
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div className="grid gap-4">
          {episodes.map((episode) => (
            <Link
              key={episode.number}
              href={`/anime/${animeId}/watch/${episode.number}`}
              className={`group relative overflow-hidden rounded-lg bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 hover:border-neutral-600 transition-all duration-300 hover:bg-neutral-800/50 hover:scale-[1.01] hover:shadow-xl ${
                selectedEpisode?.number === episode.number ? "ring-2 ring-red-500 bg-neutral-800/70" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                {/* Episode Thumbnail */}
                <div className="relative w-full sm:w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                  {episode.thumbnail ? (
                    <Image
                      src={episode.thumbnail}
                      alt={`${animeTitle} Episode ${episode.number}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                      <Play className="w-12 h-12 text-neutral-600" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>

                  {/* Episode Number Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-sm font-semibold px-2 py-1 rounded">
                    {t("ep")} {episode.number}
                  </div>

                  {/* Watched Indicator */}
                  {/* {episode.watched && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1">
                      <Eye className="w-4 h-4" />
                    </div>
                  )} */}
                </div>

                {/* Episode Info */}
                <div className="flex-1 min-w-0">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">{episode.title ? `${episode.title}` : `${t("episode")} ${episode.number}`}</h3>

                    <p className="text-sm text-neutral-400 line-clamp-2">{episode.description ? episode.description : animeDescription}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                      {episode.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{msToHMS(episode.duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Watch Button (Mobile) */}
                <div className="sm:hidden">
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">Watch Now</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {episodes.map((episode) => (
            <Link
              key={episode.number}
              href={`/anime/${animeId}/watch/${episode.number}`}
              className="group relative overflow-hidden rounded-lg bg-neutral-900/50 backdrop-blur-sm border-0 transition-all duration-300 hover:bg-neutral-800/50 hover:shadow-xl"
            >
              {/* Episode Thumbnail */}
              <div className="relative w-full h-48 overflow-hidden bg-neutral-800">
                {episode.thumbnail ? (
                  <Image
                    src={episode.thumbnail}
                    alt={`${animeTitle} Episode ${episode.number}`}
                    fill
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                    <Play className="w-12 h-12 text-neutral-600" />
                  </div>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>

                {/* Episode Number Badge */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-sm font-semibold px-2 py-1 rounded">
                  {t("ep")} {episode.number}
                </div>

                {/* Watched Indicator */}
                {/* {episode.watched && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1">
                    <Eye className="w-4 h-4" />
                  </div>
                )} */}

                {/* Duration Badge */}
                {episode.duration && (
                  <div className="absolute bottom-2 group-hover:bottom-12 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 transition-all rounded">{msToHMS(episode.duration)}</div>
                )}
              </div>

              {/* Episode Info */}
              <div className="absolute w-full h-12 bottom-0 left-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/80 to-transparent transition-all flex items-center justify-center px-2">
                <h3 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors truncate text-center w-full">
                  {episode.title ? `${episode.title}` : `${t("episode")} ${episode.number}`}                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Loading...</span>
              </>
            ) : (
              <span>Load More Episodes</span>
            )}
          </button>
        </div>
      )}

      {episodes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📺</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Episodes Available</h3>
          <p className="text-neutral-400">Episodes will be added soon.</p>
        </div>
      )}
    </section>
  );
};

export default EpisodeList;
