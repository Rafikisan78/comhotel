'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * Composant ThemeToggle - Dark Mode (WCAG 2.2)
 * Respecte les préférences système par défaut
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  // Éviter le flash pendant l'hydratation
  if (!mounted) {
    return (
      <button className={`btn btn-ghost btn-sm ${className}`} aria-label="Changer le thème">
        <span className="w-5 h-5" />
      </button>
    );
  }

  const icon = theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻';
  const label =
    theme === 'light'
      ? 'Mode clair activé'
      : theme === 'dark'
        ? 'Mode sombre activé'
        : 'Suit les préférences système';

  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-ghost btn-sm ${className}`}
      aria-label={`${label}. Cliquez pour changer`}
      title={label}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

export default ThemeToggle;
