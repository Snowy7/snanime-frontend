"use client";
import React, { useState, useEffect, useRef } from 'react';
import { PlayerSettings, VideoSubtitle } from '../types';

interface SubtitleDisplayProps {
  subtitles: VideoSubtitle[];
  currentTime: number;
  settings: PlayerSettings;
  isVisible: boolean;
}

interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

export const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({
  subtitles,
  currentTime,
  settings,
  isVisible,
}) => {
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const loadedSubtitleRef = useRef<string>('');

  // Load subtitle file
  useEffect(() => {
    if (!subtitles.length || !settings.selectedSubtitleLang || settings.selectedSubtitleLang === 'off') {
      setSubtitleCues([]);
      setCurrentSubtitle('');
      return;
    }

    const selectedSubtitle = subtitles.find(sub => 
      sub.lang.toLowerCase() === settings.selectedSubtitleLang.toLowerCase()
    );

    if (!selectedSubtitle || selectedSubtitle.url === loadedSubtitleRef.current) {
      return;
    }

    loadedSubtitleRef.current = selectedSubtitle.url;

    const loadSubtitles = async () => {
      try {
        const response = await fetch(selectedSubtitle.url);
        const text = await response.text();
        
        // Parse VTT format
        const cues = parseVTT(text);
        setSubtitleCues(cues);
      } catch (error) {
        console.error('Error loading subtitles:', error);
        setSubtitleCues([]);
      }
    };

    loadSubtitles();
  }, [subtitles, settings.selectedSubtitleLang]);

  // Update current subtitle based on time
  useEffect(() => {
    if (!subtitleCues.length) {
      setCurrentSubtitle('');
      return;
    }

    const currentCue = subtitleCues.find(cue => 
      currentTime >= cue.start && currentTime <= cue.end
    );

    setCurrentSubtitle(currentCue?.text || '');
  }, [currentTime, subtitleCues]);

  // Parse VTT subtitle format
  const parseVTT = (vttText: string): SubtitleCue[] => {
    const lines = vttText.split('\n');
    const cues: SubtitleCue[] = [];
    let i = 0;

    // Skip header
    while (i < lines.length && !lines[i].includes('-->')) {
      i++;
    }

    while (i < lines.length) {
      const timeLine = lines[i];
      if (timeLine && timeLine.includes('-->')) {
        const [startTime, endTime] = timeLine.split(' --> ');
        const start = parseTimeString(startTime.trim());
        const end = parseTimeString(endTime.trim());

        i++;
        let text = '';
        
        // Collect subtitle text (can be multiple lines)
        while (i < lines.length && lines[i].trim() !== '') {
          if (text) text += '\n';
          text += lines[i].trim();
          i++;
        }

        if (text) {
          cues.push({
            start,
            end,
            text: cleanSubtitleText(text),
          });
        }
      }
      i++;
    }

    return cues;
  };

  // Parse time string (00:00:00.000 or 00:00.000)
  const parseTimeString = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      // HH:MM:SS.mmm
      const [hours, minutes, seconds] = parts;
      return (
        parseInt(hours) * 3600 +
        parseInt(minutes) * 60 +
        parseFloat(seconds)
      );
    } else if (parts.length === 2) {
      // MM:SS.mmm
      const [minutes, seconds] = parts;
      return parseInt(minutes) * 60 + parseFloat(seconds);
    }
    return 0;
  };

  // Clean subtitle text (remove HTML tags, etc.)
  const cleanSubtitleText = (text: string): string => {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .trim();
  };

  if (!isVisible || !currentSubtitle) {
    return null;
  }

  const subtitleStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: `${100 - settings.subtitleVerticalPosition}%`,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: `${settings.subtitleFontSize}px`,
    color: settings.subtitleColor,
    backgroundColor: `${settings.subtitleBackgroundColor}${Math.round(settings.subtitleBackgroundOpacity * 255).toString(16).padStart(2, '0')}`,
    padding: '4px 8px',
    borderRadius: '4px',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: '1.4',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    whiteSpace: 'pre-line',
    zIndex: 5,
  };

  return (
    <div style={subtitleStyle}>
      {currentSubtitle}
    </div>
  );
}; 