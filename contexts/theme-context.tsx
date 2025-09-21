'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark'; // The actual theme being applied (resolved from system)
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Resolve actual theme from theme preference
  const resolveActualTheme = (themePreference: Theme): 'light' | 'dark' => {
    if (themePreference === 'system') {
      return getSystemTheme();
    }
    return themePreference;
  };

  // Apply theme to document
  const applyTheme = (resolvedTheme: 'light' | 'dark') => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);

      // Update CSS variables for better theme support
      if (resolvedTheme === 'dark') {
        root.style.colorScheme = 'dark';
      } else {
        root.style.colorScheme = 'light';
      }
    }
  };



  // Set theme with persistence
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    // Save to localStorage
    try {
      localStorage.setItem('flowforge_theme', newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }

    const resolved = resolveActualTheme(newTheme);
    setActualTheme(resolved);
    applyTheme(resolved);
  };

  // Toggle between light and dark (ignoring system)
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);

    const initializeTheme = () => {
      try {
        // Get theme from localStorage, fallback to system
        const localTheme = localStorage.getItem('flowforge_theme') as Theme | null;
        const initialTheme: Theme = localTheme && ['light', 'dark', 'system'].includes(localTheme) ? localTheme : 'system';

        setThemeState(initialTheme);
        const resolved = resolveActualTheme(initialTheme);
        setActualTheme(resolved);
        applyTheme(resolved);
      } catch (error) {
        console.error('Error initializing theme:', error);
        // Fallback to system theme
        const systemTheme = getSystemTheme();
        setThemeState('system');
        setActualTheme(systemTheme);
        applyTheme(systemTheme);
      }
    };

    initializeTheme();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newActualTheme = getSystemTheme();
        setActualTheme(newActualTheme);
        applyTheme(newActualTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
