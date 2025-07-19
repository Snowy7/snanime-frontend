import { PlayerSettings } from './types';

export const PLAYER_SETTINGS_KEY = 'snanime-player-settings';

export const DEFAULT_SETTINGS: PlayerSettings = {
  volume: 1,
  isMuted: false,
  selectedHlsQuality: -1,
  selectedMp4Quality: 0, // Default to first (usually highest) quality
  selectedSubtitleLang: 'off',
  playbackSpeed: 1,
  subtitleFontSize: 16,
  subtitleColor: '#ffffff',
  subtitleBackgroundColor: '#000000',
  subtitleBackgroundOpacity: 0.8,
  subtitleVerticalPosition: 85,
};

export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const SKIP_SECONDS = 10;

export const CONTROLS_HIDE_DELAY = 3000;

export const LOADING_TIMEOUT = 10000;

export const RETRY_DELAYS = [1000, 2000, 5000];

export const MAX_RETRIES = 3; 