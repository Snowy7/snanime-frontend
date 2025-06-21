"use client";
import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipBack, SkipForward, RotateCcw, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import Hls from "hls.js";

interface Server {
  id: string;
  streams: Stream[];
}

interface Stream {
  id: string;
  url: string;
  quality: string;
  type: string;
  referer?: string;
}

interface AdvancedVideoPlayerProps {
  servers: Server[];
  poster?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const AdvancedVideoPlayer: React.FC<AdvancedVideoPlayerProps> = ({ servers, poster, onNext, onPrevious, hasNext, hasPrevious }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [selectedQuality, setSelectedQuality] = useState<string>("");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [buffered, setBuffered] = useState(0);
  const [failedStreams, setFailedStreams] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get current server and its streams
  const currentServer = servers.find((s) => s.id === selectedServerId) || servers[0];
  const currentStreams = currentServer?.streams || [];

  // Sort streams by quality (highest first) and filter out failed ones
  const sortedStreams = [...currentStreams]
    .filter((stream) => !failedStreams.has(stream.url))
    .sort((a, b) => {
      const qualityOrder = { "1080p": 4, "720p": 3, "480p": 2, "360p": 1 };
      return (qualityOrder[b.quality as keyof typeof qualityOrder] || 0) - (qualityOrder[a.quality as keyof typeof qualityOrder] || 0);
    });

  // Helper function to get quality display name
  const getQualityDisplayName = (quality: string, index: number) => {
    if (!quality || quality === "undefined" || quality === "undefinedp" || quality.includes("undefined")) {
      return `Quality ${index + 1}`;
    }
    return quality;
  };

  // Initialize default server and quality
  useEffect(() => {
    if (servers.length > 0 && !selectedServerId) {
      setSelectedServerId(servers[0].id);
    }
  }, [servers, selectedServerId]);

  useEffect(() => {
    if (sortedStreams.length > 0 && !selectedQuality) {
      setSelectedQuality(sortedStreams[0].quality);
    }
  }, [sortedStreams, selectedQuality]);

  const isHLSStream = (type: string, url: string) => {
    return type === "application/x-mpegURL" || type === "application/vnd.apple.mpegurl" || type === "hls" || url.includes(".m3u8");
  };

  const currentStream = sortedStreams.find((s) => s.quality === selectedQuality) || sortedStreams[0];

  // Handle stream failure and auto-switch to next quality
  const handleStreamError = (failedUrl: string, errorMessage?: string) => {
    console.error("Stream failed:", failedUrl, errorMessage);
    setError(errorMessage || "Stream failed to load");

    // Mark this stream as failed
    setFailedStreams((prev) => {
      const newFailedStreams = new Set([...prev, failedUrl]);

      // Find next available quality (excluding the newly failed one)
      const availableStreams = sortedStreams.filter((stream) => stream.url !== failedUrl && !newFailedStreams.has(stream.url));

      if (availableStreams.length > 0) {
        console.log("Switching to next quality:", availableStreams[0].quality);
        setSelectedQuality(availableStreams[0].quality);
        setError(null);
      } else {
        // Try next server if available
        const currentServerIndex = servers.findIndex((s) => s.id === selectedServerId);
        if (currentServerIndex < servers.length - 1) {
          const nextServer = servers[currentServerIndex + 1];
          console.log("Switching to next server:", nextServer.id);
          setSelectedServerId(nextServer.id);
          setFailedStreams(new Set()); // Reset failed streams for new server
          setError(null);
        } else {
          console.error("No more streams available");
          setError("No more streams available");
        }
      }

      return newFailedStreams;
    });
  };

  // Load video stream
  const loadStream = (stream: Stream) => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setError(null);

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;
    const isHLS = isHLSStream(stream.type, stream.url);

    if (isHLS && Hls.isSupported()) {
      // Use HLS.js for HLS streams
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
      });

      hlsRef.current = hls;

      hls.loadSource(stream.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest parsed successfully");
        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Recovery failed, switching stream...");
              handleStreamError(stream.url, `Network Error: ${data.details}`);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, trying to recover...");
              try {
                hls.recoverMediaError();
              } catch (err) {
                console.log("Media recovery failed, switching stream...");
                handleStreamError(stream.url, `Media Error: ${data.details}`);
              }
              break;
            default:
              console.log("Fatal error, switching to next stream...");
              handleStreamError(stream.url, `HLS Error: ${data.type} - ${data.details}`);
              break;
          }
        } else {
          // Non-fatal errors that might indicate stream issues
          if (
            data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
            data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT ||
            data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR ||
            data.details === Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT ||
            data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR ||
            data.details === Hls.ErrorDetails.FRAG_LOAD_TIMEOUT
          ) {
            console.log("Stream load error, switching to next stream...");
            handleStreamError(stream.url, `Stream Load Error: ${data.details}`);
          }
        }
      });

      hls.on(Hls.Events.FRAG_LOAD_EMERGENCY_ABORTED, () => {
        console.log("Fragment load emergency aborted, switching stream...");
        handleStreamError(stream.url, "Fragment load failed");
      });
    } else if (isHLS && video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = stream.url;
      video.addEventListener("loadedmetadata", () => setIsLoading(false));
      video.addEventListener("error", () => handleStreamError(stream.url, "Native HLS playback failed"));
    } else if (!isHLS) {
      // Regular MP4/other formats
      video.src = stream.url;
      video.addEventListener("loadedmetadata", () => setIsLoading(false));
      video.addEventListener("error", () => handleStreamError(stream.url, "Video playback failed"));
    } else {
      handleStreamError(stream.url, "HLS not supported in this browser");
    }

    // Set video properties
    video.volume = isMuted ? 0 : volume;
    video.playbackRate = playbackSpeed;
  };

  // Load stream when current stream changes
  useEffect(() => {
    if (currentStream) {
      loadStream(currentStream);
    }
  }, [currentStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
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
    }, 3000);
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

  const changeServer = (serverId: string) => {
    const server = servers.find((s) => s.id === serverId);
    if (server && server.streams.length > 0) {
      setSelectedServerId(serverId);
      setFailedStreams(new Set()); // Reset failed streams for new server
      // Reset quality to highest available for new server
      const newSortedStreams = [...server.streams].sort((a, b) => {
        const qualityOrder = { "1080p": 4, "720p": 3, "480p": 2, "360p": 1 };
        return (qualityOrder[b.quality as keyof typeof qualityOrder] || 0) - (qualityOrder[a.quality as keyof typeof qualityOrder] || 0);
      });
      setSelectedQuality(newSortedStreams[0].quality);
      setShowServerDropdown(false);
      setError(null);
    }
  };

  const changeQuality = (quality: string) => {
    const stream = sortedStreams.find((s) => s.quality === quality);
    if (stream) {
      setSelectedQuality(quality);
      setShowQualityDropdown(false);
      setError(null);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedDropdown(false);
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

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".settings-menu")) {
        setShowSettings(false);
        setShowServerDropdown(false);
        setShowQualityDropdown(false);
        setShowSpeedDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          setVolume((prev) => Math.min(1, prev + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((prev) => Math.max(0, prev - 0.1));
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

  if (!currentStream) {
    return (
      <div className="aspect-video bg-neutral-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>No video streams available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[80vh] bg-black group cursor-pointer mt-24"
      onMouseMove={handleControlsVisibility}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      dir="ltr"
    >
      {/* Single Video Element */}
      <video ref={videoRef} poster={poster} className="w-full h-full object-contain" preload="metadata" controls={false} />

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
                if (currentStream) loadStream(currentStream);
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
        {/* Episode navigation */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm transition-all ${
              hasPrevious ? "bg-black/60 text-white hover:bg-black/80" : "bg-black/30 text-neutral-600 cursor-not-allowed"
            }`}
          >
            <SkipBack className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm transition-all ${
              hasNext ? "bg-black/60 text-white hover:bg-black/80" : "bg-black/30 text-neutral-600 cursor-not-allowed"
            }`}
          >
            <span className="text-sm hidden sm:inline">Next</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Center play button */}
        {!isPlaying && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={togglePlayPause} className="w-20 h-20 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
              <Play className="w-8 h-8 text-white ml-1" />
            </button>
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress bar */}
          <div className="flex items-center gap-3 text-white text-sm">
            <span className="min-w-[60px]">{formatTime(currentTime)}</span>
            <div className="flex-1 relative h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
              {/* Buffered progress */}
              <div className="absolute top-0 left-0 h-full bg-white/40 transition-all duration-300" style={{ width: `${buffered}%` }} />
              {/* Current progress */}
              <div
                className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-150"
                style={{
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                }}
              />
              {/* Progress thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  marginLeft: "-8px",
                }}
              />
            </div>
            <span className="min-w-[60px]">{formatTime(duration)}</span>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button onClick={togglePlayPause} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
              </button>

              {/* Skip buttons */}
              <button onClick={() => skipTime(-10)} className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors" title="Skip back 10s">
                <RotateCcw className="w-5 h-5" />
              </button>

              <button onClick={() => skipTime(10)} className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors" title="Skip forward 10s">
                <RotateCcw className="w-5 h-5 scale-x-[-1]" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-full appearance-none opacity-0 group-hover/volume:opacity-100 transition-opacity [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Settings */}
              <div className="relative settings-menu">
                <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-1 px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-[200px] z-50">
                    <div className="space-y-3">
                      {/* Server Selection */}
                      {servers.length > 1 && (
                        <div className="relative">
                          <button
                            onClick={() => {
                              setShowServerDropdown(!showServerDropdown);
                              setShowQualityDropdown(false);
                              setShowSpeedDropdown(false);
                            }}
                            className="flex items-center justify-between w-full px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                          >
                            <span className="text-sm">Server {selectedServerId}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          {showServerDropdown && (
                            <div className="absolute right-full top-0 mr-2 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-[150px] z-50">
                              <div className="space-y-1">
                                {servers.map((server) => (
                                  <button
                                    key={server.id}
                                    onClick={() => changeServer(server.id)}
                                    className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                      selectedServerId === server.id ? "bg-red-600 text-white" : "text-neutral-300 hover:bg-white/20 hover:text-white"
                                    }`}
                                  >
                                    Server {server.id}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quality Selection */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowQualityDropdown(!showQualityDropdown);
                            setShowServerDropdown(false);
                            setShowSpeedDropdown(false);
                          }}
                          className="flex items-center justify-between w-full px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <span className="text-sm">
                            {selectedQuality
                              ? getQualityDisplayName(
                                  selectedQuality,
                                  sortedStreams.findIndex((s) => s.quality === selectedQuality)
                                )
                              : "Quality"}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {showQualityDropdown && (
                          <div className="absolute right-full top-0 mr-2 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-[180px] z-50">
                            <div className="space-y-1">
                              {sortedStreams.map((stream, index) => (
                                <button
                                  key={`${stream.quality}-${stream.url}`}
                                  onClick={() => changeQuality(stream.quality)}
                                  className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    selectedQuality === stream.quality ? "bg-red-600 text-white" : "text-neutral-300 hover:bg-white/20 hover:text-white"
                                  }`}
                                >
                                  {getQualityDisplayName(stream.quality, index)} ({isHLSStream(stream.type, stream.url) ? "HLS" : "MP4"})
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Speed Selection */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowSpeedDropdown(!showSpeedDropdown);
                            setShowServerDropdown(false);
                            setShowQualityDropdown(false);
                          }}
                          className="flex items-center justify-between w-full px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <span className="text-sm">{playbackSpeed === 1 ? "Normal" : `${playbackSpeed}x`}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {showSpeedDropdown && (
                          <div className="absolute right-full top-0 mr-2 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-[120px] z-50">
                            <div className="space-y-1">
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => changePlaybackSpeed(speed)}
                                  className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    playbackSpeed === speed ? "bg-red-600 text-white" : "text-neutral-300 hover:bg-white/20 hover:text-white"
                                  }`}
                                >
                                  {speed === 1 ? "Normal" : `${speed}x`}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedVideoPlayer;
