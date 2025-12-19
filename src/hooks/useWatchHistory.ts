"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService, WatchHistoryItem } from "@/services/user";

interface UseWatchHistoryOptions {
  malId: number;
  episodeNumber: number;
  onProgressLoaded?: (progress: number) => void;
}

// Save progress every 10 seconds
const SAVE_INTERVAL = 10 * 1000;
// Minimum progress change to trigger save (5 seconds)
const MIN_PROGRESS_CHANGE = 5;

export function useWatchHistory({
  malId,
  episodeNumber,
  onProgressLoaded,
}: UseWatchHistoryOptions) {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [savedProgress, setSavedProgress] = useState<WatchHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const lastSavedProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedWatching = useRef(false);

  // Load saved progress when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      if (!isAuthenticated || !malId || !episodeNumber) {
        setIsLoading(false);
        return;
      }

      try {
        const token = await getAccessToken();
        if (!token) {
          console.log("[WatchHistory] No access token available, skipping progress load");
          setIsLoading(false);
          return;
        }

        const progress = await userService.getEpisodeProgress(token, malId, episodeNumber);
        if (progress) {
          setSavedProgress(progress);
          lastSavedProgressRef.current = progress.progress;
          if (onProgressLoaded) {
            onProgressLoaded(progress.progress);
          }
        }
      } catch (error) {
        console.error("[WatchHistory] Failed to load progress:", error);
        // Silently fail - user can still watch without history
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [isAuthenticated, malId, episodeNumber, getAccessToken, onProgressLoaded]);

  // Save progress to the server
  const saveProgress = useCallback(async (forceComplete?: boolean) => {
    if (!isAuthenticated || !malId || !episodeNumber) return;
    if (isSaving) return;

    const progress = currentProgressRef.current;
    const duration = durationRef.current;
    
    // Don't save if progress hasn't changed significantly
    if (!forceComplete && Math.abs(progress - lastSavedProgressRef.current) < MIN_PROGRESS_CHANGE) {
      return;
    }

    try {
      setIsSaving(true);
      const token = await getAccessToken();
      if (!token) {
        console.log("[WatchHistory] No access token, skipping save");
        return;
      }

      const completed = forceComplete || (duration > 0 && progress >= duration * 0.9);
      
      await userService.recordWatchProgress(token, malId, episodeNumber, {
        progress: Math.floor(progress),
        duration: duration > 0 ? Math.floor(duration) : undefined,
        completed,
      });

      lastSavedProgressRef.current = progress;
      console.log(`[WatchHistory] Saved progress: ${Math.floor(progress)}s${completed ? ' (completed)' : ''}`);
    } catch (error) {
      // Silently fail - don't interrupt playback
      console.error("[WatchHistory] Failed to save progress:", error);
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, malId, episodeNumber, getAccessToken, isSaving]);

  // Update progress (called by video player)
  const updateProgress = useCallback((currentTime: number, duration: number) => {
    currentProgressRef.current = currentTime;
    durationRef.current = duration;
    
    // Mark as started watching on first significant play
    if (!hasStartedWatching.current && currentTime > 5) {
      hasStartedWatching.current = true;
      
      // Auto-update watchlist status to WATCHING (only if PLAN_TO_WATCH or not in list)
      // Never change COMPLETED, ON_HOLD, or DROPPED back to WATCHING
      const updateWatchStatus = async () => {
        if (!isAuthenticated) return;
        try {
          const token = await getAccessToken();
          if (!token) return;
          
          // Check current status and update if needed
          const item = await userService.getWatchlistItem(token, malId);
          if (item) {
            // Only change PLAN_TO_WATCH to WATCHING
            // Don't change COMPLETED, ON_HOLD, DROPPED, or already WATCHING
            if (item.status === "PLAN_TO_WATCH") {
              await userService.updateWatchlistItem(token, malId, { status: "WATCHING" });
              console.log("[WatchHistory] Updated watchlist status to WATCHING");
            }
          } else {
            // Not in watchlist - add as WATCHING
            await userService.addToWatchlist(token, malId, { status: "WATCHING" });
            console.log("[WatchHistory] Added to watchlist as WATCHING");
          }
        } catch (error) {
          console.error("[WatchHistory] Failed to update watch status:", error);
        }
      };
      
      updateWatchStatus();
    }
  }, [isAuthenticated, malId, getAccessToken]);

  // Start periodic saving when playing
  const startTracking = useCallback(() => {
    if (saveIntervalRef.current) return;
    
    saveIntervalRef.current = setInterval(() => {
      saveProgress();
    }, SAVE_INTERVAL);
    
    console.log("[WatchHistory] Started tracking");
  }, [saveProgress]);

  // Stop periodic saving
  const stopTracking = useCallback(() => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
      
      // Save current progress immediately when stopping
      saveProgress();
      console.log("[WatchHistory] Stopped tracking");
    }
  }, [saveProgress]);

  // Mark episode as completed
  const markCompleted = useCallback(() => {
    saveProgress(true);
  }, [saveProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      // Save progress on unmount
      if (currentProgressRef.current > 0) {
        saveProgress();
      }
    };
  }, [saveProgress]);

  return {
    savedProgress,
    isLoading,
    isSaving,
    updateProgress,
    startTracking,
    stopTracking,
    markCompleted,
  };
}

