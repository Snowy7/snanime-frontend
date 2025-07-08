"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import AnimeCard from "@/components/cards/AnimeCard";
import SectionTitle from "@/components/SectionTitle";
import { NavigationButton } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface RecommendedAnimeProps {
  recommendations: SnAnimeRecommendations[];
  className?: string;
}

const RecommendedAnime: React.FC<RecommendedAnimeProps> = ({ recommendations: relatedAnime, className = "" }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t, getDirection } = useLanguage();

  if (!relatedAnime || relatedAnime.length === 0) {
    return null;
  }

  // Easing function for smooth animation
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  // Custom smooth scroll implementation
  const smoothScrollTo = useCallback((targetPosition: number, duration: number = 400) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const startPosition = container.scrollLeft;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      const currentPosition = startPosition + (distance * easedProgress);
      container.scrollLeft = currentPosition;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateScroll);
      } else {
        setIsScrolling(false);
        checkScrollPosition();
      }
    };

    setIsScrolling(true);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animateScroll);
  }, []);

  // Check scroll position with improved accuracy
  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const isRTL = getDirection() === "rtl";
    const threshold = 2;
    
    if (isRTL) {
      // Simplified RTL handling
      const normalizedScrollLeft = Math.abs(scrollLeft);
      const maxScroll = scrollWidth - clientWidth;
      
      setCanScrollLeft(normalizedScrollLeft < maxScroll - threshold);
      setCanScrollRight(normalizedScrollLeft > threshold);
    } else {
      const maxScroll = scrollWidth - clientWidth;
      setCanScrollLeft(scrollLeft > threshold);
      setCanScrollRight(scrollLeft < maxScroll - threshold);
    }
  }, [getDirection]);

  // Handle native scroll events (for touch/wheel scrolling)
  const handleScroll = useCallback(() => {
    if (isScrolling) return; // Don't interfere with programmatic scrolling
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(checkScrollPosition, 50);
  }, [isScrolling, checkScrollPosition]);

  // Calculate scroll amount based on visible cards
  const getScrollAmount = useCallback(() => {
    if (!scrollContainerRef.current) return 240;
    
    const containerWidth = scrollContainerRef.current.clientWidth;
    const cardWidth = 192; // md:w-48 = 192px
    const gap = 24; // md:gap-6 = 24px
    const cardsVisible = Math.floor(containerWidth / (cardWidth + gap));
    
    // Scroll by 1-2 cards depending on screen size
    const cardsToScroll = cardsVisible <= 2 ? 1 : 2;
    return cardsToScroll * (cardWidth + gap);
  }, []);

  // Smooth scroll function with custom animation
  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollContainerRef.current || isScrolling) return;

    const container = scrollContainerRef.current;
    const isRTL = getDirection() === "rtl";
    const scrollAmount = getScrollAmount();
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    let targetScroll: number;
    
    if (isRTL) {
      const isNegativeRTL = currentScroll <= 0;
      
      if (isNegativeRTL) {
        // Firefox-style RTL
        targetScroll = direction === "left" 
          ? Math.max(-maxScroll, currentScroll - scrollAmount)
          : Math.min(0, currentScroll + scrollAmount);
      } else {
        // Chrome/Safari-style RTL
        targetScroll = direction === "left"
          ? Math.min(maxScroll, currentScroll + scrollAmount)
          : Math.max(0, currentScroll - scrollAmount);
      }
    } else {
      // Standard LTR
      targetScroll = direction === "left"
        ? Math.max(0, currentScroll - scrollAmount)
        : Math.min(maxScroll, currentScroll + scrollAmount);
    }

    // Use custom smooth scroll with longer duration for smoothness
    smoothScrollTo(targetScroll, 500);
  }, [isScrolling, getDirection, getScrollAmount, smoothScrollTo]);

  // Optimized resize handler
  const handleResize = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(checkScrollPosition, 100);
  }, [checkScrollPosition]);

  // Initialize and cleanup
  useEffect(() => {
    const timeoutId = setTimeout(checkScrollPosition, 100);
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [relatedAnime, checkScrollPosition, handleResize]);

  const handleViewAll = () => {
    console.log("View all related anime clicked");
  };

  return (
    <section className={`py-8 md:py-12 ${className}`}>
      <SectionTitle 
        title={t("recommended_anime")} 
        onViewAllClick={relatedAnime.length > 6 ? handleViewAll : undefined} 
      />

      <div className="relative group/container">
        {/* Navigation Buttons */}
        {canScrollLeft && (
          <NavigationButton 
            direction="left" 
            onClick={() => scroll("left")} 
            className="top-[40%] opacity-0 group-hover/container:opacity-100 transition-opacity duration-300 z-10"
          />
        )}
        
        {canScrollRight && (
          <NavigationButton 
            direction="right" 
            onClick={() => scroll("right")} 
            className="top-[40%] opacity-0 group-hover/container:opacity-100 transition-opacity duration-300 z-10"
          />
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-hide"
          onScroll={handleScroll}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            // Remove scroll-behavior to prevent conflicts with custom animation
          }}
        >
          <div 
            className="flex gap-4 md:gap-6 pb-4"
            style={{
              // Optimize for smooth scrolling
              transform: "translateZ(0)", // Force hardware acceleration
              backfaceVisibility: "hidden",
            }}
          >
            {relatedAnime.map((anime, index) => (
              <div 
                key={anime.id} 
                className="flex-shrink-0 w-32 sm:w-40 md:w-48 group/card"
                style={{
                  transform: "translateZ(0)", // Hardware acceleration for each card
                }}
              >
                <AnimeCard show={anime} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendedAnime;