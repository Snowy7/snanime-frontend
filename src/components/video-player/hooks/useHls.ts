import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { VideoSource, HlsQualityLevel, PlayerError } from '../types';

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

  // Cleanup function
  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setIsLoading(false);
  }, []);

  // Generate the proxy URL
  const getProxyUrl = useCallback((sourceUrl: string, isM3U8: boolean) => {
    const apiBase = process.env.NEXT_PUBLIC_SNANIME_API_URL || 'http://localhost:5000/api/v1';
    
    // Clean URL
    const cleanedUrl = sourceUrl.trim();
    const encodedUrl = encodeURIComponent(cleanedUrl);
    
    // Combine headers
    // Ideally, the source object from the API should already contain the correct Referer/User-Agent
    const combinedHeaders = { ...headers, ...(source?.headers || {}) };
    const encodedHeaders = encodeURIComponent(JSON.stringify(combinedHeaders));

    let proxyUrl = `${apiBase}/proxy/${isM3U8 ? 'm3u8' : 'stream'}?url=${encodedUrl}&headers=${encodedHeaders}`;
    
    // If we have a known server/baseUrl from the source, pass it. 
    // This helps if the m3u8 uses relative paths but isn't hosted at the root.
    if (source?.server) {
      proxyUrl += `&baseUrl=${encodeURIComponent(source.server)}`;
    }

    return proxyUrl;
  }, [headers, source]);

  // Initialize HLS or Native Player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;

    destroyHls();
    setIsLoading(true);

    const isM3U8 = source.isM3U8 || source.url.includes('.m3u8');
    const url = getProxyUrl(source.url, isM3U8);

    console.log(`Loading video source: ${source.url} via proxy: ${url}`);

    if (isM3U8 && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        // Increase buffer for smoother playback on slower proxies
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('HLS Manifest loaded', data.levels);
        setIsLoading(false);
        if (onLevelsLoaded) {
          onLevelsLoaded(data.levels.map((l, i) => ({
            level: i,
            height: l.height,
            width: l.width,
            bitrate: l.bitrate,
            name: l.height ? `${l.height}p` : 'Auto'
          })));
        }
        video.play().catch(e => console.log('Autoplay prevented:', e));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS Fatal Error:', data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              destroyHls();
              if (onError) onError({
                type: 'hls',
                message: 'Fatal playback error',
                details: data,
                fatal: true,
                retry: false
              });
              break;
          }
        }
      });

      hls.loadSource(url);
      hls.attachMedia(video);

    } else {
      // Native playback (MP4 or native HLS like Safari)
      video.src = url;
      video.load();
      
      const handleCanPlay = () => setIsLoading(false);
      const handleError = () => {
        setIsLoading(false);
        if (onError) onError({
          type: 'media',
          message: 'Video load failed',
          details: video.error,
          fatal: true,
          retry: true
        });
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    }

    return () => destroyHls();
  }, [source, getProxyUrl]); // Re-run if source changes

  // Handle Quality Selection
  useEffect(() => {
    if (hlsRef.current && selectedQuality !== undefined) {
      hlsRef.current.currentLevel = selectedQuality;
    }
  }, [selectedQuality]);

  return { isLoading };
};
