import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#080C0B",
        panel: "#0E1513",
        panel2: "#141E1B",
        panel3: "#1B2724",
        border: "#22302C",
        border2: "#324640",
        ink: "#ECF2EF",
        muted: "#7E8F89",
        faint: "#54635E",
        amber: "#FF7A3C",
        mint: "#4FE0B0",
        gold: "#FFC24B",
        coral: "#FF5C5C",
        ice: "#7FD8FF",
        violet: "#B69CFF",
      },
      fontFamily: {
        display: ["'Chakra Petch'", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(.34,1.56,.64,1)",
        out: "cubic-bezier(.16,1,.3,1)",
        snap: "cubic-bezier(.22,1,.36,1)",
      },
      keyframes: {
        pulse2: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".3" } },
        blink: { "50%": { opacity: "0" } },
        corepulse: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".55" } },
      },
      animation: {
        pulse2: "pulse2 1.4s infinite",
        blink: "blink 1s steps(1) infinite",
        corepulse: "corepulse 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
