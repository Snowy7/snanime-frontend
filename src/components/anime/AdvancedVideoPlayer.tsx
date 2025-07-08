"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipBack, SkipForward, RotateCcw, Loader2, ChevronDown, ChevronRight, X, Monitor, Type, Palette, Move } from "lucide-react";
import Hls from "hls.js";

const PLAYER_SETTINGS_KEY = 'player-settings';

const getInitialSettings = () => {
  const defaults = {
    volume: 1,
    isMuted: false,
    selectedHlsQuality: -1,
    selectedSubtitleLang: 'English', // Default to English or 'off'
    playbackSpeed: 1,
    subtitleFontSize: 16,
    subtitleColor: '#ffffff',
    subtitleBackgroundColor: '#000000',
    subtitleBackgroundOpacity: 0.8,
    subtitleVerticalPosition: 85,
  };

  if (typeof window === 'undefined') {
    return defaults;
  }

  try {
    const savedSettings = localStorage.getItem(PLAYER_SETTINGS_KEY);
    return savedSettings ? { ...defaults, ...JSON.parse(savedSettings) } : defaults;
  } catch (error) {
    console.error("Error parsing player settings from localStorage", error);
    return defaults;
  }
};

interface AdvancedVideoPlayerProps {
  streams: SnEpisodeStream;
  poster?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Custom styles for the modal and settings panels
const customStyles = `
  /* Animation for modal appearance */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.3s ease-out forwards;
  }
  
  /* Custom Scrollbar Styles */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  /* Prevent body scroll when modal is open */
  body.modal-open {
    overflow: hidden !important;
    position: fixed;
    width: 100%;
    height: 100%;
  }
  
  /* Custom Range Slider */
  .acrylic-slider {
    background: linear-gradient(to right, rgba(80, 80, 80, 0.4), rgba(60, 60, 60, 0.5));
    height: 4px;
    border-radius: 8px;
    appearance: none;
    margin: 10px 0;
    cursor: pointer;
  }
  
  .acrylic-slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    background: #ef4444;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;
  }
  
  .acrylic-slider::-webkit-slider-thumb:hover {
    background: #f87171;
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2), 0 2px 8px rgba(0, 0, 0, 0.4);
  }
  
  .acrylic-slider::-webkit-slider-thumb:active {
    background: #dc2626;
    transform: scale(1.05);
  }
  
  /* Acrylic panel styles */
  .acrylic-panel {
    background: rgba(10, 10, 10, 0.6);
    backdrop-filter: blur(8px) saturate(150%);
    -webkit-backdrop-filter: blur(8px) saturate(150%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  }
  
  /* Prevent scroll propagation */
  .prevent-scroll-propagation {
    overscroll-behavior: contain;
  }
`;

const AdvancedVideoPlayer: React.FC<AdvancedVideoPlayerProps> = ({
  streams,
  poster,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const initialSettings = useMemo(() => getInitialSettings(), []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(initialSettings.volume);
  const [isMuted, setIsMuted] = useState(initialSettings.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'main' | 'quality' | 'subtitles' | 'subtitle-style'>('main');
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number>(0);
  const [selectedSubtitleIndex, setSelectedSubtitleIndex] = useState<number>(-1);
  const [selectedSubtitleLang, setSelectedSubtitleLang] = useState<string>(initialSettings.selectedSubtitleLang);
  const [playbackSpeed, setPlaybackSpeed] = useState(initialSettings.playbackSpeed);
  const [buffered, setBuffered] = useState(0);
  const [failedSources, setFailedSources] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // State for HLS quality levels
  const [hlsQualityLevels, setHlsQualityLevels] = useState<Array<{ level: number, height: number, width: number, bitrate: number, name: string }>>([]);
  const [selectedHlsQuality, setSelectedHlsQuality] = useState<number>(initialSettings.selectedHlsQuality); // -1 for auto

  // Subtitle settings
  const [subtitleFontSize, setSubtitleFontSize] = useState(initialSettings.subtitleFontSize);
  const [subtitleColor, setSubtitleColor] = useState(initialSettings.subtitleColor);
  const [subtitleBackgroundColor, setSubtitleBackgroundColor] = useState(initialSettings.subtitleBackgroundColor);
  const [subtitleBackgroundOpacity, setSubtitleBackgroundOpacity] = useState(initialSettings.subtitleBackgroundOpacity);
  const [subtitleVerticalPosition, setSubtitleVerticalPosition] = useState(initialSettings.subtitleVerticalPosition);
  const [showSubtitleSettings, setShowSubtitleSettings] = useState(false);

  // Adjust subtitle font size for mobile
  const getResponsiveSubtitleFontSize = () => {
    return isMobile ? Math.max(12, subtitleFontSize - 2) : subtitleFontSize;
  };

  // State for mobile/touch handling
  const [isMobile, setIsMobile] = useState(false);
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [showMobileVolumeSlider, setShowMobileVolumeSlider] = useState(false);

  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get current sources from the single stream
  const currentSources = streams?.sources || [];
  const subtitles = streams?.subtitles || [];
  const intro = streams?.intro;
  const outro = streams?.outro;

  // Effect to save settings to localStorage
  useEffect(() => {
    const settingsToSave = {
      volume,
      isMuted,
      selectedHlsQuality,
      selectedSubtitleLang,
      playbackSpeed,
      subtitleFontSize,
      subtitleColor,
      subtitleBackgroundColor,
      subtitleBackgroundOpacity,
      subtitleVerticalPosition,
    };
    localStorage.setItem(PLAYER_SETTINGS_KEY, JSON.stringify(settingsToSave));
  }, [
    volume,
    isMuted,
    selectedHlsQuality,
    selectedSubtitleLang,
    playbackSpeed,
    subtitleFontSize,
    subtitleColor,
    subtitleBackgroundColor,
    subtitleBackgroundOpacity,
    subtitleVerticalPosition,
  ]);

  // Filter out failed sources and sort by quality (M3U8 preferred, then by URL)
  const availableSources = useMemo(() => {
    return currentSources
      .filter((source) => !failedSources.has(source.url))
      .sort((a, b) => {
        // Prefer M3U8 streams
        if (a.isM3U8 && !b.isM3U8) return -1;
        if (!a.isM3U8 && b.isM3U8) return 1;
        return 0;
      });
  }, [currentSources, failedSources]);

  // Determine initial subtitle index from saved language preference
  useEffect(() => {
    if (subtitles && subtitles.length > 0) {
      if (selectedSubtitleLang === 'off') {
        setSelectedSubtitleIndex(-1);
      } else {
        const savedLangIndex = subtitles.findIndex(s => s.lang === selectedSubtitleLang);
        if (savedLangIndex !== -1) {
          setSelectedSubtitleIndex(savedLangIndex);
        } else {
          // If saved lang not found, default to the first subtitle if it's not 'off'
          if (selectedSubtitleLang !== 'off' && subtitles.length > 0) {
            setSelectedSubtitleIndex(0);
            setSelectedSubtitleLang(subtitles[0].lang);
          } else {
            setSelectedSubtitleIndex(-1);
          }
        }
      }
    } else {
      setSelectedSubtitleIndex(-1);
    }
  }, [subtitles, selectedSubtitleLang]);

  // Helper function to get quality name from source
  const getQualityName = (source: SnEpisodeSource, index: number) => {
    // Try to extract quality from URL or use index
    const url = source.url.toLowerCase();

    if (url.includes('1080') || url.includes('fhd')) return '1080p';
    if (url.includes('720') || url.includes('hd')) return '720p';
    if (url.includes('480') || url.includes('sd')) return '480p';
    if (url.includes('360')) return '360p';
    if (url.includes('240')) return '240p';

    // Check if it's the highest quality available
    if (index === 0) return 'Best';
    if (index === availableSources.length - 1) return 'Lowest';

    return `Quality ${index + 1}`;
  };

  // Get current source
  const currentSource = availableSources[selectedSourceIndex];

  // Debug logging in useEffect to prevent infinite re-renders
  useEffect(() => {
    console.log("Video Player Debug Info:");
    console.log("- Available Sources:", availableSources.length);
    console.log("- Subtitles count:", subtitles?.length || 0);
    console.log("- Selected source index:", selectedSourceIndex);
    console.log("- Selected subtitle index:", selectedSubtitleIndex);
    if (process.env.NODE_ENV === 'development') {
      console.log("- Sources:", availableSources);
      console.log("- Subtitles:", subtitles);
      console.log("- Stream Headers:", streams?.headers);
    }
  }, [availableSources.length, subtitles?.length, selectedSourceIndex, selectedSubtitleIndex]);

  // Detect mobile device and orientation
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || 'ontouchstart' in window;
      setIsMobile(isMobileDevice);

      // Auto-hide mobile hints after 5 seconds
      if (isMobileDevice && showControls) {
        setTimeout(() => {
          if (isPlaying) {
            setShowControls(false);
          }
        }, 8000);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, [showControls, isPlaying]);

  const isHLSStream = (source: SnEpisodeSource) => {
    return source.isM3U8 || source.type === "application/x-mpegURL" || source.type === "application/vnd.apple.mpegurl" || source.type === "hls" || source.url.includes(".m3u8");
  };

  // Helper function to create proxy URLs for CORS bypass
  const createProxyUrl = (originalUrl: string, isM3U8: boolean = false) => {
    const headers = streams?.headers || {};
    const encodedUrl = encodeURIComponent(originalUrl);
    const encodedHeaders = encodeURIComponent(JSON.stringify(headers));

    const baseUrl = process.env.NEXT_PUBLIC_SNANIME_URL || "http://localhost:5000/api/v1";
    const endpoint = isM3U8 ? '/proxy/m3u8' : '/proxy/stream';

    return `${baseUrl}${endpoint}?url=${encodedUrl}&headers=${encodedHeaders}`;
  };

  // Helper function to load subtitles
  const loadSubtitles = async (video: HTMLVideoElement) => {
    console.log("Loading subtitles...");
    console.log("Selected subtitle index:", selectedSubtitleIndex);
    console.log("Available subtitles:", subtitles);

    // Clean up any existing blob URLs
    if ((video as any).__subtitleCleanup) {
      (video as any).__subtitleCleanup();
      (video as any).__subtitleCleanup = null;
    }

    // Remove existing text tracks
    const existingTracks = Array.from(video.textTracks);
    existingTracks.forEach((track) => {
      track.mode = 'disabled';
    });

    // Clear existing track elements
    const trackElements = video.querySelectorAll('track');
    trackElements.forEach(track => track.remove());

    // Add new subtitle if selected
    if (selectedSubtitleIndex >= 0 && subtitles[selectedSubtitleIndex]) {
      const subtitle = subtitles[selectedSubtitleIndex];
      console.log("Loading subtitle:", subtitle);

      try {
        // Fetch subtitle content through our proxy
        const proxyUrl = createProxyUrl(subtitle.url, false);
        console.log("Fetching subtitle from proxy URL:", proxyUrl);

        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/vtt,text/plain,*/*',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch subtitle: ${response.status} ${response.statusText}`);
        }

        const subtitleContent = await response.text();
        console.log("Subtitle content fetched successfully, length:", subtitleContent.length);
        console.log("Subtitle content preview:", subtitleContent.substring(0, 200));

        // Create a blob URL for the subtitle content (this bypasses CORS for <track> elements)
        const blob = new Blob([subtitleContent], { type: 'text/vtt' });
        const blobUrl = URL.createObjectURL(blob);
        console.log("Created blob URL for subtitle:", blobUrl);

        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.src = blobUrl;
        track.srclang = subtitle.lang.toLowerCase().replace(/\s+/g, '-');
        track.label = subtitle.lang;
        track.default = true;

        // Add error handling for track loading
        track.addEventListener('load', () => {
          console.log("Subtitle track loaded successfully:", subtitle.lang);
        });

        track.addEventListener('error', (e) => {
          console.error("Failed to load subtitle track:", e, subtitle);
          // Clean up blob URL on error
          URL.revokeObjectURL(blobUrl);
        });

        video.appendChild(track);

        // Enable the track after a brief delay
        setTimeout(() => {
          const textTrack = video.textTracks[video.textTracks.length - 1];
          if (textTrack) {
            textTrack.mode = 'showing';
            console.log("Subtitle track enabled:", textTrack);
          }
        }, 100);

        // Clean up blob URL when video is unloaded or component unmounts
        const cleanupBlobUrl = () => {
          console.log("Cleaning up blob URL:", blobUrl);
          URL.revokeObjectURL(blobUrl);
        };

        video.addEventListener('emptied', cleanupBlobUrl, { once: true });
        video.addEventListener('loadstart', cleanupBlobUrl, { once: true });

        // Store cleanup function for manual cleanup
        (video as any).__subtitleCleanup = cleanupBlobUrl;

      } catch (error) {
        console.error("Failed to load subtitle:", error);
      }
    } else {
      console.log("No subtitle selected or no subtitles available");
    }
  };

  // Handle source failure and auto-switch to next source
  const handleSourceError = (failedUrl: string, errorMessage?: string) => {
    console.error("Source failed:", failedUrl, errorMessage);
    setError(errorMessage || "Source failed to load");

    // Mark this source as failed
    setFailedSources((prev) => {
      const newFailedSources = new Set([...prev, failedUrl]);

      // Find next available source (excluding the newly failed one)
      const availableSources = currentSources.filter((source) => source.url !== failedUrl && !newFailedSources.has(source.url));

      if (availableSources.length > 0) {
        const nextSourceIndex = currentSources.findIndex(source => source.url === availableSources[0].url);
        console.log("Switching to next source:", availableSources[0].url);
        setSelectedSourceIndex(nextSourceIndex);
        setError(null);
      } else {
        console.error("No more sources available");
        setError("No more sources available");
      }

      return newFailedSources;
    });
  };

  // Load video source
  const loadSource = (source: SnEpisodeSource) => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setError(null);

    // Set a fallback timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn("Video loading timeout, attempting to continue...");
      setIsLoading(false);
    }, 15000);

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Clear HLS quality levels if switching to non-HLS source
    if (!isHLSStream(source)) {
      setHlsQualityLevels([]);
      setSelectedHlsQuality(-1);
    }

    const video = videoRef.current;
    const isHLS = isHLSStream(source);

    // Get headers from the stream
    const headers = streams?.headers || {};
    console.log("Available headers:", headers);
    console.log("Source URL:", source.url);

    if (isHLS && Hls.isSupported()) {
      // Use HLS.js for HLS streams with proxy URL to bypass CORS
      const proxyUrl = createProxyUrl(source.url, true);
      console.log("Using proxy URL for HLS:", proxyUrl);

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 3,
        maxFragLookUpTolerance: 0.25,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: Infinity,
        liveDurationInfinity: false,
        enableSoftwareAES: true,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 1,
        manifestLoadingRetryDelay: 1000,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 4,
        levelLoadingRetryDelay: 1000,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 1000,
        // Note: No need for custom xhrSetup since we're using the proxy
      });

      hlsRef.current = hls;

      hls.loadSource(proxyUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest parsed successfully");
        clearTimeout(loadingTimeout);
        setIsLoading(false);

        // Extract quality levels from HLS
        const levels = hls.levels.map((level, index) => ({
          level: index,
          height: level.height,
          width: level.width,
          bitrate: level.bitrate,
          name: level.height ? `${level.height}p` : `Level ${index + 1}`
        }));

        console.log("Available HLS quality levels:", levels);
        setHlsQualityLevels(levels);

        // Apply the selected quality level or default to auto
        if (selectedHlsQuality >= 0 && selectedHlsQuality < levels.length) {
          hls.currentLevel = selectedHlsQuality;
          console.log("Applied saved HLS quality:", levels[selectedHlsQuality]?.name);
        } else {
          hls.currentLevel = -1; // Auto quality
          console.log("Applied auto HLS quality");
        }

        // Load subtitles after video is ready
        setTimeout(async () => {
          await loadSubtitles(video);
        }, 500);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);
        clearTimeout(loadingTimeout);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error detected, switching to next source...");
              handleSourceError(source.url, `Network Error: ${data.details}`);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, trying to recover...");
              try {
                hls.recoverMediaError();
              } catch (err) {
                console.log("Media recovery failed, switching source...");
                handleSourceError(source.url, `Media Error: ${data.details}`);
              }
              break;
            default:
              console.log("Fatal error, switching to next source...");
              handleSourceError(source.url, `HLS Error: ${data.type} - ${data.details}`);
              break;
          }
        } else {
          // Non-fatal errors that might indicate source issues
          if (
            data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
            data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT ||
            data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR ||
            data.details === Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT ||
            data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR ||
            data.details === Hls.ErrorDetails.FRAG_LOAD_TIMEOUT
          ) {
            console.log("Source load error, switching to next source...");
            handleSourceError(source.url, `Source Load Error: ${data.details}`);
          }
        }
      });

      hls.on(Hls.Events.FRAG_LOAD_EMERGENCY_ABORTED, () => {
        console.log("Fragment load emergency aborted, switching source...");
        clearTimeout(loadingTimeout);
        handleSourceError(source.url, "Fragment load failed");
      });
    } else if (isHLS && video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari) - use proxy to avoid CORS issues
      console.log("Using native HLS playback with proxy");
      const proxyUrl = createProxyUrl(source.url, true);
      video.src = proxyUrl;

      video.addEventListener("loadedmetadata", () => {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
        setTimeout(async () => {
          await loadSubtitles(video);
        }, 500);
      });
      video.addEventListener("error", (e) => {
        console.error("Native HLS proxy error:", e);
        clearTimeout(loadingTimeout);
        handleSourceError(source.url, "Native HLS playback failed");
      });
    } else if (!isHLS) {
      // For non-HLS sources, use proxy to avoid CORS issues
      console.log("Using direct video source with proxy");
      const proxyUrl = createProxyUrl(source.url, false);
      video.src = proxyUrl;

      video.addEventListener("loadedmetadata", () => {
        clearTimeout(loadingTimeout);
        setIsLoading(false);
        setTimeout(async () => {
          await loadSubtitles(video);
        }, 500);
      });
      video.addEventListener("error", (e) => {
        console.error("Direct video proxy error:", e);
        clearTimeout(loadingTimeout);
        handleSourceError(source.url, "Video playback failed");
      });
    } else {
      clearTimeout(loadingTimeout);
      handleSourceError(source.url, "HLS not supported in this browser");
    }

    // Set video properties
    video.volume = isMuted ? 0 : volume;
    video.playbackRate = playbackSpeed;
  };

  // Load source when current source changes
  useEffect(() => {
    if (currentSource) {
      loadSource(currentSource);
    }
  }, [currentSource]);

  // Reload subtitles when subtitle selection changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 1) {
      loadSubtitles(video);
    }
  }, [selectedSubtitleIndex]);

  // Apply subtitle styling
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const style = document.createElement('style');
      style.id = 'subtitle-styling';

      // Remove existing style if present
      const existingStyle = document.getElementById('subtitle-styling');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Calculate position from bottom (using improved CSS for better control)
      const bottomOffset = 100 - subtitleVerticalPosition;

      // Apply a CSS class to the video for better subtitle positioning control
      video.className += `video-player subtitle-pos-${subtitleVerticalPosition}`;

      style.textContent = `
        video::cue {
          font-size: ${getResponsiveSubtitleFontSize()}px !important;
          color: ${subtitleColor} !important;
          background-color: ${subtitleBackgroundColor}${Math.round(subtitleBackgroundOpacity * 255).toString(16).padStart(2, '0')} !important;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8) !important;
          font-family: Arial, sans-serif !important;
          font-weight: bold !important;
          line-height: 1.2 !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          white-space: pre-line !important;
        }
        
        /* Improved subtitle positioning using multiple CSS strategies */
        .video-player {
          --subtitle-offset: ${bottomOffset}px;
          --subtitle-position: ${subtitleVerticalPosition}%;
        }
        
        /* WebKit browsers (Chrome, Safari, Edge) */
        .video-player::-webkit-media-text-track-container {
          transform: translateY(calc(-1 * var(--subtitle-offset))) !important;
          bottom: 20px !important;
          position: relative !important;
          margin-bottom: ${bottomOffset * 0.5}px !important;
        }
        
        .video-player::-webkit-media-text-track-display {
          bottom: var(--subtitle-offset) !important;
          position: relative !important;
          transform: translateY(-${bottomOffset * 0.8}px) !important;
        }
        
        /* Firefox and other browsers */
        .video-player::cue-region {
          bottom: var(--subtitle-offset) !important;
          position: relative !important;
        }
        
        /* Alternative fallback positioning with viewport units */
        .subtitle-pos-${subtitleVerticalPosition}::-webkit-media-text-track-container {
          margin-bottom: ${bottomOffset * 0.8}px !important;
          padding-bottom: ${bottomOffset * 0.3}px !important;
        }
        
        /* Enhanced positioning for different browsers with !important override */
        @supports (-webkit-text-stroke: 1px black) {
          .video-player::cue {
            position: relative !important;
            bottom: ${bottomOffset * 0.5}px !important;
            margin-bottom: ${bottomOffset * 0.2}px !important;
          }
        }
        
        /* Force subtitle positioning using CSS custom properties */
        .video-player[style*="--subtitle-offset"] video::-webkit-media-text-track-display {
          transform: translateY(calc(-1 * var(--subtitle-offset) * 0.8)) !important;
        }
      `;

      document.head.appendChild(style);

      // Modern approach: Use CSS custom properties on the video element for better control
      video.style.setProperty('--subtitle-bottom-offset', `${bottomOffset}px`);

      // Also try to apply WebVTT cue settings for better browser compatibility
      setTimeout(() => {
        const textTracks = video.textTracks;
        for (let i = 0; i < textTracks.length; i++) {
          const track = textTracks[i];
          if (track.mode === 'showing') {
            try {
              const cues = track.cues;
              if (cues) {
                for (let j = 0; j < cues.length; j++) {
                  const cue = cues[j] as any; // Type assertion for VTTCue properties
                  if (cue && typeof cue.line !== 'undefined') {
                    // Set line position as percentage from bottom
                    cue.line = subtitleVerticalPosition;
                    cue.position = 50; // Center horizontally
                    cue.align = 'center';
                  }
                }
              }
            } catch (e) {
              console.log("Could not set cue positions directly:", e);
            }
          }
        }
      }, 1000);
    }
  }, [subtitleFontSize, subtitleColor, subtitleBackgroundColor, subtitleBackgroundOpacity, subtitleVerticalPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      // Clean up subtitle blob URLs
      const video = videoRef.current;
      if (video && (video as any).__subtitleCleanup) {
        (video as any).__subtitleCleanup();
      }
    };
  }, []);

  const handleControlsVisibility = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, isMobile ? 5000 : 3000); // Longer timeout on mobile
  };

  // Touch handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    handleControlsVisibility();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTouchTime;

    // Double tap to play/pause (mobile-friendly)
    if (timeDiff < 300) {
      e.preventDefault();
      togglePlayPause(null);
    }

    setLastTouchTime(currentTime);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // Swipe gestures
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - skip forward
        skipTime(10);
      } else {
        // Swipe left - skip backward
        skipTime(-10);
      }
    }

    // Vertical swipe for volume (disabled to prevent conflicts with page scrolling)
    // Users can use the volume slider instead
  };

  const togglePlayPause = (e: any) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play().catch((err) => {
          console.error("Play failed:", err);
          setError("Failed to play video");
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);

      // Update buffered progress
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (video) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      if (isMuted) {
        video.volume = volume;
        setIsMuted(false);
      } else {
        video.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const changeSource = (sourceIndex: number) => {
    if (sourceIndex >= 0 && sourceIndex < availableSources.length) {
      setSelectedSourceIndex(sourceIndex);
      setError(null);
    }
  };

  const changeHlsQuality = (qualityLevel: number) => {
    console.log("Changing HLS quality to level:", qualityLevel);
    setSelectedHlsQuality(qualityLevel);

    // Apply the quality change immediately if HLS is active
    if (hlsRef.current && hlsRef.current.levels.length > 0) {
      hlsRef.current.currentLevel = qualityLevel; // -1 for auto, otherwise specific level
      console.log("HLS quality changed to:", qualityLevel === -1 ? 'Auto' : hlsQualityLevels[qualityLevel]?.name);
    }
  };

  const changeSubtitle = (subtitleIndex: number) => {
    console.log("Changing subtitle to index:", subtitleIndex);
    setSelectedSubtitleIndex(subtitleIndex);
    if (subtitleIndex >= 0 && subtitles[subtitleIndex]) {
      setSelectedSubtitleLang(subtitles[subtitleIndex].lang);
    } else {
      setSelectedSubtitleLang('off');
    }

    // Log available subtitles for debugging
    console.log("Available subtitles:", subtitles);
    console.log("Selected subtitle:", subtitleIndex >= 0 ? subtitles[subtitleIndex] : "None");
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
    }
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (video && duration > 0) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Skip intro/outro functionality
  const skipIntro = () => {
    if (intro && videoRef.current) {
      videoRef.current.currentTime = intro.end;
    }
  };

  const skipOutro = () => {
    if (outro && videoRef.current && duration > 0) {
      // Skip to the end of the outro, or 10 seconds before the video ends if outro goes to the very end
      const targetTime = Math.min(outro.end + 5, duration - 5);
      videoRef.current.currentTime = targetTime;
    }
  };

  // Check if we're in intro or outro range
  const isInIntro = intro && currentTime >= intro.start && currentTime <= intro.end;
  const isInOutro = outro && currentTime >= outro.start && currentTime <= outro.end;

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Close dropdowns when clicking outside - modified to ignore modal clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't close settings modal if clicking inside modal contents
      if (showSettings && (target.closest(".video-settings-modal") || target.closest(".settings-menu"))) {
        return; // Ignore clicks inside modal or settings menu
      }
      
      // Otherwise close settings
      if (showSettings) {
        setShowSettings(false);
        setSettingsTab('main');
        setShowSubtitleSettings(false);
      }
      
      // Close mobile volume slider when clicking outside
      if (!target.closest(".group\\/volume") && !target.closest("[data-volume-slider]")) {
        setShowMobileVolumeSlider(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettings]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlayPause(null);
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skipTime(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skipTime(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((prev: number) => Math.min(1, prev + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((prev: number) => Math.max(0, prev - 0.1));
          break;
        case "KeyI": // Skip intro
          e.preventDefault();
          skipIntro();
          break;
        case "KeyO": // Skip outro
          e.preventDefault();
          skipOutro();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  if (!currentSource) {
    return (
      <div className="aspect-video bg-neutral-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>No video sources available</p>
          {/* Debug info */}
          <div className="mt-4 text-xs text-neutral-400">
            <p>Debug Info:</p>
            <p>Sources: {currentSources.length}</p>
            <p>Failed Sources: {failedSources.size}</p>
            <p>Available Sources: {availableSources.length}</p>
            <p>Subtitles: {subtitles?.length || 0}</p>
          </div>
        </div>
      </div>
    );
  }

  // Add body class when settings modal is open
  useEffect(() => {
    if (showSettings && isMobile) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showSettings, isMobile]);

  return (
    <>
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      <div
        ref={containerRef}
        className={`relative w-full bg-black group cursor-pointer ${isMobile
            ? 'h-[60vh] min-h-[300px] mobile-video-player'
            : 'h-[90vh]'
          }`}
        onMouseMove={!isMobile ? handleControlsVisibility : undefined}
        onMouseLeave={!isMobile ? () => isPlaying && setShowControls(false) : undefined}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        dir="ltr"
      >
        {/* Single Video Element */}
        <video
          ref={videoRef}
          poster={poster}
          className="w-full h-full video-player"
          preload="metadata"
          controls={false}
          playsInline={true} // Important for mobile
          webkit-playsinline="true" // iOS compatibility
        />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <div className="text-red-400 mb-4">⚠️</div>
              <p className="text-lg mb-2">Playback Error</p>
              <p className="text-sm text-neutral-400 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  if (currentSource) loadSource(currentSource);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Controls overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
          onClick={togglePlayPause}
        >
          {/* Center play button */}
          {!isPlaying && !isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={togglePlayPause}
                className={`bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center backdrop-blur-sm transition-all pointer-events-auto ${isMobile ? 'w-16 h-16' : 'w-20 h-20'
                  }`}
              >
                <Play className={`text-white ml-1 ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
              </button>
            </div>
          )}

          {/* Mobile touch hints */}
          {isMobile && showControls && (
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs opacity-80">
                Double tap to play/pause
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs opacity-80">
                Swipe left/right to skip
              </div>
            </div>
          )}

          {/* Mobile center tap area for play/pause */}
          {isMobile && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-auto"
              style={{ pointerEvents: showControls ? 'auto' : 'none' }}
              onTouchEnd={(e) => {
                // Only handle tap if not over controls
                const target = e.target as Element;
                if (target === e.currentTarget) {
                  handleTouchEnd(e);
                }
              }}
            />
          )}

          {/* Bottom controls */}
          <div className={`absolute bottom-0 left-0 right-0 space-y-2 ${isMobile ? 'p-3' : 'p-4 space-y-3'}`} onClick={(e) => e.stopPropagation()}>
            {/* Progress bar */}
            <div className={`flex items-center text-white ${isMobile ? 'gap-2 text-xs' : 'gap-3 text-sm'}`}>
              <span className={isMobile ? "min-w-[50px] text-xs" : "min-w-[60px]"}>{formatTime(currentTime)}</span>
              <div className={`flex-1 relative bg-white/20 rounded-full overflow-hidden cursor-pointer ${isMobile ? 'h-3' : 'h-2'}`} onClick={handleSeek}>
                {/* Buffered progress */}
                <div className="absolute top-0 left-0 h-full bg-white/40 transition-all duration-300" style={{ width: `${buffered}%` }} />

                {/* Intro highlight */}
                {intro && duration > 0 && (
                  <div
                    className="absolute top-0 h-full bg-yellow-400/60 rounded-full"
                    style={{
                      left: `${(intro.start / duration) * 100}%`,
                      width: `${((intro.end - intro.start) / duration) * 100}%`,
                    }}
                  />
                )}

                {/* Outro highlight */}
                {outro && duration > 0 && (
                  <div
                    className="absolute top-0 h-full bg-yellow-400/60 rounded-full"
                    style={{
                      left: `${(outro.start / duration) * 100}%`,
                      width: `${((outro.end - outro.start) / duration) * 100}%`,
                    }}
                  />
                )}

                {/* Current progress */}
                <div
                  className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-150"
                  style={{
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
                {/* Progress thumb */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 bg-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity ${isMobile ? 'w-5 h-5' : 'w-4 h-4'
                    }`}
                  style={{
                    left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    marginLeft: isMobile ? "-10px" : "-8px",
                  }}
                />
              </div>
              <span className={isMobile ? "min-w-[50px] text-xs" : "min-w-[60px]"}>{formatTime(duration)}</span>
            </div>

            {/* Control buttons */}
            <div className={`flex items-center justify-between ${isMobile ? 'gap-1' : ''}`}>
              <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-3'}`}>
                {/* Previous button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevious?.();
                  }}
                  disabled={!hasPrevious}
                  className={`rounded-lg transition-colors ${isMobile ? 'p-1.5' : 'p-2'} ${hasPrevious ? "text-white hover:bg-white/20" : "text-neutral-600 cursor-not-allowed"
                    }`}
                  title="Previous Episode"
                >
                  <SkipBack className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause(e);
                  }}
                  className={`bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors ${isMobile ? 'w-8 h-8' : 'w-10 h-10'
                    }`}
                >
                  {isPlaying ? (
                    <Pause className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  ) : (
                    <Play className={`text-white ${isMobile ? 'w-4 h-4 ml-0.5' : 'w-5 h-5 ml-0.5'}`} />
                  )}
                </button>

                {/* Next button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext?.();
                  }}
                  disabled={!hasNext}
                  className={`rounded-lg transition-colors ${isMobile ? 'p-1.5' : 'p-2'} ${hasNext ? "text-white hover:bg-white/20" : "text-neutral-600 cursor-not-allowed"
                    }`}
                  title="Next Episode"
                >
                  <SkipForward className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                </button>

                {/* Skip intro button */}
                {isInIntro && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      skipIntro();
                    }}
                    className={`flex items-center gap-1 rounded-lg bg-blue-600/80 text-white hover:bg-blue-600 transition-all ${isMobile ? 'px-1.5 py-1 text-xs' : 'px-2 py-1 text-xs'
                      }`}
                  >
                    <span>Skip Intro</span>
                  </button>
                )}

                {/* Skip outro button */}
                {isInOutro && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      skipOutro();
                    }}
                    className={`flex items-center gap-1 rounded-lg bg-green-600/80 text-white hover:bg-green-600 transition-all ${isMobile ? 'px-1.5 py-1 text-xs' : 'px-2 py-1 text-xs'
                      }`}
                  >
                    <span>Skip Outro</span>
                  </button>
                )}

                {/* Skip buttons - Hide on very small mobile screens */}
                {!isMobile && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        skipTime(-10);
                      }}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      title="Skip back 10s"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        skipTime(10);
                      }}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      title="Skip forward 10s"
                    >
                      <RotateCcw className="w-5 h-5 scale-x-[-1]" />
                    </button>
                  </>
                )}

                {/* Volume - Always show button, hide slider on mobile */}
                <div className="flex items-center gap-2 group/volume">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isMobile) {
                        setShowMobileVolumeSlider(!showMobileVolumeSlider);
                      } else {
                        toggleMute();
                      }
                    }}
                    className={`text-white hover:bg-white/20 rounded-lg transition-colors ${isMobile ? 'p-1.5' : 'p-2'}`}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                    ) : (
                      <Volume2 className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                    )}
                  </button>
                  {!isMobile && (
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 h-1 bg-white/30 rounded-full appearance-none opacity-0 group-hover/volume:opacity-100 transition-opacity [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                  )}

                  {/* Mobile Volume Slider */}
                  {isMobile && showMobileVolumeSlider && (
                    <div
                      className="absolute bottom-full left-0 mb-2 bg-black/90 backdrop-blur-xl rounded-lg border border-white/20 p-3 min-w-[150px]"
                      data-volume-slider
                    >
                      <div className="flex items-center gap-2">
                        <VolumeX className="w-3 h-3 text-gray-400" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 h-2 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                        />
                        <Volume2 className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className="text-center text-xs text-gray-400 mt-1">
                        {Math.round(volume * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
                {/* Settings */}
                <div className="relative settings-menu">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSettings(!showSettings);
                      setSettingsTab('main');
                    }}
                    className={`text-white hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center ${isMobile ? 'p-1.5' : 'p-2'
                      } ${showSettings ? 'bg-white/20' : ''}`}
                  >
                    <Settings className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                  </button>

                  {showSettings && !isMobile && (
                    <div
                      className="video-settings-modal absolute bottom-full right-0 mb-2 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[320px] max-w-[420px] transform transition-all duration-300 animate-fade-in-up"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent event bubbling
                        e.preventDefault(); // Prevent any default behaviors
                      }}
                      style={{
                        background: 'rgba(10, 10, 10, 0.75)',
                        backdropFilter: 'blur(24px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 0 rgba(255, 255, 255, 0.05) inset, 0 0 15px 0 rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)'
                      }}
                    >
                      {/* Header with Glossy Effect */}
                      <div
                        className="flex items-center justify-between border-b border-white/10 p-4"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
                        }}
                      >
                        <h3 className="text-white font-semibold flex items-center gap-2 text-lg">
                          <Settings className="w-5 h-5" />
                          Player Settings
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSettings(false);
                          }}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Settings Content */}
                      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar prevent-scroll-propagation" onClick={(e) => e.stopPropagation()}>
                        {settingsTab === 'main' && (
                          <div className="space-y-3">
                            {/* Quality Section - Always show, even with single source */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-white text-sm font-medium">
                                <Monitor className="w-4 h-4" />
                                Video Quality ({availableSources.length} sources{hlsQualityLevels.length > 0 ? `, ${hlsQualityLevels.length + 1} HLS levels` : ''})
                              </div>
                              <div
                                className="rounded-lg p-3 space-y-3"
                                style={{
                                  background: 'rgba(10, 10, 10, 0.6)',
                                  backdropFilter: 'blur(8px) saturate(150%)',
                                  WebkitBackdropFilter: 'blur(8px) saturate(150%)',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
                                }}
                              >
                                {/* Video Sources */}
                                {availableSources.length > 0 ? (
                                  <div className="space-y-2">
                                    <div className="text-xs text-gray-400 font-medium">Video Sources:</div>
                                    {availableSources.map((source: SnEpisodeSource, index: number) => (
                                      <button
                                        key={index}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          changeSource(index);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedSourceIndex === index
                                            ? "bg-red-600/90 text-white shadow-lg transform scale-[1.02] border border-red-400/50"
                                            : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
                                          }`}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {getQualityName(source, index)}
                                          </span>
                                          <span className="text-xs opacity-60">
                                            {source.isM3U8 ? 'HLS Stream' : 'Direct Video'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {selectedSourceIndex === index && (
                                            <span className="text-xs bg-red-500/30 text-red-200 px-2 py-1 rounded-full">
                                              Active
                                            </span>
                                          )}
                                          <span className="text-xs opacity-75 px-2 py-1 rounded-full bg-black/30">
                                            {source.isM3U8 ? 'HLS' : 'MP4'}
                                          </span>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-sm py-2 px-3">
                                    No video sources available
                                  </div>
                                )}

                                {/* HLS Quality Levels (only show if current source is HLS and has quality levels) */}
                                {hlsQualityLevels.length > 0 && currentSource && isHLSStream(currentSource) && (
                                  <div className="space-y-2 border-t border-white/10 pt-3">
                                    <div className="text-xs text-gray-400 font-medium">HLS Quality Levels:</div>
                                    <div className="space-y-1">
                                      {/* Auto Quality Option */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          changeHlsQuality(-1);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedHlsQuality === -1
                                            ? "bg-blue-600/90 text-white shadow-lg border border-blue-400/50"
                                            : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
                                          }`}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">Auto</span>
                                          <span className="text-xs opacity-60">Adaptive quality</span>
                                        </div>
                                        {selectedHlsQuality === -1 && (
                                          <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">
                                            Active
                                          </span>
                                        )}
                                      </button>

                                      {/* Individual Quality Levels */}
                                      {hlsQualityLevels.map((level, index) => (
                                        <button
                                          key={level.level}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            changeHlsQuality(level.level);
                                          }}
                                          className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedHlsQuality === level.level
                                              ? "bg-blue-600/90 text-white shadow-lg border border-blue-400/50"
                                              : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
                                            }`}
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">{level.name}</span>
                                            <span className="text-xs opacity-60">
                                              {level.width}x{level.height} • {Math.round(level.bitrate / 1000)}kbps
                                            </span>
                                          </div>
                                          {selectedHlsQuality === level.level && (
                                            <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">
                                              Active
                                            </span>
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Subtitles Section */}
                        {subtitles && subtitles.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white text-sm font-medium">
                              <Type className="w-4 h-4" />
                              Subtitles ({subtitles.length} available)
                            </div>
                            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 space-y-2 border border-white/10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  changeSubtitle(-1);
                                }} className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${selectedSubtitleIndex === -1
                                    ? "bg-red-600/90 text-white shadow-lg transform scale-[1.02] border border-red-400/50"
                                    : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent hover:shadow-md"
                                  }`}
                              >
                                <span className="font-medium">Off</span>
                              </button>
                              {subtitles.map((subtitle: SnEpisodeSubtitle, index: number) => (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeSubtitle(index);
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${selectedSubtitleIndex === index
                                      ? "bg-red-600/90 text-white shadow-lg transform scale-[1.02] border border-red-400/50"
                                      : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
                                    }`}
                                >
                                  <span className="font-medium">{subtitle.lang}</span>
                                </button>
                              ))}

                              {selectedSubtitleIndex !== -1 && (
                                <div className="border-t border-white/20 pt-2 mt-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSettingsTab('subtitle-style');
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 border border-transparent hover:border-white/20"
                                  >
                                    <Palette className="w-4 h-4" />
                                    Customize Style
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Playback Speed Section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-white text-sm font-medium">
                            <RotateCcw className="w-4 h-4" />
                            Playback Speed
                          </div>
                          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                            <div className="grid grid-cols-3 gap-2">
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                <button
                                  key={speed}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changePlaybackSpeed(speed);
                                  }}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${playbackSpeed === speed
                                      ? "bg-red-600/90 text-white shadow-lg transform scale-[1.05] border-red-400/50"
                                      : "text-gray-300 hover:bg-white/10 hover:text-white border-transparent hover:border-white/20"
                                    }`}
                                >
                                  {speed === 1 ? "Normal" : `${speed}x`}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Subtitle Style Tab */}
                      {settingsTab === 'subtitle-style' && (
                        <div className="space-y-4">
                          {/* Back Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSettingsTab('main');
                            }}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                          >
                            ← Back to Settings
                          </button>

                          <div className="flex items-center gap-2 text-white text-sm font-medium">
                            <Palette className="w-4 h-4" />
                            Subtitle Style
                          </div>

                          {/* Font Size */}
                          <div className="space-y-2">
                            <label className="text-gray-300 text-sm flex items-center justify-between">
                              <span>Font Size</span>
                              <span className="text-white font-medium">{subtitleFontSize}px</span>
                            </label>
                            <input
                              type="range"
                              min="12"
                              max="32"
                              value={subtitleFontSize}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSubtitleFontSize(parseInt(e.target.value));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                                [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:bg-red-400"
                            />
                          </div>

                          {/* Vertical Position */}
                          <div className="space-y-2">
                            <label className="text-gray-300 text-sm flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Move className="w-4 h-4" />
                                Vertical Position
                              </span>
                              <span className="text-white font-medium">{subtitleVerticalPosition}%</span>
                            </label>
                            <input
                              type="range"
                              min="60"
                              max="95"
                              value={subtitleVerticalPosition}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSubtitleVerticalPosition(parseInt(e.target.value));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                                [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:bg-red-400"
                            />
                            <div className="text-xs text-gray-400">Move subtitles up or down on the video</div>
                          </div>

                          {/* Text Color */}
                          <div className="space-y-2">
                            <label className="text-gray-300 text-sm">Text Color</label>
                            <div className="grid grid-cols-6 gap-2">
                              {[
                                { color: '#ffffff', name: 'White' },
                                { color: '#ffff00', name: 'Yellow' },
                                { color: '#ff0000', name: 'Red' },
                                { color: '#00ff00', name: 'Green' },
                                { color: '#0080ff', name: 'Blue' },
                                { color: '#ff8000', name: 'Orange' }
                              ].map(({ color, name }) => (
                                <button
                                  key={color}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSubtitleColor(color);
                                  }}
                                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${subtitleColor === color
                                      ? 'border-white scale-110 shadow-lg'
                                      : 'border-gray-600 hover:border-gray-400 hover:scale-105'
                                    }`}
                                  style={{ backgroundColor: color }}
                                  title={name}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Background Color */}
                          <div className="space-y-2">
                            <label className="text-gray-300 text-sm">Background Color</label>
                            <div className="grid grid-cols-6 gap-2">
                              {[
                                { color: '#000000', name: 'Black' },
                                { color: '#404040', name: 'Gray' },
                                { color: '#800000', name: 'Dark Red' },
                                { color: '#008000', name: 'Dark Green' },
                                { color: '#000080', name: 'Dark Blue' },
                                { color: '#800080', name: 'Purple' }
                              ].map(({ color, name }) => (
                                <button
                                  key={color}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSubtitleBackgroundColor(color);
                                  }}
                                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${subtitleBackgroundColor === color
                                      ? 'border-white scale-110 shadow-lg'
                                      : 'border-gray-600 hover:border-gray-400 hover:scale-105'
                                    }`}
                                  style={{ backgroundColor: color }}
                                  title={name}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Background Opacity */}
                          <div className="space-y-2">
                            <label className="text-gray-300 text-sm flex items-center justify-between">
                              <span>Background Opacity</span>
                              <span className="text-white font-medium">{Math.round(subtitleBackgroundOpacity * 100)}%</span>
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={subtitleBackgroundOpacity}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSubtitleBackgroundOpacity(parseFloat(e.target.value));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                                [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:bg-red-400"
                            />
                          </div>

                          {/* Preview */}
                          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="text-xs text-gray-400 mb-2">Preview:</div>
                            <div
                              className="text-center py-2 px-4 rounded"
                              style={{
                                fontSize: `${getResponsiveSubtitleFontSize()}px`,
                                color: subtitleColor,
                                backgroundColor: `${subtitleBackgroundColor}${Math.round(subtitleBackgroundOpacity * 255).toString(16).padStart(2, '0')}`,
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                                fontFamily: 'Arial, sans-serif',
                                fontWeight: 'bold',
                                lineHeight: 1.2
                              }}
                            >
                              Sample subtitle text
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className={`text-white hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center ${isMobile ? 'p-1.5' : 'p-2'}`}
              >
                {isFullscreen ? (
                  <Minimize className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                ) : (
                  <Maximize className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Settings Modal */}
      {isMobile && showSettings && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center prevent-scroll-propagation"
          onClick={(e) => {
            // Only close when clicking directly on the backdrop, not child elements
            if (e.target === e.currentTarget) {
              setShowSettings(false);
            }
          }}
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)'
          }}
        >
          {/* Modal Container with Acrylic Effect */}
          <div
            className="video-settings-modal w-[85%] max-w-sm max-h-[80vh] overflow-hidden m-auto rounded-xl shadow-2xl transform transition-all duration-300 animate-fade-in-up"
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling to the backdrop
              e.preventDefault(); // Prevent any default behaviors
            }}
            style={{
              background: 'rgba(10, 10, 10, 0.75)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 0 rgba(255, 255, 255, 0.05) inset, 0 0 15px 0 rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              transform: 'translateY(-10px)' // Shift it slightly up for better visual balance
            }}
          >
            {/* Modal Header with Glossy Effect */}
            <div
              className="flex items-center justify-between p-4 border-b border-white/10"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
              }}
            >
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Player Settings
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(false);
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content with Scrolling */}
            <div 
              className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar prevent-scroll-propagation"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}>
              {settingsTab === 'main' && (
                <div className="space-y-3">
                  {/* Quality Section - Always show, even with single source */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <Monitor className="w-4 h-4" />
                      Video Quality ({availableSources.length} sources{hlsQualityLevels.length > 0 ? `, ${hlsQualityLevels.length + 1} HLS levels` : ''})
                    </div>
                    <div
                      className="rounded-lg p-3 space-y-3"
                      style={{
                        background: 'rgba(10, 10, 10, 0.6)',
                        backdropFilter: 'blur(8px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(8px) saturate(150%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
                      }}
                    >
                      {/* Video Sources */}
                      {availableSources.length > 0 ? (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 font-medium">Video Sources:</div>
                          {availableSources.map((source: SnEpisodeSource, index: number) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                changeSource(index);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedSourceIndex === index
                                  ? "bg-red-600/90 text-white shadow-lg transform scale-[1.02] border border-red-400/50"
                                  : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
                                }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {getQualityName(source, index)}
                                </span>
                                <span className="text-xs opacity-60">
                                  {source.isM3U8 ? 'HLS Stream' : 'Direct Video'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {selectedSourceIndex === index && (
                                  <span className="text-xs bg-red-500/30 text-red-200 px-2 py-1 rounded-full">
                                    Active
                                  </span>
                                )}
                                <span className="text-xs opacity-75 px-2 py-1 rounded-full bg-black/30">
                                  {source.isM3U8 ? 'HLS' : 'MP4'}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm py-2 px-3">
                          No video sources available
                        </div>
                      )}

                      {/* HLS Quality Levels */}
                      {hlsQualityLevels.length > 0 && currentSource && isHLSStream(currentSource) && (
                        <div className="space-y-2 border-t border-white/10 pt-3">
                          <div className="text-xs text-gray-400 font-medium">HLS Quality Levels:</div>
                          <div className="space-y-1">
                            {/* Auto Quality Option */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                changeHlsQuality(-1);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedHlsQuality === -1
                                  ? "bg-blue-600/90 text-white shadow-lg border border-blue-400/50"
                                  : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent hover:shadow-md"
                                }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">Auto</span>
                                <span className="text-xs opacity-60">Adaptive quality</span>
                              </div>
                              {selectedHlsQuality === -1 && (
                                <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">
                                  Active
                                </span>
                              )}
                            </button>

                            {/* Individual Quality Levels */}
                            {hlsQualityLevels.map((level, index) => (
                              <button
                                key={level.level}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  changeHlsQuality(level.level);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedHlsQuality === level.level
                                    ? "bg-blue-600/90 text-white shadow-lg border border-blue-400/50"
                                    : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent hover:shadow-md"
                                  }`}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{level.name}</span>
                                  <span className="text-xs opacity-60">
                                    {level.width}x{level.height} • {Math.round(level.bitrate / 1000)}kbps
                                  </span>
                                </div>
                                {selectedHlsQuality === level.level && (
                                  <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">
                                    Active
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtitles Section */}
                  {subtitles && subtitles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white text-sm font-medium">
                        <Type className="w-4 h-4" />
                        Subtitles ({subtitles.length} available)
                      </div>
                      <div
                        className="rounded-lg p-3 space-y-2"
                        style={{
                          background: 'rgba(10, 10, 10, 0.6)',
                          backdropFilter: 'blur(8px) saturate(150%)',
                          WebkitBackdropFilter: 'blur(8px) saturate(150%)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            changeSubtitle(-1);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${selectedSubtitleIndex === -1
                              ? "bg-red-600/90 text-white shadow-lg transform scale-[1.02] border border-red-400/50"
                              : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent hover:shadow-md"
                            }`}
                        >
                          <span className="font-medium">Off</span>
                        </button>
                        {subtitles.map((subtitle: SnEpisodeSubtitle, index: number) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              changeSubtitle(index);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${selectedSubtitleIndex === index
                                ? "bg-red-600/90 text-white shadow-lg transform scale-[1.02] border border-red-400/50"
                                : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent hover:shadow-md"
                              }`}
                          >
                            <span className="font-medium">{subtitle.lang}</span>
                          </button>
                        ))}

                        {selectedSubtitleIndex !== -1 && (
                          <div className="border-t border-white/10 pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSettingsTab('subtitle-style');
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 hover:shadow-md"
                            >
                              <Palette className="w-4 h-4" />
                              Customize Style
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Playback Speed Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <RotateCcw className="w-4 h-4" />
                      Playback Speed
                    </div>
                    <div
                      className="rounded-lg p-3"
                      style={{
                        background: 'rgba(10, 10, 10, 0.6)',
                        backdropFilter: 'blur(8px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(8px) saturate(150%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
                      }}
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                          <button
                            key={speed}
                            onClick={(e) => {
                              e.stopPropagation();
                              changePlaybackSpeed(speed);
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${playbackSpeed === speed
                                ? "bg-red-600/90 text-white shadow-lg transform scale-[1.05] border border-red-400/50"
                                : "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent hover:shadow-md"
                              }`}
                          >
                            {speed === 1 ? "Normal" : `${speed}x`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Subtitle Style Tab */}
              {settingsTab === 'subtitle-style' && (
                <div className="space-y-4">
                  {/* Back Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSettingsTab('main');
                    }}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-all text-sm px-3 py-2 rounded-lg hover:bg-white/5 hover:shadow-md"
                  >
                    ← Back to Settings
                  </button>

                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <Palette className="w-4 h-4" />
                    Subtitle Style
                  </div>

                  {/* Font Size */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm flex items-center justify-between">
                      <span>Font Size</span>
                      <span className="text-white font-medium">{subtitleFontSize}px</span>
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="32"
                      value={subtitleFontSize}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSubtitleFontSize(parseInt(e.target.value));
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full acrylic-slider"
                    />
                  </div>

                  {/* Vertical Position */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Move className="w-4 h-4" />
                        Vertical Position
                      </span>
                      <span className="text-white font-medium">{subtitleVerticalPosition}%</span>
                    </label>
                    <input
                      type="range"
                      min="60"
                      max="95"
                      value={subtitleVerticalPosition}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSubtitleVerticalPosition(parseInt(e.target.value));
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full acrylic-slider"
                    />
                    <div className="text-xs text-gray-400">Move subtitles up or down on the video</div>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm">Text Color</label>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        { color: '#ffffff', name: 'White' },
                        { color: '#ffff00', name: 'Yellow' },
                        { color: '#ff0000', name: 'Red' },
                        { color: '#00ff00', name: 'Green' },
                        { color: '#0080ff', name: 'Blue' },
                        { color: '#ff8000', name: 'Orange' }
                      ].map(({ color, name }) => (
                        <button
                          key={color}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubtitleColor(color);
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${subtitleColor === color
                              ? 'border-white scale-110 shadow-lg'
                              : 'border-gray-600 hover:border-gray-300 hover:scale-105 hover:shadow-md'
                            }`}
                          style={{ backgroundColor: color }}
                          title={name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Background Color */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm">Background Color</label>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        { color: '#000000', name: 'Black' },
                        { color: '#404040', name: 'Gray' },
                        { color: '#800000', name: 'Dark Red' },
                        { color: '#008000', name: 'Dark Green' },
                        { color: '#000080', name: 'Dark Blue' },
                        { color: '#800080', name: 'Purple' }
                      ].map(({ color, name }) => (
                        <button
                          key={color}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubtitleBackgroundColor(color);
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${subtitleBackgroundColor === color
                              ? 'border-white scale-110 shadow-lg'
                              : 'border-gray-600 hover:border-gray-300 hover:scale-105 hover:shadow-md'
                            }`}
                          style={{ backgroundColor: color }}
                          title={name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Background Opacity */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm flex items-center justify-between">
                      <span>Background Opacity</span>
                      <span className="text-white font-medium">{Math.round(subtitleBackgroundOpacity * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={subtitleBackgroundOpacity}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSubtitleBackgroundOpacity(parseFloat(e.target.value));
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full acrylic-slider"
                    />
                  </div>

                  {/* Preview */}
                  <div
                    className="rounded-lg p-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.7), rgba(15, 15, 15, 0.8))',
                      backdropFilter: 'blur(10px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
                    }}
                  >
                    <div className="text-xs text-gray-400 mb-2">Preview:</div>
                    <div
                      className="text-center py-2 px-4 rounded"
                      style={{
                        fontSize: `${getResponsiveSubtitleFontSize()}px`,
                        color: subtitleColor,
                        backgroundColor: `${subtitleBackgroundColor}${Math.round(subtitleBackgroundOpacity * 255).toString(16).padStart(2, '0')}`,
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                        fontFamily: 'Arial, sans-serif',
                        fontWeight: 'bold',
                        lineHeight: 1.2
                      }}
                    >
                      Sample subtitle text
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default AdvancedVideoPlayer;
