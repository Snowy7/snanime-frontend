import { useState, useEffect, useCallback } from 'react';
import { PlayerSettings } from '../types';
import { PLAYER_SETTINGS_KEY, DEFAULT_SETTINGS } from '../constants';

export const usePlayerSettings = () => {
  const [settings, setSettings] = useState<PlayerSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedSettings = localStorage.getItem(PLAYER_SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Error loading player settings:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(PLAYER_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving player settings:', error);
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<PlayerSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PLAYER_SETTINGS_KEY);
    }
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}; 