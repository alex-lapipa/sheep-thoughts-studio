import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          hover: "hsl(var(--accent-hover))",
          muted: "hsl(var(--accent-muted))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        bubble: {
          bg: "hsl(var(--bubble-bg))",
          border: "hsl(var(--bubble-border))",
          shadow: "hsl(var(--bubble-shadow))",
        },
        savage: {
          bg: "hsl(var(--savage-bg))",
          accent: "hsl(var(--savage-accent))",
        },
        // Wicklow Primary Palette
        wicklow: {
          green: {
            DEFAULT: "hsl(var(--wicklow-green))",
            light: "hsl(var(--wicklow-green-light))",
            dark: "hsl(var(--wicklow-green-dark))",
          },
          ocean: {
            DEFAULT: "hsl(var(--wicklow-ocean))",
            light: "hsl(var(--wicklow-ocean-light))",
            dark: "hsl(var(--wicklow-ocean-dark))",
          },
          sun: {
            DEFAULT: "hsl(var(--wicklow-sun))",
            light: "hsl(var(--wicklow-sun-light))",
            dark: "hsl(var(--wicklow-sun-dark))",
          },
          cloud: {
            DEFAULT: "hsl(var(--wicklow-cloud))",
            warm: "hsl(var(--wicklow-cloud-warm))",
            cool: "hsl(var(--wicklow-cloud-cool))",
          },
          rain: {
            DEFAULT: "hsl(var(--wicklow-rain))",
            light: "hsl(var(--wicklow-rain-light))",
            dark: "hsl(var(--wicklow-rain-dark))",
          },
          heather: {
            DEFAULT: "hsl(var(--wicklow-heather))",
            light: "hsl(var(--wicklow-heather-light))",
            dark: "hsl(var(--wicklow-heather-dark))",
          },
          turf: {
            DEFAULT: "hsl(var(--wicklow-turf))",
            light: "hsl(var(--wicklow-turf-light))",
            dark: "hsl(var(--wicklow-turf-dark))",
          },
        },
        // Modern Accent Palette
        "accent-modern": {
          acid: {
            DEFAULT: "hsl(var(--accent-acid))",
            dim: "hsl(var(--accent-acid-dim))",
          },
          hotpink: {
            DEFAULT: "hsl(var(--accent-hotpink))",
            dim: "hsl(var(--accent-hotpink-dim))",
          },
          electric: {
            DEFAULT: "hsl(var(--accent-electric))",
            dim: "hsl(var(--accent-electric-dim))",
          },
          coral: {
            DEFAULT: "hsl(var(--accent-coral))",
            dim: "hsl(var(--accent-coral-dim))",
          },
          vivid: {
            DEFAULT: "hsl(var(--accent-vivid))",
            dim: "hsl(var(--accent-vivid-dim))",
          },
        },
        // Mode Accent Colors
        mode: {
          innocent: "hsl(var(--mode-innocent))",
          concerned: "hsl(var(--mode-concerned))",
          triggered: "hsl(var(--mode-triggered))",
          savage: "hsl(var(--mode-savage))",
          nuclear: "hsl(var(--mode-nuclear))",
        },
        // Seasonal Palette
        season: {
          spring: "hsl(var(--season-spring))",
          summer: "hsl(var(--season-summer))",
          autumn: "hsl(var(--season-autumn))",
          winter: "hsl(var(--season-winter))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "bubble-appear": {
          "0%": { opacity: "0", transform: "scale(0.8) translateY(10px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "bubble-appear": "bubble-appear 0.4s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;