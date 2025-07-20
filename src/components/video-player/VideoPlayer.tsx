"use client";
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { VideoStream, VideoSource, PlayerState, PlayerError, Mp4QualityLevel, SourcePriority } from './types';
import { VideoControls } from './components/VideoControls';
import { SettingsMenu } from './components/SettingsMenu';
import { SubtitleDisplay } from './components/SubtitleDisplay';
import { useHls } from './hooks/useHls';
import { usePlayerSettings } from './hooks/usePlayerSettings';
import { CONTROLS_HIDE_DELAY, LOADING_TIMEOUT } from './constants';
import { AlertCircle, Loader2, RefreshCw, Play, Pause } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface VideoPlayerProps {
  streams: VideoStream;
  poster?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onVideoRef?: (videoElement: HTMLVideoElement | null) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  streams,
  poster,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  onVideoRef,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const previousSourceRef = useRef<string | null>(null);

  const { settings, updateSettings } = usePlayerSettings();
  const { t } = useLanguage();
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [hlsQualityLevels, setHlsQualityLevels] = useState<any[]>([]);
  const [showPlayPauseIndicator, setShowPlayPauseIndicator] = useState(false);
  const [currentSourceType, setCurrentSourceType] = useState<'hls' | 'mp4'>('hls');
  const [hlsFailed, setHlsFailed] = useState(false);
  const [failedSources, setFailedSources] = useState<Set<string>>(new Set());

  // Process and organize sources with priority system
  const sourcePriority = useMemo((): SourcePriority => {
    const hlsSources = streams.sources.filter(source => source.isM3U8);
    const mp4Sources = streams.sources.filter(source => !source.isM3U8);

    return {
      preferredSource: hlsSources[0] || null, // Use first HLS source as preferred
      fallbackSources: mp4Sources,
      currentSourceType: hlsSources.length > 0 ? 'hls' : 'mp4',
      currentSourceIndex: 0,
    };
  }, [streams.sources]);

  // Create MP4 quality levels with duplicate handling
  const mp4QualityLevels = useMemo(() => {
    const mp4Sources = streams.sources.filter(source => !source.isM3U8);
    const qualityCount: Record<string, number> = {};

    return mp4Sources.map((source, index) => {
      const quality = source.quality || 'Unknown';
      const server = source.server || `Server ${index + 1}`;

      // Handle duplicate qualities
      qualityCount[quality] = (qualityCount[quality] || 0) + 1;
      const duplicateIndex = qualityCount[quality] - 1;

      const name = duplicateIndex > 0
        ? `${quality} (${duplicateIndex})`
        : quality;

      return {
        index,
        quality,
        name,
        url: source.url,
        server,
        originalIndex: streams.sources.indexOf(source),
      };
    });
  }, [streams.sources]);

  // Determine if current stream has MP4 sources
  const hasMP4Sources = useMemo(() => {
    return streams.sources.some(source => !source.isM3U8);
  }, [streams.sources]);

  // Determine if current stream has HLS sources
  const hasHLSSources = useMemo(() => {
    return streams.sources.some(source => source.isM3U8);
  }, [streams.sources]);

  // Validate and set default subtitle language
  useEffect(() => {
    if (!streams.subtitles || streams.subtitles.length === 0) return;

    const availableLanguages = streams.subtitles.map(sub => sub.lang);
    const currentLang = settings.selectedSubtitleLang;

    // If current language is not available, set to default
    if (currentLang !== 'off' && !availableLanguages.includes(currentLang)) {
      // Try to find English first, then use the first available
      const defaultLang = availableLanguages.find(lang =>
        lang.toLowerCase().includes('en') || lang.toLowerCase().includes('english')
      ) || availableLanguages[0];

      updateSettings({ selectedSubtitleLang: defaultLang });
    }

    // If no subtitle is selected and subtitles are available, auto-select default
    if (currentLang === 'off' && availableLanguages.length > 0) {
      const defaultLang = availableLanguages.find(lang =>
        lang.toLowerCase().includes('en') || lang.toLowerCase().includes('english')
      ) || availableLanguages[0];

      updateSettings({ selectedSubtitleLang: defaultLang });
    }
  }, [streams.subtitles, settings.selectedSubtitleLang, updateSettings]);

  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    isLoading: true,
    error: null,
    isFullscreen: false,
    showControls: true,
  });

  const [playerError, setPlayerError] = useState<PlayerError | null>(null);
  const [isPlayerFocused, setIsPlayerFocused] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Memoize current source with priority and fallback logic
  const currentSource = useMemo(() => {
    let source: VideoSource | null = null;

    if (currentSourceType === 'hls' && sourcePriority.preferredSource && !hlsFailed) {
      // Try HLS first if available and not failed
      source = sourcePriority.preferredSource;
    } else if (currentSourceType === 'mp4' || hlsFailed) {
      // Use MP4 fallback - either user selected MP4 or HLS failed
      const mp4Sources = sourcePriority.fallbackSources;
      if (mp4Sources.length > 0) {
        const selectedIndex = Math.min(settings.selectedMp4Quality, mp4Sources.length - 1);
        source = mp4Sources[selectedIndex] || mp4Sources[0] || null;
      }
    }

    // Skip failed sources
    if (source && failedSources.has(source.url)) {
      // Try next available source
      if (currentSourceType === 'hls' && sourcePriority.fallbackSources.length > 0) {
        // HLS failed, switch to MP4
        setCurrentSourceType('mp4');
        setHlsFailed(true);
        const mp4Sources = sourcePriority.fallbackSources;
        source = mp4Sources[0] || null;
      } else if (currentSourceType === 'mp4') {
        // Current MP4 failed, try next MP4 source
        const mp4Sources = sourcePriority.fallbackSources;
        const currentIndex = mp4Sources.findIndex(s => s.url === source?.url);
        const nextIndex = currentIndex + 1;
        if (nextIndex < mp4Sources.length) {
          source = mp4Sources[nextIndex] || null;
        } else {
          source = null; // All sources failed
        }
      }
    }

    if (!source) return null;

    // Check if source has changed
    if (source.url !== previousSourceRef.current) {
      previousSourceRef.current = source.url;
      return source;
    }

    return source;
  }, [streams.sources, settings.selectedMp4Quality, currentSourceType, hlsFailed, failedSources, sourcePriority]);

  const handleHlsError = useCallback((error: PlayerError) => {
    console.error('HLS Error in component:', error);
    setPlayerError(error);

    // If it's a fatal error, mark current source as failed and try fallback
    if (error.fatal) {
      if (currentSource) {
        console.log('Marking source as failed:', currentSource.url);
        setFailedSources(prev => new Set([...prev, currentSource.url]));

        // If HLS failed and we have MP4 fallbacks, switch to MP4
        if (currentSourceType === 'hls' && sourcePriority.fallbackSources.length > 0) {
          console.log('HLS failed, switching to MP4 fallback');
          setCurrentSourceType('mp4');
          setHlsFailed(true);
          setPlayerError(null); // Clear error to try MP4
        } else {
          // No more fallbacks available
          setPlayerState(prev => ({
            ...prev,
            isLoading: false,
            error: error.message
          }));
        }
      }
    }
  }, [currentSource, currentSourceType, sourcePriority.fallbackSources.length]);

  // Validate HLS quality setting
  useEffect(() => {
    if (hlsQualityLevels.length > 0 && settings.selectedHlsQuality >= hlsQualityLevels.length) {
      // Reset to auto if selected quality is not available
      updateSettings({ selectedHlsQuality: -1 });
    }
  }, [hlsQualityLevels, settings.selectedHlsQuality, updateSettings]);

  // Validate MP4 quality setting
  useEffect(() => {
    if (mp4QualityLevels.length > 0 && settings.selectedMp4Quality >= mp4QualityLevels.length) {
      // Reset to first quality if selected quality is not available
      updateSettings({ selectedMp4Quality: 0 });
    }
  }, [mp4QualityLevels, settings.selectedMp4Quality, updateSettings]);

  // Reset failed sources and source type when stream changes
  useEffect(() => {
    setFailedSources(new Set());
    setHlsFailed(false);
    setCurrentSourceType(sourcePriority.currentSourceType);
    setPlayerError(null);
  }, [streams.sources, sourcePriority.currentSourceType]);

  // HLS Hook
  const { isLoading: hlsLoading, retryCount } = useHls({
    videoRef,
    source: currentSource,
    headers: streams.headers,
    onError: handleHlsError,
    onLevelsLoaded: setHlsQualityLevels,
    selectedQuality: settings.selectedHlsQuality,
  });

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      previousSourceRef.current = null;
    };
  }, []);

  // Video ref callback
  useEffect(() => {
    if (onVideoRef) {
      onVideoRef(videoRef.current);
    }
  }, [onVideoRef]);

  // Loading timeout
  useEffect(() => {
    if (playerState.isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('Loading timeout reached, but continuing...');
        // Don't treat as error, just log it
      }, LOADING_TIMEOUT);
    } else {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [playerState.isLoading]);

  // Controls visibility
  const showControls = useCallback(() => {
    setPlayerState(prev => ({ ...prev, showControls: true }));

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (playerState.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setPlayerState(prev => ({ ...prev, showControls: false }));
      }, CONTROLS_HIDE_DELAY);
    }
  }, [playerState.isPlaying]);

  // Show play/pause indicator
  const showPlayPauseIndicatorBriefly = useCallback(() => {
    setShowPlayPauseIndicator(true);
    setTimeout(() => setShowPlayPauseIndicator(false), 600);
  }, []);

  // Event handlers
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (playerState.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => {
        console.error('Play error:', e);
        setPlayerError({
          type: 'media',
          message: t('videoPlayer.unableToPlay'),
          details: e,
          fatal: false,
          retry: true,
        });
      });
    }

    showPlayPauseIndicatorBriefly();
  }, [playerState.isPlaying, showPlayPauseIndicatorBriefly, t]);

  const handleSeek = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  }, []);

  const handleSkip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, videoRef.current.duration));
    videoRef.current.currentTime = newTime;
  }, []);

  const handleVolumeChange = useCallback((volume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
    updateSettings({ volume, isMuted: volume === 0 });
  }, [updateSettings]);

  const handleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !settings.isMuted;
    videoRef.current.muted = newMuted;
    updateSettings({ isMuted: newMuted });
  }, [settings.isMuted, updateSettings]);

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleRetry = useCallback(() => {
    setPlayerError(null);
    setPlayerState(prev => ({ ...prev, error: null, isLoading: true }));

    // Reload the current source
    if (videoRef.current && currentSource) {
      videoRef.current.load();
    }
  }, [currentSource]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setPlayerState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setPlayerState(prev => ({ ...prev, isPlaying: false }));
    const handleLoadStart = () => setPlayerState(prev => ({ ...prev, isLoading: true }));
    const handleCanPlay = () => setPlayerState(prev => ({ ...prev, isLoading: false }));
    const handleError = (e: Event) => {
      const videoError = video.error;
      console.error('Video error:', videoError);

      setPlayerError({
        type: 'media',
        message: videoError?.message || t('videoPlayer.unknownVideoError'),
        details: videoError,
        fatal: true,
        retry: true,
      });

      setPlayerState(prev => ({
        ...prev,
        isLoading: false,
        error: videoError?.message || t('videoPlayer.videoPlaybackError')
      }));
    };

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: video.currentTime,
        duration: video.duration || 0,
      }));
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setPlayerState(prev => ({ ...prev, buffered: bufferedEnd }));
      }
    };

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: video.duration || 0,
      }));

      // Apply saved settings
      video.volume = settings.volume;
      video.muted = settings.isMuted;
      video.playbackRate = settings.playbackSpeed;
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [settings.volume, settings.isMuted, settings.playbackSpeed, t]);

  // Fullscreen event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setPlayerState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts - only when player is focused
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when player is focused and not typing in an input
      if (!videoRef.current || !isPlayerFocused) return;

      // Don't handle shortcuts if user is typing in an input field
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      )) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'arrowleft':
          e.preventDefault();
          handleSkip(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          handleSkip(10);
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(Math.min(1, settings.volume + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, settings.volume - 0.1));
          break;
        case 'm':
          e.preventDefault();
          handleMute();
          break;
        case 'f':
          e.preventDefault();
          handleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handlePlayPause, handleSkip, handleVolumeChange, handleMute, handleFullscreen, settings.volume, isPlayerFocused]);

  const isLoading = playerState.isLoading || hlsLoading;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black aspect-video w-full overflow-hidden group ${playerState.isFullscreen && !playerState.showControls ? 'cursor-none' : ''
        }`}
      onMouseMove={showControls}
      onMouseEnter={() => setIsPlayerFocused(true)}
      onMouseLeave={() => {
        setIsPlayerFocused(false);
        if (playerState.isPlaying) {
          setPlayerState(prev => ({ ...prev, showControls: false }));
        }
      }}
      onFocus={() => setIsPlayerFocused(true)}
      onBlur={() => setIsPlayerFocused(false)}
      onTouchStart={showControls}
      tabIndex={0}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full rounded-2xl"
        poster={poster}
        playsInline
      />

      {/* Click to play/pause overlay - only covers video area, not controls */}
      <div
        className="absolute inset-0 bottom-16 md:bottom-20"
        onClick={handlePlayPause}
      />

      {/* Play/Pause Indicator */}
      {showPlayPauseIndicator && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-full p-4 animate-pulse">
            {playerState.isPlaying ? (
              <Pause className="w-12 h-12 text-white" />
            ) : (
              <Play className="w-12 h-12 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && !playerError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
            <p className="text-white text-sm">{t('videoPlayer.loading')}</p>
            {retryCount > 0 && (
              <p className="text-white/60 text-xs mt-1">{t('videoPlayer.loadingWithRetry', { count: retryCount })}</p>
            )}
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {playerError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center max-w-md p-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{t('videoPlayer.playbackError')}</h3>
            <p className="text-white/70 mb-4">{playerError.message}</p>
            {playerError.retry && (
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                {t('retry')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${playerState.showControls ? 'opacity-100' : 'opacity-0'
        }`}>
        <VideoControls
          playerState={playerState}
          volume={settings.volume}
          isMuted={settings.isMuted}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onMute={handleMute}
          onFullscreen={handleFullscreen}
          onSkip={handleSkip}
          onSettingsClick={() => setShowSettingsMenu(!showSettingsMenu)}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onNext={onNext}
          onPrevious={onPrevious}
          intro={streams.intro}
          outro={streams.outro}
        />
      </div>

      {/* Subtitles */}
      <SubtitleDisplay
        subtitles={streams.subtitles}
        currentTime={playerState.currentTime}
        settings={settings}
        isVisible={!showSettingsMenu}
      />

      {/* Settings Menu */}
      <SettingsMenu
        settings={settings}
        onSettingsChange={updateSettings}
        onClose={() => setShowSettingsMenu(false)}
        hlsQualityLevels={hlsQualityLevels}
        mp4QualityLevels={mp4QualityLevels}
        availableSubtitles={streams.subtitles}
        isVisible={showSettingsMenu}
        isMP4Stream={currentSourceType === 'mp4'}
        hasHLSSource={hasHLSSources}
        hasMP4Sources={hasMP4Sources}
        currentSourceType={currentSourceType}
        onSourceTypeChange={(sourceType) => {
          setCurrentSourceType(sourceType);
          if (sourceType === 'hls') {
            setHlsFailed(false);
          }
        }}
      />
    </div>
  );
}; 