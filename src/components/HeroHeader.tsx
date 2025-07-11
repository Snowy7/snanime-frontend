"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { ControlButton, IconButton, NavigationButton } from "./ui/button"; // Assuming these are your custom components
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { IAnime, IAnimeSearchResult, IPaginatedResult } from "@/types/anime";

// Indicator Dots Component
const IndicatorDots = ({ items, currentIndex, onDotClick }: { items: any[]; currentIndex: number; onDotClick: (index: number) => void }) => {
  return (
    <div className="flex gap-2 justify-center pb-8">
      {items.map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`h-3 rounded-full transition-all duration-300 hover:scale-125 ${index === currentIndex ? "bg-white scale-125 shadow-lg w-6" : "bg-white bg-opacity-50 hover:bg-opacity-75 w-3"}`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

const AnimeHeroHeader = ({ tops }: { tops: IPaginatedResult<IAnime> }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { t } = useLanguage();

  // Handle empty tops array
  if (!tops || tops.items.length === 0) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(128, 128, 128, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128, 128, 128, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Loading/Error Content */}
        <div className="text-center z-10">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wider mb-2">LOADING ANIME</h1>
          <p className="text-white/70 text-lg">Discovering amazing anime for you...</p>
        </div>
      </div>
    );
  }

  const currentAnime = tops.items[currentIndex];

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + newDirection;
      if (newIndex < 0) return tops.items.length - 1;
      if (newIndex >= tops.items.length) return 0;
      return newIndex;
    });
  };

  const goToSlide = (slideIndex: number) => {
    if (slideIndex === currentIndex) return;
    setDirection(slideIndex > currentIndex ? 1 : -1);
    setCurrentIndex(slideIndex);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1, // zIndex for the sliding container itself
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0, // zIndex for the sliding container itself
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const contentItemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const contentParentVariants = {
    animate: (delayBase: number = 0.3) => ({
      transition: { staggerChildren: 0.1, delayChildren: delayBase },
    }),
    exit: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* FIXED Grid Overlay - subtle and appears in darker areas with fade around image */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]" // z-index 1
        style={{
          backgroundImage: `
          linear-gradient(to right, rgba(128, 128, 128, 0.07) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(128, 128, 128, 0.07) 1px, transparent 1px)
            `,
          backgroundSize: "40px 40px",
          maskImage: `
          radial-gradient(circle at center, 
            transparent 70%, 
            rgba(0,0,0,0.2) 90%, 
            rgba(0,0,0,.5) 100%
          )
            `,
          WebkitMaskImage: `
          radial-gradient(circle at center, 
            transparent 70%, 
            rgba(0,0,0,0.2) 90%, 
            rgba(0,0,0,.5) 100%
          )
            `,
        }}
      />


      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 20 },
            opacity: { duration: 0.6, delay: 0.1 },
          }}
          className="absolute right-24 top-1/2 -translate-y-1/2 w-3/5 h-3/4 overflow-hidden" // Removed rounded corners, added soft shadow
        >
          {/* SLIDING Background Image */}
          <img
            src={currentAnime.coverImage}
            alt={currentAnime.title}
            className="w-full h-full object-cover object-center absolute inset-0"
          />

          {/* Enhanced gradient overlay for better blending */}
          <div
            className="absolute inset-0 pointer-events-none 3xl:hidden"
            style={{
              background: `
                radial-gradient(ellipse 80% 100% at center, 
                  rgba(0,0,0,0) 25%, 
                  rgba(0,0,0,0.9) 60%, 
                  rgba(0,0,0,0.9) 100%
                ),
                linear-gradient(to left, 
                  rgba(0,0,0,0) 50%, 
                  rgba(0,0,0,0.3) 80%, 
                  rgba(0,0,0,0.8) 100%
                ),
                linear-gradient(to bottom, 
                  rgba(0,0,0,0) 50%, 
                  rgba(0,0,0,0.3) 80%, 
                  rgba(0,0,0,0.8) 100%
                ),
                linear-gradient(to right, 
                  rgba(0,0,0,0) 50%, 
                  rgba(0,0,0,0.5) 80%, 
                  rgba(0,0,0,0.8) 100%
                ),
                linear-gradient(to top, 
                  rgba(0,0,0,0) 50%, 
                  rgba(0,0,0,0.3) 80%, 
                  rgba(0,0,0,0.8) 100%
                )
              `,
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none hidden 3xl:block"
            style={{
              background: `
                radial-gradient(ellipse 60% 60% at center, 
                  rgba(0,0,0, 0) 10%, 
                  rgba(0,0,0, 0.9) 70%, 
                  rgba(0,0,0, 1) 100%
                ),
                linear-gradient(to left, 
                  rgba(0,0,0,0) 50%, 
                  rgba(0,0,0,0.6) 80%, 
                  rgba(0,0,0,1) 100%
                ),
                linear-gradient(to bottom, 
                  rgba(0,0,0,0) 50%, 
                  rgba(0,0,0,0.6) 80%, 
                  rgba(0,0,0,1) 100%
                ),
                linear-gradient(to right, 
                  rgba(0,0,0,0) 50%, 
                  rgba(0,0,0,0.6) 80%, 
                  rgba(0,0,0,1) 100%
                ),
                linear-gradient(to top, 
                  rgba(0,0,0,0) 50%, 
                  rgba(0,0,0,0.6) 80%, 
                  rgba(0,0,0,1) 100%
                )
              `,
            }}
          />

          {/* Additional soft edge blur */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 100px rgba(0,0,0,0.4)',
              borderRadius: '24px',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* STATIC Content Container - positioned on the left */}
      <div className="relative z-10 flex flex-col justify-between h-full w-full px-18 pointer-events-none">
        <AnimatePresence initial={false} mode="wait">
          {/* Content section with title, description, and metadata */}
          <motion.div
            key={currentIndex}
            className="flex-1 flex items-center justify-start pt-[10%] pl-8 md:pl-16 pointer-events-none"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="max-w-2xl space-y-6">
              {/* Rank */}
              <motion.h2
                className="flex items-center gap-2 text-white/80 text-2xl md:text-4xl font-semibold tracking-wide drop-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                #{currentIndex + 1}
              </motion.h2>

              {/* Title */}
              <motion.h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-wide drop-shadow-2xl leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {currentAnime.title}
              </motion.h1>

              {/* Metadata */}
              <motion.div className="flex flex-wrap items-center gap-4 text-white/80" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                {currentAnime.type && <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">{t(currentAnime.type)}</span>}
                {currentAnime.format && <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">{t(currentAnime.format)}</span>}
                {currentAnime.season && <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">{currentAnime.season}</span>}
              </motion.div>

              {/* Tags/Genres */}
              {/* {currentAnime.genres && currentAnime.genres.length > 0 && (
                <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
                  {currentAnime.genres.slice(0, 4).map((genre: string, index: number) => (
                    <span key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-md text-sm text-white/90 hover:bg-white/20 transition-colors">
                      {genre}
                    </span>
                  ))}
                </motion.div>
              )} */}

              {/* Description */}
              {currentAnime.description && (
                <motion.p
                  className="text-white text-sm md:text-base leading-relaxed line-clamp-4 drop-shadow-lg"
                  style={{
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  {currentAnime.description.length > 400
                    ? `${currentAnime.description.slice(0, 400)}...`
                    : currentAnime.description}
                </motion.p>
              )}

              {/* Buttons */}
              <motion.div
                className="flex items-center gap-4 pt-4 pointer-events-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <ControlButton type="primary">
                  <Play className="w-5 h-5 transition-all duration-200 group-hover:scale-110" fill="currentColor" />
                  <span className="hidden md:block">{t("start_watching")}</span>
                </ControlButton>
                <IconButton
                  type="save"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  }
                />
                <IconButton
                  type="share"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                  }
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicator Dots - centered at bottom of entire screen */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto z-20">
        <IndicatorDots items={tops.items} currentIndex={currentIndex} onDotClick={goToSlide} />
      </div>

      {/* FIXED Navigation Buttons - ensure they are on top */}
      <div className="absolute inset-0 pointer-events-none z-[11]">
        <div className="relative h-full w-full pointer-events-none">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
            <NavigationButton direction="left" onClick={() => paginate(-1)} />
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto">
            <NavigationButton direction="right" onClick={() => paginate(1)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeHeroHeader;
