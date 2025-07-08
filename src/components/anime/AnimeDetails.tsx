"use client";
import React from "react";
import Image from "next/image";
import { Play, Bookmark, Share2, Star, Calendar, Clock, Tv, Users, Globe } from "lucide-react";
import { ControlButton } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface AnimeDetailsProps {
  anime: SnAnimeData;
}

const AnimeDetails: React.FC<AnimeDetailsProps> = ({ anime }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { t } = useLanguage();

  const handleWatchNow = () => {
    // TODO: Navigate to episode 1 or continue watching
    console.log("Watch now clicked");
  };

  const handleSave = () => {
    // TODO: Add to watchlist
    console.log("Save clicked");
  };

  const handleShare = () => {
    // TODO: Share functionality
    if (navigator.share) {
      navigator.share({
        title: anime.title,
        text: `Check out ${anime.title} on SnAnime`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      console.log("Link copied to clipboard");
    }
  };

  return (
    <>
      {/* Banner Background */}
      {anime.banner && (
        <div className="fixed inset-0 h-full overflow-hidden">
          <Image src={anime.banner} alt={anime.title} fill style={{ objectFit: "cover" }} priority className="transition-transform duration-700 blur-sm grayscale-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40" />

          {/* overlay just a black overlay */}
          <div className="absolute inset-0 bg-black/70" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 px-4 md:px-8 lg:px-16 pt-32 pb-12 container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Poster */}
          <div className="flex-shrink-0 animate-fade-in">
            <div className="relative w-64 h-96 md:w-72 md:h-[432px] overflow-hidden rounded-lg shadow-2xl group">
              <Image src={anime.image} alt={anime.title} fill style={{ objectFit: "cover" }} priority className="transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            {/* Title */}
            <div className="animate-slide-up">
              <h1 className="text-4xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">{anime.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-neutral-300">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  {anime.rating ? (
                    <span className="text-yellow-400 font-semibold text-lg">{parseFloat(anime.rating?.toString()).toFixed(1)}</span>
                  ) : (
                    <span className="text-neutral-400">N/A</span>
                  )}
                  <span className="text-neutral-400">/10</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{anime.season}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tv className="w-4 h-4" />
                  <span>{t(anime.type)}</span>
                </div>
                {anime.episodes.length && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {t("episodes")} {anime.episodes.length}
                    </span>
                  </div>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${anime.status === "Completed"
                    ? "bg-green-600/20 text-green-400 border border-green-400/30"
                    : anime.status === "Ongoing"
                      ? "bg-blue-600/20 text-blue-400 border border-blue-400/30"
                      : "bg-yellow-600/20 text-yellow-400 border border-yellow-400/30"
                    }`}
                >
                  {t(anime.status)}
                </span>
              </div>
            </div>

            {/* Additional Info */}
            {(anime.studio || anime.source) && (
              <div className="animate-fade-in-delayed flex flex-wrap gap-4 text-sm text-neutral-400">
                {anime.studio && (
                  <div>
                    <span className="font-medium text-neutral-300">Studio:</span> {anime.studio}
                  </div>
                )}
                {anime.source && (
                  <div>
                    <span className="font-medium text-neutral-300">Source:</span> {anime.source}
                  </div>
                )}
              </div>
            )}

            {/* Genres */}
            <div className="animate-fade-in-delayed">
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer transform hover:scale-105"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="animate-fade-in-delayed">
              <div className="relative">
                <p className={`text-neutral-300 text-md leading-relaxed max-w-4xl transition-all duration-300 ${isExpanded ? "" : "line-clamp-3 overflow-hidden"}`}>{anime.description}</p>
                {anime.description && anime.description.length > 200 && (
                  <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-400 hover:text-blue-300 mt-2 text-sm font-medium transition-colors duration-200 cursor-pointer">
                    {isExpanded ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            </div>

            {/* Sub/Dub Info */}
            <div className="animate-fade-in-delayed">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-400">Available in:</span>
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm border border-blue-400/30">{anime.subOrDub == "both" ? "Sub | Dub" :
                  // first letter of subOrDub is capitalized
                  anime.subOrDub.charAt(0).toUpperCase() + anime.subOrDub.slice(1)
                }</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4 animate-fade-in-delayed">
              <ControlButton type="primary" onClick={handleWatchNow} className="min-w-[200px]">
                <Play className="w-6 h-6" />
                <span>Watch Now</span>
              </ControlButton>

              <ControlButton type="save" onClick={handleSave}>
                <Bookmark className="w-5 h-5" />
                <span>Add to List</span>
              </ControlButton>

              <ControlButton type="share" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </ControlButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnimeDetails;
