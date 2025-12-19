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
        const apiBase = process.env.NEXT_PUBLIC_SNANIME_API_URL || 'http://localhost:3000';
        const proxyUrl = `${apiBase}/proxy/subtitle?url=${encodeURIComponent(selectedSubtitle.url)}`;
        
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        const isASS = selectedSubtitle.url.includes('.ass') || text.includes('[Script Info]');
        const isVTT = selectedSubtitle.url.includes('.vtt') || text.includes('WEBVTT');
        
        let cues: SubtitleCue[] = [];
        if (isASS) {
          cues = parseASS(text);
        } else if (isVTT) {
          cues = parseVTT(text);
        } else {
          cues = parseSRT(text);
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

    setCurrentSubtitle(currentCue?.text || '');
  }, [currentTime, subtitleCues]);

  // Parse VTT subtitle format
  const parseVTT = (vttText: string): SubtitleCue[] => {
    const lines = vttText.split('\n');
    const cues: SubtitleCue[] = [];
    let i = 0;

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
    
    let eventsStartIndex = -1;
    let formatLine = '';
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '[Events]') {
        eventsStartIndex = i;
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
      return cues;
    }
    
    const formatParts = formatLine.replace('Format:', '').split(',').map(s => s.trim());
    const startIndex = formatParts.indexOf('Start');
    const endIndex = formatParts.indexOf('End');
    const textIndex = formatParts.indexOf('Text');
    
    if (startIndex === -1 || endIndex === -1 || textIndex === -1) {
      return cues;
    }
    
    for (let i = eventsStartIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('Dialogue:')) {
        const parts = line.replace('Dialogue:', '').split(',');
        
        if (parts.length > Math.max(startIndex, endIndex, textIndex)) {
          const startTime = parseASSTime(parts[startIndex].trim());
          const endTime = parseASSTime(parts[endIndex].trim());
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
      while (i < lines.length && (!lines[i].trim() || /^\d+$/.test(lines[i].trim()))) {
        i++;
      }
      
      if (i >= lines.length) break;
      
      const timeLine = lines[i];
      if (timeLine && timeLine.includes('-->')) {
        const [startTime, endTime] = timeLine.split(' --> ');
        const start = parseSRTTime(startTime.trim());
        const end = parseSRTTime(endTime.trim());

        i++;
        let text = '';
        
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

  const parseTimeString = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return (
        parseInt(hours) * 3600 +
        parseInt(minutes) * 60 +
        parseFloat(seconds)
      );
    } else if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return parseInt(minutes) * 60 + parseFloat(seconds);
    }
    return 0;
  };

  const cleanSubtitleText = (text: string): string => {
    return text
      .replace(/\{[^}]*\}/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\\N/g, '\n')
      .replace(/\\n/g, '\n')
      .trim();
  };

  if (!isVisible || !currentSubtitle) {
    return null;
  }

  // Split text into lines for multi-line support
  const lines = currentSubtitle.split('\n');

  return (
    <div className="absolute bottom-[12%] left-0 right-0 flex flex-col items-center pointer-events-none z-10 px-4">
      <div className="flex flex-col items-center gap-1">
        {lines.map((line, index) => (
          <span
            key={index}
            className="inline-block px-3 py-1.5 rounded-md text-center"
            style={{
              // Netflix-style subtitles
              fontSize: `clamp(16px, ${settings.subtitleFontSize}px, 32px)`,
              fontFamily: '"Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
              fontWeight: 700,
              color: settings.subtitleColor,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              textShadow: `
                2px 2px 4px rgba(0, 0, 0, 0.9),
                -1px -1px 2px rgba(0, 0, 0, 0.9),
                1px -1px 2px rgba(0, 0, 0, 0.9),
                -1px 1px 2px rgba(0, 0, 0, 0.9),
                0 0 8px rgba(0, 0, 0, 0.5)
              `,
              letterSpacing: '0.03em',
              lineHeight: 1.4,
              maxWidth: '85%',
              wordWrap: 'break-word',
            }}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
};
