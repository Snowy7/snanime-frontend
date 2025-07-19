"use client";
import React, { useCallback, useMemo, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, SkipBack, SkipForward, Loader2 
} from 'lucide-react';
import { PlayerState } from '../types';
import { SKIP_SECONDS } from '../constants';
import { useLanguage } from '@/context/LanguageContext';

interface VideoControlsProps {
  playerState: PlayerState;
  volume: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMute: () => void;
  onFullscreen: () => void;
  onSkip: (seconds: number) => void;
  onSettingsClick: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

export const VideoControls: React.FC<VideoControlsProps> = React.memo(({
  playerState,
  volume,
  isMuted,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMute,
  onFullscreen,
  onSkip,
  onSettingsClick,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  intro,
  outro,
}) => {
  const { isPlaying, currentTime, duration, buffered, isLoading, isFullscreen } = playerState;
  const { t } = useLanguage();

  // Memoize formatted times to prevent recalculation
  const formattedCurrentTime = useMemo(() => {
    if (!isFinite(currentTime)) return '0:00';
    const hours = Math.floor(currentTime / 3600);
    const minutes = Math.floor((currentTime % 3600) / 60);
    const seconds = Math.floor(currentTime % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [currentTime]);

  const formattedDuration = useMemo(() => {
    if (!isFinite(duration)) return '0:00';
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [duration]);

  // Memoize progress percentages
  const progressPercentage = useMemo(() => {
    if (!duration || !isFinite(currentTime)) return 0;
    return Math.min(100, (currentTime / duration) * 100);
  }, [currentTime, duration]);

  const bufferedPercentage = useMemo(() => {
    if (!duration || !isFinite(buffered)) return 0;
    return Math.min(100, (buffered / duration) * 100);
  }, [buffered, duration]);

  // Smooth volume change handler
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  }, [onVolumeChange]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  }, [duration, onSeek]);

  // Memoize skip handlers
  const handleSkipBackward = useCallback(() => onSkip(-SKIP_SECONDS), [onSkip]);
  const handleSkipForward = useCallback(() => onSkip(SKIP_SECONDS), [onSkip]);

  // Skip intro/outro handlers
  const handleSkipIntro = useCallback(() => {
    if (intro && intro.end > 0) {
      onSeek(intro.end);
    }
  }, [intro, onSeek]);

  const handleSkipOutro = useCallback(() => {
    if (outro && outro.end > 0) {
      onSeek(outro.end);
    }
  }, [outro, onSeek]);

  // Check if we're in intro/outro
  const isInIntro = useMemo(() => {
    return intro && intro.start >= 0 && intro.end > intro.start && currentTime >= intro.start && currentTime <= intro.end;
  }, [intro, currentTime]);

  const isInOutro = useMemo(() => {
    return outro && outro.start >= 0 && outro.end > outro.start && currentTime >= outro.start && currentTime <= outro.end;
  }, [outro, currentTime]);

  // Calculate intro/outro positions on progress bar
  const introPosition = useMemo(() => {
    if (!intro || !duration) return null;
    return {
      start: (intro.start / duration) * 100,
      width: ((intro.end - intro.start) / duration) * 100,
    };
  }, [intro, duration]);

  const outroPosition = useMemo(() => {
    if (!outro || !duration) return null;
    return {
      start: (outro.start / duration) * 100,
      width: ((outro.end - outro.start) / duration) * 100,
    };
  }, [outro, duration]);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent py-2 px-2 md:py-4 md:px-8 transition-opacity duration-300 z-50">
      {/* Skip Intro/Outro Buttons */}
      {isInIntro && (
        <div className="absolute bottom-full right-4 mb-4 z-10">
          <button
            onClick={handleSkipIntro}
            className="bg-white/95 hover:bg-white text-black px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm shadow-lg"
          >
            {t('videoPlayer.skipIntro')}
          </button>
        </div>
      )}

      {isInOutro && (
        <div className="absolute bottom-full right-4 mb-4 z-10">
          <button
            onClick={handleSkipOutro}
            className="bg-white/95 hover:bg-white text-black px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm shadow-lg"
          >
            {t('videoPlayer.skipOutro')}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-2 md:mb-3">
        <div 
          className="relative h-1 md:h-1 bg-white/20 rounded-full cursor-pointer group touch-manipulation"
          onClick={handleProgressClick}
        >
          {/* Intro Marker */}
          {introPosition && (
            <div 
              className="absolute h-full bg-yellow-500/60 rounded-full"
              style={{ 
                left: `${introPosition.start}%`, 
                width: `${introPosition.width}%` 
              }}
            />
          )}

          {/* Outro Marker */}
          {outroPosition && (
            <div 
              className="absolute h-full bg-blue-500/60 rounded-full"
              style={{ 
                left: `${outroPosition.start}%`, 
                width: `${outroPosition.width}%` 
              }}
            />
          )}

          {/* Buffered Progress */}
          <div 
            className="absolute h-full bg-white/30 rounded-full transition-all duration-200"
            style={{ width: `${bufferedPercentage}%` }}
          />
          
          {/* Current Progress */}
          <div 
            className="absolute h-full bg-red-500 rounded-full group-hover:h-1.5 transition-all duration-200"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between text-xs md:text-sm text-white/70 mt-1">
          <span>{formattedCurrentTime}</span>
          <span>{formattedDuration}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        {/* Left Side Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Previous Episode (Mobile & Desktop) */}
          {hasPrevious && onPrevious && (
            <button
              onClick={onPrevious}
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 touch-manipulation"
            >
              <SkipBack className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
          )}

          {/* Skip Backward */}
          <button
            onClick={handleSkipBackward}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 touch-manipulation"
          >
            <SkipBack className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={onPlayPause}
            className="p-2 md:p-3 hover:bg-white/10 rounded-lg transition-colors duration-200 touch-manipulation"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 md:w-6 md:h-6 text-white" />
            ) : (
              <Play className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )}
          </button>

          {/* Skip Forward */}
          <button
            onClick={handleSkipForward}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 touch-manipulation"
          >
            <SkipForward className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>

          {/* Next Episode (Mobile & Desktop) */}
          {hasNext && onNext && (
            <button
              onClick={onNext}
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 touch-manipulation"
            >
              <SkipForward className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
          )}

          {/* Volume Controls (Desktop Only) */}
          <div className="hidden md:flex items-center gap-2 ml-2">
            <button
              onClick={onMute}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Volume Controls (Mobile Only) */}
          <button
            onClick={onMute}
            className="md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200 touch-manipulation"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onSettingsClick}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 touch-manipulation"
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={onFullscreen}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 touch-manipulation"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 md:w-5 md:h-5 text-white" />
            ) : (
              <Maximize className="w-4 h-4 md:w-5 md:h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

VideoControls.displayName = 'VideoControls'; 