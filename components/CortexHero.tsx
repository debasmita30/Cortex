"use client";

import { useEffect, useState } from "react";
import styles from "./CortexHero.module.css";

/**
 * CortexHero
 * ──────────
 * Drop this in where your current hero section lives inside AppShell.tsx:
 *
 *   import CortexHero from "@/components/CortexHero";
 *   ...
 *   <CortexHero onNavigate={switchSection} />
 *
 * `onNavigate` is optional — wire it to whatever function your sidebar
 * already uses to switch sections (e.g. the same handler behind your
 * nav-item onClicks). If you don't pass it, the ticker links just no-op.
 *
 * Nothing here needs new npm installs — plain CSS keyframes only.
 */

const TICKER_LINKS: { label: string; section: string }[] = [
  { label: "Neural Map", section: "graph" },
  { label: "Digital Twin", section: "twin" },
  { label: "Compliance", section: "compliance" },
  { label: "Agents", section: "agents" },
];

// Index of the letter (0-based) in WORD that should render in the
// textured "material" style instead of flat color. 2 = the "R" in CORTEX.
const WORD = "CORTEX";
const TEXTURED_INDEX = 2;

const LOCATION_LABEL = "VIZAG, INDIA";
const LOCATION_TIMEZONE = "Asia/Kolkata";

function useLiveClock(timeZone: string) {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const tick = () => setNow(formatter.format(new Date()).toUpperCase());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeZone]);

  return now;
}

export default function CortexHero({
  onNavigate,
}: {
  onNavigate?: (section: string) => void;
}) {
  const clock = useLiveClock(LOCATION_TIMEZONE);

  return (
    <section>
      {/* ── Live status ticker ─────────────────────────────── */}
      <div className={styles.ticker}>
        <div className={styles.tickerGroup}>
          <span className={styles.tickerDot} />
          <span>{clock || "—"}</span>
          <span>{LOCATION_LABEL}</span>
        </div>
        <div className={styles.tickerGroup}>
          {TICKER_LINKS.map((link) => (
            <button
              key={link.section}
              className={styles.tickerLink}
              onClick={() => onNavigate?.(link.section)}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Kinetic hero ───────────────────────────────────── */}
      <div className={styles.heroWrap}>
        <p className={styles.heroSub}>
          One reasoning brain over every <strong>document</strong>,{" "}
          <strong>asset</strong> and <strong>engineer</strong> — reasoning
          across P&IDs, work orders, SOPs and regulations in real time.
        </p>

        <h1 className={styles.wordmark} aria-label={WORD}>
          {WORD.split("").map((char, i) => (
            <span
              key={i}
              className={
                i === TEXTURED_INDEX
                  ? `${styles.letter} ${styles.letterTextured}`
                  : styles.letter
              }
            >
              {char}
            </span>
          ))}
        </h1>
      </div>
    </section>
  );
}
