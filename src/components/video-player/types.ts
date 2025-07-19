export interface VideoSource {
  url: string;
  isM3U8: boolean;
  type: string;
  quality?: string; // For MP4 sources: "1080p", "720p", "480p", etc.
  server?: string; // Server name: "AnimeSLayer Original", "Server 4 (streamtape.to)", etc.
  headers?: Record<string, string>; // Headers for the request
}

export interface VideoSubtitle {
  url: string;
  lang: string;
}

export interface VideoStream {
  headers: Record<string, string>;
  subtitles: VideoSubtitle[];
  intro?: {
    start: number;
    end: number;
  };
  outro?: {
    start: number;
    end: number;
  };
  sources: VideoSource[];
}

export interface PlayerSettings {
  volume: number;
  isMuted: boolean;
  selectedHlsQuality: number;
  selectedMp4Quality: number; // Index of selected MP4 source
  selectedSubtitleLang: string;
  playbackSpeed: number;
  subtitleFontSize: number;
  subtitleColor: string;
  subtitleBackgroundColor: string;
  subtitleBackgroundOpacity: number;
  subtitleVerticalPosition: number;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  isLoading: boolean;
  error: string | null;
  isFullscreen: boolean;
  showControls: boolean;
}

export interface HlsQualityLevel {
  level: number;
  height: number;
  width: number;
  bitrate: number;
  name: string;
}

export interface Mp4QualityLevel {
  index: number;
  quality: string;
  name: string;
  url: string;
  server: string;
  originalIndex: number; // Index in the original sources array
}

export interface SourcePriority {
  preferredSource: VideoSource | null; // HLS source if available
  fallbackSources: VideoSource[]; // MP4 sources as fallback
  currentSourceType: 'hls' | 'mp4';
  currentSourceIndex: number; // Index within the current type
}

export type PlayerError = {
  type: 'network' | 'media' | 'hls' | 'unknown';
  message: string;
  details?: any;
  fatal: boolean;
  retry?: boolean;
}; 