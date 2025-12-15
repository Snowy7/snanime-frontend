"use client";
import React, { useState, useEffect } from "react";
import { Play, Bookmark, Star } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { IAnimeSpotlight } from "@/types/anime";
import { useRouter } from "next/navigation";
import Image from "next/image";

const HeroHeader = ({ tops }: { tops: IAnimeSpotlight[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { t } = useLanguage();
  const router = useRouter();

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 8000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  if (!tops || tops.length === 0) return null;

  const currentAnime = tops[currentIndex];

  // Strip HTML tags from description
  const cleanDescription = currentAnime.description 
    ? currentAnime.description.replace(/<[^>]*>/g, '').substring(0, 250)
    : "An exciting anime series waiting to be discovered.";

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + newDirection;
      if (newIndex < 0) return tops.length - 1;
      if (newIndex >= tops.length) return 0;
      return newIndex;
    });
  };

  return (
    <div className="relative w-full h-[70vh] overflow-hidden bg-background">
      {/* Background - Blurred poster */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAnime.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={currentAnime.bannerUrl || currentAnime.posterUrl}
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center pt-28 pb-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            
            {/* Left: Poster Card */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentAnime.id}
                custom={direction}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="shrink-0"
              >
                <div className="relative w-48 sm:w-56 lg:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
                  <Image
                    src={currentAnime.posterUrl}
                    alt={currentAnime.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Right: Info & Actions */}
            <div className="flex-1 text-center lg:text-left max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAnime.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="space-y-5"
                >
                  {/* Title - Max 3 lines */}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight line-clamp-3">
                    {currentAnime.title}
                  </h1>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-white/60 leading-relaxed line-clamp-3">
                    {cleanDescription}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                    <Button 
                      variant="primary" 
                      size="lg"
                      className="rounded-full px-6 h-12 text-base gap-2.5 bg-primary hover:bg-primary/90"
                      onClick={() => router.push(`/anime/${currentAnime.id}`)}
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Watch
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="lg"
                      className="rounded-full h-12 px-5 gap-2 bg-white/10 hover:bg-white/20 border border-white/10"
                    >
                      <Bookmark className="w-5 h-5" />
                      Add to list
                    </Button>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-white/50 pt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40">Rating:</span>
                      <span className="text-white font-semibold">8.7</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40">Year:</span>
                      <span className="text-white font-semibold">{currentAnime.year || "2024"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40">Episodes:</span>
                      <span className="text-white font-semibold">
                        {currentAnime.totalEpisodes ? `2/${currentAnime.totalEpisodes}` : "2/12"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40">Genre:</span>
                      <span className="text-white font-semibold">Action, Fantasy...</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators - Left side vertical */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-30">
        {tops.slice(0, tops.length).map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === currentIndex 
                ? "bg-primary ring-4 ring-primary/30" 
                : "bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
};

export default HeroHeader;
