"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { ControlButton, IconButton, NavigationButton } from "./ui/button"; // Assuming these are your custom components
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

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

const AnimeHeroHeader = ({ tops }: { tops: Anime[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { t } = useLanguage();

  // Handle empty tops array
  if (!tops || tops.length === 0) {
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

  const currentAnime = tops[currentIndex];

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + newDirection;
      if (newIndex < 0) return tops.length - 1;
      if (newIndex >= tops.length) return 0;
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
      {/* FIXED Grid Overlay - subtle and appears in darker areas */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]" // z-index 1
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(128, 128, 128, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(128, 128, 128, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* FIXED Circular Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]" // z-index 2
        style={{
          background: `radial-gradient(circle at center, 
            rgba(0,0,0,0) 10%, 
            rgba(0,0,0,0.5) 40%, 
            rgba(0,0,0,0.95) 80%
          )`,
        }}
      />

      {/* bottom fixed gradient overlay */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none z-[3]" // z-index 3
        style={{
          background: "linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0))",
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
            opacity: { duration: 0.6, delay: 0.1},
          }}
          className="absolute inset-0 w-full h-full" // This is the sliding container
        >
          {/* SLIDING Background Image */}
          <img
            src={currentAnime.bannerUrl || currentAnime.posterUrl}
            alt={currentAnime.title}
            className="absolute inset-0 w-full h-full object-cover object-right" // z-index 0 by default within this parent
          />
        </motion.div>
      </AnimatePresence>

      {/* STATIC Content Container - outside AnimatePresence */}
      <div className="relative z-10 flex flex-col justify-between h-full px-8 pointer-events-none">
        <AnimatePresence initial={false} mode="wait">
          {/* Content section with title, description, and metadata */}
          <motion.div
            key={currentIndex}
            className="flex-1 flex items-end justify-start pl-8 md:pl-16 mb-4 md:mb-8 pointer-events-none"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="max-w-5xl space-y-6 px-32 mb-16">
              {/* Title */}
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-wide drop-shadow-2xl leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {currentAnime.title}
              </motion.h1>

              {/* Metadata */}
              <motion.div className="flex flex-wrap items-center gap-4 text-white/80" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                {currentAnime.year && <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">{currentAnime.year}</span>}
                {currentAnime.type && <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">{t(currentAnime.type)}</span>}
                {currentAnime.status && <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">{t(currentAnime.status)}</span>}
              </motion.div>

              {/* Tags/Genres */}
              {currentAnime.genres && currentAnime.genres.length > 0 && (
                <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
                  {currentAnime.genres.slice(0, 4).map((genre: string, index: number) => (
                    <span key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-md text-sm text-white/90 hover:bg-white/20 transition-colors">
                      {genre}
                    </span>
                  ))}
                </motion.div>
              )}

                {/* Description */}
                {currentAnime.description && (
                <motion.p
                  className="text-white text-base md:text-lg leading-relaxed line-clamp-4 drop-shadow-lg"
                  style={{
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  {currentAnime.description.length > 500
                  ? `${currentAnime.description.slice(0, 500)}...`
                  : currentAnime.description}
                </motion.p>
                )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* STATIC buttons and indicators */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-4 pb-32 pointer-events-auto">
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
          </div>

          <div className="pointer-events-auto">
            <IndicatorDots items={tops} currentIndex={currentIndex} onDotClick={goToSlide} />
          </div>
        </div>
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
