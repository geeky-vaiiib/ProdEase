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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

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

  // Save theme preference to backend
  const saveThemeToBackend = async (newTheme: Theme) => {
    try {
      const token = localStorage.getItem('prodease_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ theme: newTheme })
      });

      if (!response.ok) {
        console.warn('Failed to save theme preference to backend');
      }
    } catch (error) {
      console.warn('Error saving theme preference:', error);
    }
  };

  // Load theme preference from backend
  const loadThemeFromBackend = async (): Promise<Theme | null> => {
    try {
      const token = localStorage.getItem('prodease_token');
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/theme`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.theme || null;
      }
    } catch (error) {
      console.warn('Error loading theme preference:', error);
    }
    return null;
  };

  // Set theme with persistence
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('prodease-theme', newTheme);
    
    const resolved = resolveActualTheme(newTheme);
    setActualTheme(resolved);
    applyTheme(resolved);
    
    // Save to backend
    await saveThemeToBackend(newTheme);
  };

  // Toggle between light and dark (ignoring system)
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      // Priority: 1. Backend preference, 2. localStorage, 3. system preference
      const backendTheme = await loadThemeFromBackend();
      const localTheme = localStorage.getItem('prodease-theme') as Theme | null;
      const systemTheme = getSystemTheme();
      
      let initialTheme: Theme = 'system';
      
      if (backendTheme) {
        initialTheme = backendTheme;
      } else if (localTheme && ['light', 'dark', 'system'].includes(localTheme)) {
        initialTheme = localTheme;
      }
      
      setThemeState(initialTheme);
      const resolved = resolveActualTheme(initialTheme);
      setActualTheme(resolved);
      applyTheme(resolved);
      
      // Save to localStorage if it came from backend
      if (backendTheme) {
        localStorage.setItem('prodease-theme', backendTheme);
      }
    };

    initializeTheme();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

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
  }, [theme]);

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
