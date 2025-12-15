"use client";
import React, { useCallback, useMemo } from 'react';
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

  // Memoize formatted times
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

  // Calculate intro/outro positions on progress bar
  const introPosition = useMemo(() => {
    if (!intro || !duration || intro.start < 0 || intro.end <= intro.start) return null;
    return {
      start: (intro.start / duration) * 100,
      width: ((intro.end - intro.start) / duration) * 100,
    };
  }, [intro, duration]);

  const outroPosition = useMemo(() => {
    if (!outro || !duration || outro.start < 0 || outro.end <= outro.start) return null;
    return {
      start: (outro.start / duration) * 100,
      width: ((outro.end - outro.start) / duration) * 100,
    };
  }, [outro, duration]);

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

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8 z-50">
      <div className="rounded-full bg-black/30 backdrop-blur-md border border-white/10 shadow-md shadow-black/40 p-4">
        {/* Skip Intro/Outro Buttons */}
        {isInIntro && (
          <div className="absolute bottom-full right-2 mb-3 z-10 animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={handleSkipIntro}
              className="bg-white hover:bg-white/90 text-black px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 shadow-xl shadow-black/20 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              Skip Intro
            </button>
          </div>
        )}

        {isInOutro && (
          <div className="absolute bottom-full right-2 mb-3 z-10 animate-in fade-in slide-in-from-bottom-2">
            <button
              onClick={handleSkipOutro}
              className="bg-white hover:bg-white/90 text-black px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 shadow-xl shadow-black/20 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Skip Outro
            </button>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          {/* Left Side Controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={onPlayPause}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white" />
              )}
            </button>

            {/* Volume Controls */}
            <div className="hidden md:flex items-center gap-1 ml-2">
              <button
                onClick={onMute}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
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
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`
                }}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full mx-auto max-w-[70%] relative top-2">
            <div
              className="relative h-1.5 bg-white/10 rounded-full cursor-pointer group overflow-hidden"
              onClick={handleProgressClick}
            >
              {/* Intro Marker */}
              {introPosition && (
                <div
                  className="absolute h-full bg-yellow-500/40 border-l border-r border-yellow-500/60 z-10"
                  style={{
                    left: `${introPosition.start}%`,
                    width: `${introPosition.width}%`
                  }}
                  title="Intro"
                />
              )}

              {/* Outro Marker */}
              {outroPosition && (
                <div
                  className="absolute h-full bg-blue-500/40 border-l border-r border-blue-500/60 z-10"
                  style={{
                    left: `${outroPosition.start}%`,
                    width: `${outroPosition.width}%`
                  }}
                  title="Outro"
                />
              )}

              {/* Buffered Progress */}
              <div
                className="absolute h-full bg-white/20 rounded-full transition-all duration-200 z-0"
                style={{ width: `${bufferedPercentage}%` }}
              />

              {/* Current Progress */}
              <div
                className="absolute h-full bg-primary rounded-full transition-all z-20"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Glow effect at tip */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary blur-md" />
              </div>
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-[11px] font-medium text-white/50 mt-2 px-0.5">
              <span>{formattedCurrentTime}</span>
              <span>{formattedDuration}</span>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-1">
            {/* Skip Back */}
            <button
              onClick={handleSkipBackward}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden sm:flex"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>

            {/* Skip Forward */}
            <button
              onClick={handleSkipForward}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden sm:flex"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>

            {/* Mobile Volume */}
            <button
              onClick={onMute}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={onFullscreen}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoControls.displayName = 'VideoControls';
