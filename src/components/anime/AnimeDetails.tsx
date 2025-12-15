"use client";
import React from "react";
import Image from "next/image";
import { Play, Bookmark, Star, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user";
import { IAnime } from "@/types/anime";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AnimeDetailsProps {
  anime: IAnime;
}

const AnimeDetails: React.FC<AnimeDetailsProps> = ({ anime }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const { t } = useLanguage();
  const { user, refresh } = useAuth();
  const router = useRouter();

  const isSaved = React.useMemo(() => {
    if (!user?.preferences?.saves) return false;
    return (user.preferences.saves as any[]).some((s) => s.animeId === anime.id);
  }, [user, anime.id]);

  const handleWatchNow = () => {
    const episodeSection = document.getElementById("episodes-section");
    if (episodeSection) {
      episodeSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setIsSaving(true);
      if (isSaved) {
        await userService.removeSave(anime.id);
      } else {
        await userService.addSave(anime);
      }
      await refresh();
    } catch (error) {
      console.error("Failed to update save status:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full min-h-[500px] sm:min-h-[550px] lg:min-h-[600px] xl:h-[80vh] bg-background rounded-b-[2rem] sm:rounded-b-[3rem] overflow-hidden shadow-2xl flex items-center z-10">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background/20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent z-10" />
        
        {anime.bannerImage ? (
          <Image
            src={anime.bannerImage}
            alt={anime.title}
            fill
            className="object-cover opacity-90 transition-opacity duration-700"
            priority
          />
        ) : anime.posterUrl ? (
          <Image
            src={anime.posterUrl}
            alt={anime.title}
            fill
            className="object-cover blur-md scale-105 opacity-70 transition-opacity duration-700"
            priority
          />
        ) : null}
      </div>

      {/* Content Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 relative z-20 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-[260px_1fr] xl:grid-cols-[300px_1fr] gap-6 lg:gap-10 xl:gap-16 items-start">
          
            {/* Left: Poster Card */}
            <div className="hidden lg:block relative group mt-4">
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 transition-all duration-500 hover:scale-[1.02]">
              {anime.posterUrl && (
                <Image
                  src={anime.posterUrl}
                  alt={anime.title}
                  fill
                  className="object-cover transition-transform duration-700"
                  priority
                />
              )}
            </div>
          </div>

          {/* Right: Info & Actions */}
            <div className="flex flex-col space-y-4 sm:space-y-5 lg:space-y-6">
            
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight">
                {anime.title}
              </h1>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm lg:text-base font-medium text-white/90">
                <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-400">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={cn(
                          "w-3 h-3 sm:w-4 sm:h-4 fill-current", 
                          star <= Math.round((parseFloat(anime.score?.toString() || "0") / 2)) ? "text-yellow-400" : "text-white/20"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="font-bold text-sm sm:text-lg text-white ml-1">
                    {anime.score ? parseFloat(anime.score.toString()).toFixed(1) : "N/A"}
                  </span>
                </div>

                <span className="text-white/40 hidden sm:inline">|</span>
                <span>{anime.year}</span>
                
                <span className="text-white/40 hidden sm:inline">|</span>
                <span className="hidden sm:inline">{anime.season}</span>
                
                <span className="text-white/40 hidden md:inline">|</span>
                <span className="hidden md:inline">{anime.totalEpisodes ? `${anime.totalEpisodes} Episodes` : "? Eps"}</span>
                
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] sm:text-xs uppercase tracking-wide",
                  anime.status?.toLowerCase().includes("ongoing") ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/70"
                )}>
                  {anime.status}
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 text-white/70 text-xs sm:text-sm">
                <span className="text-white/40">Genres:</span>
                <span className="font-medium text-white">{anime.genres?.slice(0, 4).join(", ")}</span>
            </div>

            {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 py-2">
              <Button 
                variant="primary" 
                size="lg" 
                  className="rounded-full px-5 sm:px-8 h-10 sm:h-12 text-sm sm:text-base font-bold gap-2 shadow-lg shadow-primary/10"
                onClick={handleWatchNow}
              >
                  <Play className="w-4 h-4 fill-current" />
                <span>Start Watching</span>
              </Button>
              
              <Button 
                variant="default" 
                size="lg" 
                className={cn(
                    "rounded-full h-10 sm:h-12 px-4 sm:px-6 gap-2 border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-sm",
                    isSaved && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaved ? (
                  <>
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Saved</span>
                  </>
                ) : (
                  <>
                      <Bookmark className="w-4 h-4" />
                      <span className="hidden sm:inline">Add to list</span>
                  </>
                )}
              </Button>
            </div>

              {/* Description */}
            <div className="relative max-w-3xl">
              <div className={cn(
                  "text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed font-light transition-all duration-500",
                  !isExpanded && "max-h-[4.5rem] sm:max-h-[6rem] overflow-hidden"
              )}>
                  <p>{anime.description?.replace(/<[^>]*>?/gm, '')}</p>
              </div>
              
                {anime.description && anime.description.length > 150 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-white/60 hover:text-white flex items-center gap-1 transition-all"
                >
                  {isExpanded ? "Show Less" : "Read More"}
                    <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                </button>
              )}
            </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
