"use client";
import React from "react";
import { ChevronLeft, Play, Clock, Eye, Star } from "lucide-react";
import Link from "next/link";
import AdvancedVideoPlayer from "./AdvancedVideoPlayer";

interface EpisodePlayerProps {
  episodeDetails: SnEpisodeDetails;
  onEpisodeChange?: (number: number) => void;
}

const EpisodePlayer: React.FC<EpisodePlayerProps> = ({ episodeDetails, onEpisodeChange }) => {
  const currentEpisodeIndex = episodeDetails.allEpisodes.findIndex((ep) => ep.id === episodeDetails.id);
  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = currentEpisodeIndex < episodeDetails.allEpisodes.length - 1;

  const handlePrevious = () => {
    if (hasPrevious && onEpisodeChange) {
      const previousEpisode = episodeDetails.allEpisodes[currentEpisodeIndex - 1];
      onEpisodeChange(previousEpisode.number);
    }
  };

  const handleNext = () => {
    if (hasNext && onEpisodeChange) {
      const nextEpisode = episodeDetails.allEpisodes[currentEpisodeIndex + 1];
      onEpisodeChange(nextEpisode.number);
    }
  };

  return (
    <div className="bg-black min-h-screen pb-24">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-lg border-b fixed w-full bottom-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto p-4">
          <Link href={`/anime/${episodeDetails.animeId}`} className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to {episodeDetails.animeTitle}</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="text-center flex-1 px-4">
            <h1 className="text-lg font-semibold text-white truncate">
              Episode {episodeDetails.number}: {episodeDetails.title}
            </h1>
            <p className="text-sm text-neutral-400 truncate">{episodeDetails.animeTitle}</p>
          </div>

          <div className="text-right text-sm text-neutral-400 hidden sm:block">
            {episodeDetails.number} / {episodeDetails.allEpisodes.length}
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative">
        <AdvancedVideoPlayer streams={episodeDetails.streams} poster={""} onNext={handleNext} onPrevious={handlePrevious} hasNext={hasNext} hasPrevious={hasPrevious} />
      </div>

      {/* Episode Info */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-white mb-2">
                Episode {episodeDetails.number}: {episodeDetails.title}
              </h2>
              {episodeDetails.description && <p className="text-neutral-300 leading-relaxed mb-4">{episodeDetails.description}</p>}
              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <div className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  <span>Episode {episodeDetails.number}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{episodeDetails.allEpisodes.length} Episodes</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-neutral-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Quality Options</h3>
                <div className="space-y-2">
                  {/* {episodeDetails.servers.map((stream) => (
                    <div key={stream.id} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-300">{stream.id}</span>
                      <span className="text-neutral-500">Streams: {stream.streams.length}</span>
                    </div>
                  ))} */}
                </div>
              </div>

              <div className="bg-neutral-800 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Navigation</h3>
                <div className="space-y-2">
                  <button
                    onClick={handlePrevious}
                    disabled={!hasPrevious}
                    className={`w-full text-left p-2 rounded text-sm transition-colors ${hasPrevious ? "text-neutral-300 hover:bg-neutral-700 hover:text-white" : "text-neutral-600 cursor-not-allowed"
                      }`}
                  >
                    {hasPrevious ? `← Episode ${episodeDetails.allEpisodes[currentEpisodeIndex - 1]?.number}` : "← No previous episode"}
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!hasNext}
                    className={`w-full text-left p-2 rounded text-sm transition-colors ${hasNext ? "text-neutral-300 hover:bg-neutral-700 hover:text-white" : "text-neutral-600 cursor-not-allowed"}`}
                  >
                    {hasNext ? `Episode ${episodeDetails.allEpisodes[currentEpisodeIndex + 1]?.number} →` : "No next episode →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episode List */}
      <div className="bg-neutral-900">
        <div className="max-w-7xl mx-auto p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>All Episodes</span>
            <span className="text-sm text-neutral-400 font-normal">({episodeDetails.allEpisodes.length} total)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {episodeDetails.allEpisodes.map((episode) => (
              <button
                key={episode.number}
                onClick={() => onEpisodeChange?.(episode.number)}
                className={`group relative p-4 rounded-lg transition-all duration-200 text-left ${episode.number === episodeDetails.number
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white hover:shadow-lg"
                  }`}
              >
                <div className="font-medium text-lg mb-1">{episode.number}</div>{" "}
                <div
                  className="text-xs opacity-80 leading-tight overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                  }}
                >
                  {episode.title}
                </div>
                {episode.number === episodeDetails.number && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodePlayer;
