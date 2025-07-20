import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { VideoSource, HlsQualityLevel, PlayerError } from '../types';
import { MAX_RETRIES, RETRY_DELAYS } from '../constants';

interface UseHlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  source: VideoSource | null;
  headers?: Record<string, string>;
  onError?: (error: PlayerError) => void;
  onLevelsLoaded?: (levels: HlsQualityLevel[]) => void;
  selectedQuality?: number;
}

export const useHls = ({
  videoRef,
  source,
  headers = {},
  onError,
  onLevelsLoaded,
  selectedQuality = -1,
}: UseHlsProps) => {
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fragmentRetryCountRef = useRef<Record<string, number>>({});
  const directLoadAttemptedRef = useRef<boolean>(false);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    fragmentRetryCountRef.current = {};
    directLoadAttemptedRef.current = false;
    setRetryCount(0);
    setIsLoading(false);
  }, []);

  // Helper function to try loading MP4 directly
  const tryDirectLoad = useCallback((video: HTMLVideoElement, sourceUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('Direct MP4 load timed out after 30 seconds');
        cleanup();
        resolve(false);
      }, 30000); // 30 second timeout for direct load attempt

      const cleanup = () => {
        clearTimeout(timeout);
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
        video.removeEventListener('loadstart', onLoadStart);
        video.removeEventListener('loadeddata', onLoadedData);
      };

      const onCanPlay = () => {
        console.log('Direct MP4 load successful - canplay event fired');
        cleanup();
        resolve(true);
      };

      const onLoadedData = () => {
        console.log('Direct MP4 load successful - loadeddata event fired');
        cleanup();
        resolve(true);
      };

      const onError = (event: Event) => {
        const target = event.target as HTMLVideoElement;
        const error = target.error;
        console.log('Direct MP4 load failed:', {
          code: error?.code,
          message: error?.message,
          networkState: target.networkState,
          readyState: target.readyState,
          src: target.src
        });
        
        // Log specific error codes
        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              console.log('Error: Media loading aborted');
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              console.log('Error: Network error while loading media');
              break;
            case MediaError.MEDIA_ERR_DECODE:
              console.log('Error: Media decode error');
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              console.log('Error: Media source not supported');
              break;
            default:
              console.log('Error: Unknown media error');
          }
        }
        
        cleanup();
        resolve(false);
      };

      const onLoadStart = () => {
        console.log('Direct MP4 load started for:', sourceUrl);
      };

      video.addEventListener('canplay', onCanPlay, { once: true });
      video.addEventListener('loadeddata', onLoadedData, { once: true });
      video.addEventListener('error', onError, { once: true });
      video.addEventListener('loadstart', onLoadStart, { once: true });
      
      // For direct load attempts, never set crossOrigin to avoid CORS issues
      // The proxy will handle headers and CORS
      console.log('Skipping crossOrigin setting for direct load attempt');
      if (video.crossOrigin) {
        video.removeAttribute('crossOrigin');
      }

      // For URLs with tokens or query parameters, they might be more likely to have CORS issues
      const hasQueryParams = sourceUrl.includes('?');
      const hasToken = sourceUrl.includes('token=');
      
      if (hasQueryParams || hasToken) {
        console.log('URL has query parameters/token, direct load might fail due to CORS/referer checks');
      }

      // Try to load directly
      console.log('Attempting direct load for URL:', sourceUrl);
      video.src = sourceUrl;
    });
  }, []);

  // Helper function to load via proxy
  const loadViaProxy = useCallback((video: HTMLVideoElement, sourceUrl: string, isM3U8: boolean) => {
    const apiBase = process.env.NEXT_PUBLIC_SNANIME_API_URL || 'http://localhost:5000/api/v1';
    
    // Clean the source URL - remove trailing &? if present
    const cleanedUrl = sourceUrl.replace(/&\?$/, '').replace(/\?$/, '');
    console.log('Original URL:', sourceUrl);
    console.log('Cleaned URL:', cleanedUrl);
    
    const encodedUrl = encodeURIComponent(cleanedUrl);

    // Encode headers
    const sourceHeaders = source?.headers || {};
    const combinedHeaders = { ...headers, ...sourceHeaders };
    const encodedHeaders = encodeURIComponent(JSON.stringify(combinedHeaders));

    const proxyUrl = `${apiBase}/proxy/${isM3U8 ? 'm3u8' : 'stream'}?url=${encodedUrl}&headers=${encodedHeaders}&baseUrl=${source?.server}`;

    console.log(`Loading via proxy: ${proxyUrl}`);

    if (isM3U8 && Hls.isSupported()) {
      // HLS via proxy
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        startLevel: -1,
        capLevelToPlayerSize: true,
        debug: false,
      });

      hlsRef.current = hls;

      // HLS event handlers
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('HLS manifest parsed, levels:', data.levels);
        if (onLevelsLoaded) {
          // Map HLS levels to our HlsQualityLevel interface
          const qualityLevels: HlsQualityLevel[] = data.levels.map((level, index) => ({
            level: index,
            height: level.height || 0,
            width: level.width || 0,
            bitrate: level.bitrate || 0,
            name: level.height ? `${level.height}p` : `Level ${index}`,
          }));
          onLevelsLoaded(qualityLevels);
        }
        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        
        const error: PlayerError = {
          type: 'hls',
          message: data.details || 'HLS playback error',
          details: data,
          fatal: data.fatal || false,
          retry: true,
        };

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              error.message = 'Network error occurred';
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              error.message = 'Media error occurred';
              try {
                hls.recoverMediaError();
                return;
              } catch (e) {
                error.message = 'Failed to recover from media error';
              }
              break;
            default:
              error.message = 'Fatal HLS error occurred';
              break;
          }
        }

        if (onError) {
          onError(error);
        }
      });

      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        console.log('Level loaded:', data.level);
        setIsLoading(false);
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        const fragId = data.frag.url;
        if (fragId in fragmentRetryCountRef.current) {
          delete fragmentRetryCountRef.current[fragId];
        }
      });

      hls.loadSource(proxyUrl);
      hls.attachMedia(video);
    } else {
      // MP4 via proxy
      const handleCanPlay = () => {
        setIsLoading(false);
      };

      const handleError = () => {
        if (onError) {
          onError({
            type: 'media',
            message: 'Failed to load video via proxy',
            details: null,
            fatal: true,
            retry: false,
          });
        }
      };

      video.addEventListener('canplay', handleCanPlay, { once: true });
      video.addEventListener('error', handleError, { once: true });
      video.src = proxyUrl;
    }
  }, [headers, onError, onLevelsLoaded]);

  // Load source effect
  useEffect(() => {
    if (!source || !videoRef.current) {
      destroyHls();
      return;
    }

    const video = videoRef.current;
    setIsLoading(true);
    directLoadAttemptedRef.current = false;

    if (source.isM3U8 && Hls.isSupported()) {
      console.log('Loading HLS source via proxy:', source.url);
      loadViaProxy(video, source.url, true);
    } else {
      // For MP4 videos, check if we should try direct load first
      const hasCustomHeaders = Object.keys(headers).length > 0;
      const hasToken = source.url.includes('token=');
      
      // Skip direct load if we have custom headers or tokens, as these usually require proxy
      if (hasCustomHeaders || hasToken) {
        console.log('Skipping direct load due to custom headers or tokens, using proxy directly');
        loadViaProxy(video, source.url, false);
      } else {
        console.log('Attempting direct load for MP4:', source.url);
        directLoadAttemptedRef.current = true;
        
        // Clean the URL for direct load attempt
        const cleanedUrl = source.url.replace(/&\?$/, '').replace(/\?$/, '');
        
        tryDirectLoad(video, cleanedUrl)
          .then((success) => {
            if (success) {
              setIsLoading(false);
              console.log('Direct MP4 load successful');
            } else {
              console.log('Direct MP4 load failed, falling back to proxy');
              loadViaProxy(video, source.url, false);
            }
          })
          .catch((error) => {
            console.error('Error during direct load attempt:', error);
            loadViaProxy(video, source.url, false);
          });
      }
    }

    return () => {
      destroyHls();
    };
  }, [source?.url, JSON.stringify(headers), onError, onLevelsLoaded, selectedQuality, tryDirectLoad, loadViaProxy]); // Stabilize dependencies

  // Update quality when selection changes
  useEffect(() => {
    if (hlsRef.current && selectedQuality >= -1) {
      hlsRef.current.currentLevel = selectedQuality;
      console.log(`HLS quality changed to: ${selectedQuality === -1 ? 'Auto' : selectedQuality}`);
    }
  }, [selectedQuality]);

  return {
    hls: hlsRef.current,
    isLoading,
    retryCount,
    destroy: destroyHls,
  };
}; 