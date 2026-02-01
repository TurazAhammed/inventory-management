/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Semantic color palette used across the app to ensure UI/UX consistency
      colors: {
        primary: {
          DEFAULT: '#1E40AF', // main brand blue
          600: '#2563EB',
          700: '#1E3A8A'
        },
        secondary: {
          DEFAULT: '#F59E0B', // accent / warning
          600: '#D97706'
        },
        accent: {
          DEFAULT: '#10B981', // success / accent
          600: '#059669'
        },

        // Neutral / UI colors
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          300: '#D1D5DB',
          500: '#6B7280',
          700: '#374151',
          900: '#111827'
        },
        surface: '#FFFFFF',
        muted: '#6B7280',
        error: '#EF4444',
        success: '#34C759',
        info: '#0EA5E9'
      },

      // Fonts: set a sane default system stack and prefer Inter if available
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Roboto Mono', 'monospace']
      },

      // Border radius scale tuned for the app's cards and buttons
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        lg: '12px',
        full: '9999px'
      },

      // Soft shadow presets for elevated cards and floating buttons
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        DEFAULT: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 6px rgba(0,0,0,0.08)'
      },

      // Small helpers for consistent spacing and transitions
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem'
      },
      transitionDuration: {
        DEFAULT: '200ms',
        150: '150ms',
        300: '300ms'
      }
    },
  },
  plugins: [],
}