"use client";
import React, { useCallback } from 'react';
import { ChevronLeft, Check, X } from 'lucide-react';
import { PlayerSettings } from '../types';
import { useLanguage } from '@/context/LanguageContext';

interface SettingsMenuProps {
  settings: PlayerSettings;
  onSettingsChange: (settings: Partial<PlayerSettings>) => void;
  onClose: () => void;
  hlsQualityLevels?: any[];
  mp4QualityLevels?: { index: number; quality: string; name: string; url: string; server: string; originalIndex: number }[];
  availableSubtitles?: { lang: string; url: string }[];
  isVisible: boolean;
  isMP4Stream?: boolean; // Flag to determine if this is an MP4 stream
  hasHLSSource?: boolean; // Flag to show if HLS is available
  hasMP4Sources?: boolean; // Flag to show if MP4 sources are available
  currentSourceType?: 'hls' | 'mp4'; // Current source type
  onSourceTypeChange?: (sourceType: 'hls' | 'mp4') => void; // Callback for source type change
}

interface SettingsMenuState {
  currentView: 'main' | 'playbackSpeed' | 'quality' | 'subtitles' | 'subtitleSettings' | 'sourceType';
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  settings,
  onSettingsChange,
  onClose,
  hlsQualityLevels = [],
  mp4QualityLevels = [],
  availableSubtitles = [],
  isVisible,
  isMP4Stream = false,
  hasHLSSource = false,
  hasMP4Sources = false,
  currentSourceType = 'hls',
  onSourceTypeChange,
}) => {
  const { t } = useLanguage();
  const [menuState, setMenuState] = React.useState<SettingsMenuState>({
    currentView: 'main',
  });

  const handlePlaybackSpeedChange = useCallback((speed: number) => {
    onSettingsChange({ playbackSpeed: speed });
    setMenuState({ currentView: 'main' });
  }, [onSettingsChange]);

  const handleQualityChange = useCallback((qualityIndex: number) => {
    onSettingsChange({ selectedHlsQuality: qualityIndex });
    setMenuState({ currentView: 'main' });
  }, [onSettingsChange]);

  const handleMp4QualityChange = useCallback((qualityIndex: number) => {
    onSettingsChange({ selectedMp4Quality: qualityIndex });
    setMenuState({ currentView: 'main' });
  }, [onSettingsChange]);

  const handleSourceTypeChange = useCallback((sourceType: 'hls' | 'mp4') => {
    if (onSourceTypeChange) {
      onSourceTypeChange(sourceType);
    }
    setMenuState({ currentView: 'main' });
  }, [onSourceTypeChange]);

  const handleSubtitleChange = useCallback((lang: string) => {
    onSettingsChange({ selectedSubtitleLang: lang });
    setMenuState({ currentView: 'main' });
  }, [onSettingsChange]);

  const handleSubtitleStyleChange = useCallback((styleUpdates: Partial<PlayerSettings>) => {
    onSettingsChange(styleUpdates);
  }, [onSettingsChange]);

  const renderMainMenu = () => (
    <div className="space-y-1">
      <div className="px-3 md:px-4 py-2 text-sm font-medium text-white/90 border-b border-white/10">
        {t('settings')}
      </div>
      
      <button
        className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
        onClick={() => setMenuState({ currentView: 'playbackSpeed' })}
      >
        <span>{t('videoPlayer.playbackSpeed')}</span>
        <div className="flex items-center gap-2">
          <span className="text-white/60">{settings.playbackSpeed}x</span>
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </div>
      </button>

      {(hlsQualityLevels.length > 0 || mp4QualityLevels.length > 1) && (
        <button
          className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
          onClick={() => setMenuState({ currentView: 'quality' })}
        >
          <span>{t('videoPlayer.quality')}</span>
          <div className="flex items-center gap-2">
            <span className="text-white/60">
              {isMP4Stream 
                ? mp4QualityLevels[settings.selectedMp4Quality]?.name || mp4QualityLevels[0]?.name || 'Auto'
                : settings.selectedHlsQuality === -1 
                  ? t('auto')
                  : hlsQualityLevels[settings.selectedHlsQuality]?.height 
                    ? `${hlsQualityLevels[settings.selectedHlsQuality].height}p`
                    : t('auto')
              }
            </span>
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </div>
        </button>
      )}

      {hasHLSSource && hasMP4Sources && (
        <button
          className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
          onClick={() => setMenuState({ currentView: 'sourceType' })}
        >
          <span>Source Type</span>
          <div className="flex items-center gap-2">
            <span className="text-white/60">
              {currentSourceType === 'hls' ? 'HLS' : 'MP4'}
            </span>
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </div>
        </button>
      )}

      <button
        className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
        onClick={() => setMenuState({ currentView: 'subtitles' })}
      >
        <span>{t('videoPlayer.subtitles')}</span>
        <div className="flex items-center gap-2">
          <span className="text-white/60">
            {settings.selectedSubtitleLang === 'off' ? t('off') : settings.selectedSubtitleLang}
          </span>
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </div>
      </button>

      {settings.selectedSubtitleLang !== 'off' && (
        <button
          className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
          onClick={() => setMenuState({ currentView: 'subtitleSettings' })}
        >
          <span>{t('videoPlayer.subtitleSettings')}</span>
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </button>
      )}
    </div>
  );

  const renderPlaybackSpeedMenu = () => (
    <div className="space-y-1">
      <div className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-white/90 border-b border-white/10">
        <button
          onClick={() => setMenuState({ currentView: 'main' })}
          className="mr-2 p-1 hover:bg-white/10 rounded touch-manipulation"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {t('videoPlayer.playbackSpeed')}
      </div>
      
      {PLAYBACK_SPEEDS.map((speed) => (
        <button
          key={speed}
          className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
          onClick={() => handlePlaybackSpeedChange(speed)}
        >
          <span>{speed}x</span>
          {settings.playbackSpeed === speed && (
            <Check className="w-4 h-4 text-red-500" />
          )}
        </button>
      ))}
    </div>
  );

  const renderQualityMenu = () => (
    <div className="space-y-1">
      <div className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-white/90 border-b border-white/10">
        <button
          onClick={() => setMenuState({ currentView: 'main' })}
          className="mr-2 p-1 hover:bg-white/10 rounded touch-manipulation"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {t('videoPlayer.quality')}
      </div>
      
      {isMP4Stream ? (
        // MP4 Quality Selection
        mp4QualityLevels.map((level, index) => (
          <button
            key={index}
            className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
            onClick={() => handleMp4QualityChange(index)}
          >
            <div className="flex flex-col items-start">
              <span>{level.name}</span>
              <span className="text-xs text-white/50">{level.server}</span>
            </div>
            {settings.selectedMp4Quality === index && (
              <Check className="w-4 h-4 text-red-500" />
            )}
          </button>
        ))
      ) : (
        // HLS Quality Selection
        <>
          <button
            className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
            onClick={() => handleQualityChange(-1)}
          >
            <span>{t('auto')}</span>
            {settings.selectedHlsQuality === -1 && (
              <Check className="w-4 h-4 text-red-500" />
            )}
          </button>
          
          {hlsQualityLevels.map((level, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
              onClick={() => handleQualityChange(index)}
            >
              <span>{level.height}p</span>
              {settings.selectedHlsQuality === index && (
                <Check className="w-4 h-4 text-red-500" />
              )}
            </button>
          ))}
        </>
      )}
    </div>
  );

  const renderSubtitlesMenu = () => (
    <div className="space-y-1">
      <div className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-white/90 border-b border-white/10">
        <button
          onClick={() => setMenuState({ currentView: 'main' })}
          className="mr-2 p-1 hover:bg-white/10 rounded touch-manipulation"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {t('videoPlayer.subtitles')}
      </div>
      
      <button
        className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
        onClick={() => handleSubtitleChange('off')}
      >
        <span>{t('off')}</span>
        {settings.selectedSubtitleLang === 'off' && (
          <Check className="w-4 h-4 text-red-500" />
        )}
      </button>
      
      {availableSubtitles.map((subtitle) => (
        <button
          key={subtitle.lang}
          className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
          onClick={() => handleSubtitleChange(subtitle.lang)}
        >
          <span>{subtitle.lang}</span>
          {settings.selectedSubtitleLang === subtitle.lang && (
            <Check className="w-4 h-4 text-red-500" />
          )}
        </button>
      ))}
    </div>
  );

  const renderSubtitleSettingsMenu = () => (
    <div className="space-y-1">
      <div className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-white/90 border-b border-white/10">
        <button
          onClick={() => setMenuState({ currentView: 'main' })}
          className="mr-2 p-1 hover:bg-white/10 rounded touch-manipulation"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {t('videoPlayer.subtitleSettings')}
      </div>
      
      {/* Font Size */}
      <div className="px-3 md:px-4 py-2">
        <label className="block text-sm text-white/80 mb-2">{t('videoPlayer.fontSize')}</label>
        <input
          type="range"
          min="12"
          max="24"
          value={settings.subtitleFontSize}
          onChange={(e) => handleSubtitleStyleChange({ subtitleFontSize: parseInt(e.target.value) })}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>12px</span>
          <span>{settings.subtitleFontSize}px</span>
          <span>24px</span>
        </div>
      </div>

      {/* Font Color */}
      <div className="px-3 md:px-4 py-2">
        <label className="block text-sm text-white/80 mb-2">{t('videoPlayer.fontColor')}</label>
        <input
          type="color"
          value={settings.subtitleColor}
          onChange={(e) => handleSubtitleStyleChange({ subtitleColor: e.target.value })}
          className="w-full h-8 bg-transparent border border-white/20 rounded cursor-pointer"
        />
      </div>

      {/* Background Color */}
      <div className="px-3 md:px-4 py-2">
        <label className="block text-sm text-white/80 mb-2">{t('videoPlayer.backgroundColor')}</label>
        <input
          type="color"
          value={settings.subtitleBackgroundColor}
          onChange={(e) => handleSubtitleStyleChange({ subtitleBackgroundColor: e.target.value })}
          className="w-full h-8 bg-transparent border border-white/20 rounded cursor-pointer"
        />
      </div>

      {/* Background Opacity */}
      <div className="px-3 md:px-4 py-2">
        <label className="block text-sm text-white/80 mb-2">{t('videoPlayer.backgroundOpacity')}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.subtitleBackgroundOpacity}
          onChange={(e) => handleSubtitleStyleChange({ subtitleBackgroundOpacity: parseFloat(e.target.value) })}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>0%</span>
          <span>{Math.round(settings.subtitleBackgroundOpacity * 100)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Vertical Position */}
      <div className="px-3 md:px-4 py-2">
        <label className="block text-sm text-white/80 mb-2">{t('videoPlayer.verticalPosition')}</label>
        <input
          type="range"
          min="70"
          max="95"
          value={settings.subtitleVerticalPosition}
          onChange={(e) => handleSubtitleStyleChange({ subtitleVerticalPosition: parseInt(e.target.value) })}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>Top</span>
          <span>{settings.subtitleVerticalPosition}%</span>
          <span>Bottom</span>
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-16 md:bottom-20 right-2 md:right-4 z-50">
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl min-w-[200px] md:min-w-[240px] max-w-[280px] overflow-hidden">
        <div className="max-h-[60vh] overflow-y-auto">
          {menuState.currentView === 'main' && renderMainMenu()}
          {menuState.currentView === 'playbackSpeed' && renderPlaybackSpeedMenu()}
          {menuState.currentView === 'quality' && renderQualityMenu()}
          {menuState.currentView === 'subtitles' && renderSubtitlesMenu()}
          {menuState.currentView === 'subtitleSettings' && renderSubtitleSettingsMenu()}
          {menuState.currentView === 'sourceType' && renderSourceTypeMenu()}
        </div>
      </div>
    </div>
  );

  function renderSourceTypeMenu() {
    return (
      <div className="space-y-1">
        <div className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-white/90 border-b border-white/10">
          <button
            onClick={() => setMenuState({ currentView: 'main' })}
            className="mr-2 p-1 hover:bg-white/10 rounded touch-manipulation"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          Source Type
        </div>
        
        {hasHLSSource && (
          <button
            className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
            onClick={() => handleSourceTypeChange('hls')}
          >
            <div className="flex flex-col items-start">
              <span>HLS Stream</span>
              <span className="text-xs text-white/50">Adaptive quality</span>
            </div>
            {currentSourceType === 'hls' && (
              <Check className="w-4 h-4 text-red-500" />
            )}
          </button>
        )}
        
        {hasMP4Sources && (
          <button
            className="w-full flex items-center justify-between px-3 md:px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors touch-manipulation"
            onClick={() => handleSourceTypeChange('mp4')}
          >
            <div className="flex flex-col items-start">
              <span>MP4 Sources</span>
              <span className="text-xs text-white/50">Fixed quality</span>
            </div>
            {currentSourceType === 'mp4' && (
              <Check className="w-4 h-4 text-red-500" />
            )}
          </button>
        )}
      </div>
    );
  }
}; 