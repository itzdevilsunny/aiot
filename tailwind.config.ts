import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        risk: {
          critical: {
            DEFAULT: '#DC2626',
            light: '#FEF2F2',
            border: '#FCA5A5',
            text: '#991B1B'
          },
          high: {
            DEFAULT: '#EA580C',
            light: '#FFF7ED',
            border: '#FDBA74',
            text: '#C2410C'
          },
          medium: {
            DEFAULT: '#D97706',
            light: '#FFFBEB',
            border: '#FCD34D',
            text: '#B45309'
          },
          low: {
            DEFAULT: '#059669',
            light: '#ECFDF5',
            border: '#6EE7B7',
            text: '#047857'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'popover': '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
} satisfies Config;
