import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Surface hierarchy ───────────────────────────────────────────────
        "background":                "#070d1f",
        "surface-dim":               "#070d1f",
        "surface-container-lowest":  "#000000",
        "surface-container-low":     "#0c1326",
        "surface-container":         "#11192e",
        "surface-container-high":    "#161e33",
        "surface-container-highest": "#1c253e",
        "surface-bright":            "#222d4a",
        // ── Primary (teal/cyan) ─────────────────────────────────────────────
        "primary":                   "#5ffff7",
        "primary-dim":               "#06f3eb",
        "primary-container":         "#06f3eb",
        "on-primary":                "#000000",
        "on-primary-fixed":          "#000000",
        // ── Secondary ───────────────────────────────────────────────────────
        "secondary":                 "#87c3bf",
        "secondary-container":       "#0c3a38",
        "on-secondary-container":    "#87c3bf",
        // ── Tertiary (amber — meta/tags) ────────────────────────────────────
        "tertiary":                  "#ebc238",
        "tertiary-container":        "#3a2e00",
        "on-tertiary-container":     "#ebc238",
        // ── Surface text ────────────────────────────────────────────────────
        "on-background":             "#dfe4fe",
        "on-surface":                "#dfe4fe",
        "on-surface-variant":        "#7b87a8",
        // ── Outline ─────────────────────────────────────────────────────────
        "outline":                   "#41475b",
        "outline-variant":           "#2a3050",
        // ── Error ───────────────────────────────────────────────────────────
        "error":                     "#ffb4ab",
        "error-container":           "#93000a",
      },
      fontFamily: {
        headline: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        body:     ["var(--font-manrope)", "Manrope", "sans-serif"],
        label:    ["var(--font-inter)", "Inter", "sans-serif"],
        sans:     ["var(--font-manrope)", "Manrope", "sans-serif"],
        mono:     ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm:      "0.375rem",
        md:      "0.375rem",
        lg:      "0.5rem",
        xl:      "0.75rem",
        "2xl":   "1rem",
        "3xl":   "1.5rem",
        full:    "9999px",
      },
      keyframes: {
        "breath-glow": {
          "0%, 100%": { opacity: "0.3" },
          "50%":      { opacity: "0.8" },
        },
        scanline: {
          "0%":   { transform: "translateY(-100%)", opacity: "0" },
          "10%":  { opacity: "1" },
          "90%":  { opacity: "1" },
          "100%": { transform: "translateY(2000%)", opacity: "0" },
        },
      },
      animation: {
        "breath-glow": "breath-glow 3s ease-in-out infinite",
        scanline:      "scanline 2s linear infinite",
      },
      boxShadow: {
        "ambient-primary": "0 0 40px 0px rgba(95, 255, 247, 0.06)",
        "glow-primary":    "0 0 20px 0px rgba(95, 255, 247, 0.15)",
        "glow-sm":         "0 0 10px 0px rgba(95, 255, 247, 0.20)",
      },
    },
  },
  plugins: [],
};
export default config;
