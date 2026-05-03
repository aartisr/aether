/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: [
        'var(--font-body)',
        'Manrope',
        'Avenir Next',
        'ui-sans-serif',
        'system-ui',
        'sans-serif',
      ],
      display: [
        'var(--font-display)',
        'Playfair Display',
        'Iowan Old Style',
        'serif',
      ],
    },
    extend: {
      colors: {
        primary: 'rgb(var(--theme-primary-rgb) / <alpha-value>)',
        primaryLight: 'var(--theme-bg-soft)',
        primaryDark: 'var(--theme-primary-strong)',
        accent: 'rgb(var(--theme-accent-rgb) / <alpha-value>)',
        accentLight: 'var(--theme-lavender)',
        accentDark: '#cf5d48',
        background: 'var(--theme-bg)',
        backgroundSoft: 'var(--theme-bg-soft)',
        surface: 'var(--theme-bg-elevated)',
        surfaceSubtle: 'var(--theme-bg-soft)',
        success: '#4ADE80',
        warning: '#FBBF24',
        error: '#F87171',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 8px 0 rgba(79,143,203,0.08)',
        focus: '0 0 0 3px #A78BFA55',
      },
      transitionTimingFunction: {
        'in-out-soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
