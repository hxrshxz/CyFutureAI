import type { Config } from 'tailwindcss';

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-mono)", "Geist Mono", "ui-monospace", "monospace"],
        mono: ["var(--font-mono)", "Geist Mono", "ui-monospace", "monospace"],
        display: [
          "var(--font-mono)",
          "Geist Mono",
          "ui-monospace",
          "monospace",
        ],
      },
      backgroundImage: {
        "pearl-mist":
          "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.08), transparent 60%)",
        "rose-gradient":
          "linear-gradient(135deg, rgba(244, 63, 94, 0.9), rgba(236, 72, 153, 0.9))",
        'gradient-primary': 'linear-gradient(to right bottom, #8b5cf6, #38bdf8)',
      },
      boxShadow: {
        'soft': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        "pearl-shimmer": "pearl-shimmer 3s ease-in-out infinite",
        "rose-pulse": "rose-pulse 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
};

export default config;