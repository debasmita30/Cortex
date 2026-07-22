"use client";

import { motion } from "framer-motion";
import { AGENT_BY_ID } from "@/lib/data";
import { t } from "@/lib/i18n";

export interface TraceState {
  agents: string[];
  step: number;
  reasoning: string[];
}

export default function ReasoningTrace({ lang, trace }: { lang: string; trace: TraceState }) {
  return (
    <div className="relative rounded-2xl border border-border2 bg-panel p-5 shadow-[0_0_40px_rgba(255,122,60,0.07)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-[13px] w-[13px] animate-spin rounded-full border-2 border-border2 border-t-amber" />
        <span className="font-mono text-xs text-muted">{t(lang, "thinking")}…</span>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {trace.agents.map((id, i) => {
          const a = AGENT_BY_ID[id];
          const on = i < trace.step;
          return (
            <div
              key={id}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-all duration-300"
              style={{ opacity: on ? 1 : 0.32, borderColor: on ? a.color : "#22302C", color: on ? a.color : "#54635E", boxShadow: on ? `0 0 14px ${a.color}44` : "none" }}
            >
              {on && <span className="h-[7px] w-[7px] rounded-full" style={{ background: a.color }} />}
              {a.name}
            </div>
          );
        })}
      </div>
      {trace.reasoning.map((r, i) => (
        <motion.div
          key={i}
          className="flex gap-2.5 border-t border-dashed border-border py-1.5 text-[13px] leading-relaxed"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="flex-none font-mono text-[11px] text-mint">{String(i + 1).padStart(2, "0")}</span>
          <span>{r}</span>
        </motion.div>
      ))}
    </div>
  );
}
