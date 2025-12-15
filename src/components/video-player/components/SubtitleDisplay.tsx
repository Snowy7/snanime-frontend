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
    console.log('Subtitle loading effect triggered:', {
      subtitlesLength: subtitles.length,
      selectedLang: settings.selectedSubtitleLang,
      subtitles: subtitles.map(s => ({ lang: s.lang, url: s.url }))
    });
    
    if (!subtitles.length || !settings.selectedSubtitleLang || settings.selectedSubtitleLang === 'off') {
      setSubtitleCues([]);
      setCurrentSubtitle('');
      return;
    }

    const selectedSubtitle = subtitles.find(sub => 
      sub.lang.toLowerCase() === settings.selectedSubtitleLang.toLowerCase()
    );

    console.log('Selected subtitle:', selectedSubtitle);

    if (!selectedSubtitle || selectedSubtitle.url === loadedSubtitleRef.current) {
      return;
    }

    loadedSubtitleRef.current = selectedSubtitle.url;

    const loadSubtitles = async () => {
      try {
        console.log('Loading subtitles from:', selectedSubtitle.url);
        
        // Use the backend proxy to avoid CORS issues with subtitle files
        // The proxy handles Referer/Origin headers automatically
        const apiBase = process.env.NEXT_PUBLIC_SNANIME_API_URL || 'http://localhost:5000/api/v1';
        const proxyUrl = `${apiBase}/proxy/stream?url=${encodeURIComponent(selectedSubtitle.url)}&headers=${encodeURIComponent('{}')}`;
        
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Subtitle content length:', text.length);
        
        // Determine format based on file extension or content
        const isASS = selectedSubtitle.url.includes('.ass') || text.includes('[Script Info]');
        const isVTT = selectedSubtitle.url.includes('.vtt') || text.includes('WEBVTT');
        
        console.log('Subtitle format detected:', { isASS, isVTT, url: selectedSubtitle.url });
        
        let cues: SubtitleCue[] = [];
        if (isASS) {
          cues = parseASS(text);
        } else if (isVTT) {
          cues = parseVTT(text);
        } else {
          // Try to parse as SRT format as fallback
          cues = parseSRT(text);
        }
        
        console.log('Parsed subtitle cues:', cues.length);
        if (cues.length > 0) {
          console.log('Sample cue:', cues[0]);
        }
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

    const newSubtitle = currentCue?.text || '';
    
    // Debug logging for subtitle timing (only log when subtitle changes)
    if (newSubtitle !== currentSubtitle) {
      console.log('Subtitle changed:', {
        currentTime,
        newSubtitle,
        currentCue,
        totalCues: subtitleCues.length
      });
    }

    setCurrentSubtitle(newSubtitle);
  }, [currentTime, subtitleCues, currentSubtitle]);

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

  // Parse ASS subtitle format
  const parseASS = (assText: string): SubtitleCue[] => {
    const lines = assText.split('\n');
    const cues: SubtitleCue[] = [];
    
    // Find the [Events] section
    let eventsStartIndex = -1;
    let formatLine = '';
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '[Events]') {
        eventsStartIndex = i;
        // Look for the Format line
        for (let j = i + 1; j < lines.length && j < i + 10; j++) {
          if (lines[j].startsWith('Format:')) {
            formatLine = lines[j];
            break;
          }
        }
        break;
      }
    }
    
    if (eventsStartIndex === -1) {
      console.warn('No [Events] section found in ASS file');
      return cues;
    }
    
    // Parse the format to find column indices
    const formatParts = formatLine.replace('Format:', '').split(',').map(s => s.trim());
    const startIndex = formatParts.indexOf('Start');
    const endIndex = formatParts.indexOf('End');
    const textIndex = formatParts.indexOf('Text');
    
    if (startIndex === -1 || endIndex === -1 || textIndex === -1) {
      console.warn('Invalid ASS format line');
      return cues;
    }
    
    // Parse dialogue lines
    for (let i = eventsStartIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('Dialogue:')) {
        const parts = line.replace('Dialogue:', '').split(',');
        
        if (parts.length > Math.max(startIndex, endIndex, textIndex)) {
          const startTime = parseASSTime(parts[startIndex].trim());
          const endTime = parseASSTime(parts[endIndex].trim());
          
          // Text might contain commas, so join from textIndex onwards
          const text = parts.slice(textIndex).join(',').trim();
          
          if (startTime !== -1 && endTime !== -1 && text) {
            cues.push({
              start: startTime,
              end: endTime,
              text: cleanSubtitleText(text),
            });
          }
        }
      }
    }
    
    return cues;
  };

  // Parse SRT subtitle format
  const parseSRT = (srtText: string): SubtitleCue[] => {
    const lines = srtText.split('\n');
    const cues: SubtitleCue[] = [];
    let i = 0;

    while (i < lines.length) {
      // Skip empty lines and subtitle numbers
      while (i < lines.length && (!lines[i].trim() || /^\d+$/.test(lines[i].trim()))) {
        i++;
      }
      
      if (i >= lines.length) break;
      
      // Parse time line
      const timeLine = lines[i];
      if (timeLine && timeLine.includes('-->')) {
        const [startTime, endTime] = timeLine.split(' --> ');
        const start = parseSRTTime(startTime.trim());
        const end = parseSRTTime(endTime.trim());

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
      } else {
        i++;
      }
    }

    return cues;
  };

  // Parse ASS time format (H:MM:SS.cc)
  const parseASSTime = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d{2}):(\d{2})\.(\d{2})/);
    if (!match) return -1;
    
    const [, hours, minutes, seconds, centiseconds] = match;
    return (
      parseInt(hours) * 3600 +
      parseInt(minutes) * 60 +
      parseInt(seconds) +
      parseInt(centiseconds) / 100
    );
  };

  // Parse SRT time format (HH:MM:SS,mmm)
  const parseSRTTime = (timeStr: string): number => {
    const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (!match) return -1;
    
    const [, hours, minutes, seconds, milliseconds] = match;
    return (
      parseInt(hours) * 3600 +
      parseInt(minutes) * 60 +
      parseInt(seconds) +
      parseInt(milliseconds) / 1000
    );
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

  // Clean subtitle text (remove HTML tags, ASS formatting, etc.)
  const cleanSubtitleText = (text: string): string => {
    return text
      // Remove ASS formatting tags like {\tag} or {\tag value}
      .replace(/\{[^}]*\}/g, '')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Handle common HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Remove any remaining backslash-N (ASS line break)
      .replace(/\\N/g, '\n')
      .replace(/\\n/g, '\n')
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