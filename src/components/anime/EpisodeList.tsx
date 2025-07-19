"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Calendar, Clock, Eye, Download } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { IAnimeEpisode } from "@/types/anime";

interface EpisodeListProps {
  episodes: IAnimeEpisode[];
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
  hasMore = false,
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState<IAnimeEpisode | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { t } = useLanguage();

  const handleEpisodeClick = (episode: IAnimeEpisode) => {
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
              viewMode === "list"
                ? "bg-red-600 text-white shadow-lg"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            {t("list_view")}
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-red-600 text-white shadow-lg"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            {t("grid_view")}
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {episodes.map((episode) => (
            <Link
              key={episode.id}
              href={`/anime/${animeId}/watch/${episode.number}`}
              className="group flex items-center gap-4 p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:bg-neutral-800/50 hover:border-neutral-700 transition-all duration-300 cursor-pointer"
            >
              {/* Episode Thumbnail */}
              <div className="relative w-32 h-20 md:w-40 md:h-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                {episode.thumbnail ? (
                  <Image
                    src={episode.thumbnail}
                    alt={`Episode ${episode.number}`}
                    fill
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                    <Play className="w-8 h-8 text-neutral-400" />
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
                  <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                    {episode.title ? `${episode.title}` : `${t("episode")} ${episode.number}`}
                  </h3>

                  <p className="text-sm text-neutral-400 line-clamp-2">{animeDescription}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                    {episode.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{episode.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Episode Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {episodes.map((episode) => (
            <Link
              key={episode.id}
              href={`/anime/${animeId}/watch/${episode.number}`}
              className="group relative bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden hover:bg-neutral-800/50 hover:border-neutral-700 transition-all duration-300 cursor-pointer"
            >
              {/* Episode Thumbnail */}
              <div className="relative aspect-video bg-neutral-800">
                {episode.thumbnail ? (
                  <Image
                    src={episode.thumbnail}
                    alt={`Episode ${episode.number}`}
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-75 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>

                {/* Episode Number Badge */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded">
                  {t("ep")} {episode.number}
                </div>

                {/* Duration Badge */}
                {episode.duration && (
                  <div className="absolute bottom-2 group-hover:bottom-12 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 transition-all rounded">
                    {episode.duration}
                  </div>
                )}
              </div>

              {/* Episode Info */}
              <div className="absolute w-full h-12 bottom-0 left-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/80 to-transparent transition-all flex items-center justify-center px-2">
                <h3 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors truncate text-center w-full">
                  {episode.title ? `${episode.title}` : `${t("episode")} ${episode.number}`}{" "}
                </h3>
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
                <span>{t("loading")}</span>
              </>
            ) : (
              <span>{t("load_more_episodes")}</span>
            )}
          </button>
        </div>
      )}

      {episodes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📺</div>
          <h3 className="text-xl font-semibold text-white mb-2">{t("no_episodes_available")}</h3>
          <p className="text-neutral-400">{t("episodes_will_be_added")}</p>
        </div>
      )}
    </section>
  );
};

export default EpisodeList;
