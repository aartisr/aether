'use client';

import React, { useEffect, useState } from 'react';

type ThemeOption = 'light' | 'dark' | 'high-contrast';

const THEME_CONFIG: Record<ThemeOption, { label: string; emoji: string; ariaLabel: string }> = {
  light: {
    label: 'Light',
    emoji: '☀️',
    ariaLabel: 'Light theme: bright, calm, easy on daytime reading',
  },
  dark: {
    label: 'Dark',
    emoji: '🌙',
    ariaLabel: 'Dark theme: easier on eyes at night, reduced glare',
  },
  'high-contrast': {
    label: 'High Contrast',
    emoji: '⚡',
    ariaLabel: 'High contrast theme: maximum clarity and accessibility',
  },
};

const STORAGE_KEY = 'aether-blog-theme';

export default function BlogThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeOption | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeOption | null;
    const theme = savedTheme || 'light';
    setCurrentTheme(theme);
    applyTheme(theme);
    setIsMounted(true);
  }, []);

  const applyTheme = (theme: ThemeOption) => {
    const shell = document.querySelector('.blog-shell');
    if (shell) {
      shell.setAttribute('data-theme', theme === 'light' ? '' : theme);
      localStorage.setItem(STORAGE_KEY, theme);
    }
  };

  const handleThemeChange = (theme: ThemeOption) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  if (!isMounted || currentTheme === null) {
    return null;
  }

  return (
    <div className="blog-theme-switcher" role="group" aria-label="Blog theme selector">
      {(Object.keys(THEME_CONFIG) as ThemeOption[]).map((theme) => (
        <button
          key={theme}
          onClick={() => handleThemeChange(theme)}
          type="button"
          className={`blog-theme-btn ${currentTheme === theme ? 'active' : ''}`}
          title={THEME_CONFIG[theme].ariaLabel}
          aria-label={THEME_CONFIG[theme].ariaLabel}
        >
          {THEME_CONFIG[theme].emoji}
        </button>
      ))}
    </div>
  );
}
