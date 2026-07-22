"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ThreeField from "./ThreeField";
import Logo from "./Logo";

const LINES = [
  "◇ initializing reasoning core",
  "◇ mounting knowledge graph · 12 nodes",
  "◇ agents online · router · retrieval · maintenance · safety · compliance",
  "◇ indexing corpus · OISD · Factory Act 1948 · DGFASLI",
  "◇ system ready",
];

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const stepId = setInterval(() => setStep((s) => Math.min(s + 1, LINES.length)), 500);
    const pctId = setInterval(() => setPct((p) => Math.min(p + Math.random() * 9 + 4, 100)), 130);
    const done = setTimeout(onDone, 2900);
    return () => { clearInterval(stepId); clearInterval(pctId); clearTimeout(done); };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-bg"
      onClick={onDone}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <ThreeField variant="core" density={1.3} />
      <div className="relative max-w-[520px] p-5 text-center">
        <motion.div
          className="mb-3.5 flex justify-center"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Logo size={68} />
        </motion.div>
        <div className="bg-gradient-to-r from-amber to-gold bg-clip-text font-display text-[34px] font-bold tracking-[8px] text-transparent">
          CORTEX
        </div>
        <div className="mt-2 font-mono text-[9.5px] tracking-[3px] text-faint">
          THE REASONING LAYER FOR INDUSTRIAL OPERATIONS
        </div>
        <div className="mx-auto mt-[22px] min-h-[118px] max-w-[430px] text-start font-mono text-[11.5px]">
          {LINES.slice(0, step).map((l, i) => (
            <motion.div
              key={i}
              className="py-0.5"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
            >
              <span className={i === LINES.length - 1 ? "text-mint" : "text-amber"}>{l.slice(0, 1)}</span>
              <span className="text-muted">{l.slice(1)}</span>
              {i === step - 1 && i < LINES.length - 1 && (
                <span className="ml-0.5 animate-blink text-mint">▍</span>
              )}
            </motion.div>
          ))}
        </div>
        <div className="mx-auto mt-[18px] h-[3px] max-w-[430px] overflow-hidden rounded-full bg-panel3">
          <motion.div
            className="h-full bg-gradient-to-r from-amber to-mint"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
        <div className="mt-2 font-mono text-[10px] tracking-wide text-faint">
          {Math.round(pct)}%  ·  tap to skip
        </div>
      </div>
    </motion.div>
  );
}
