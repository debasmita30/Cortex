"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AGENTS } from "@/lib/data";
import { t } from "@/lib/i18n";
import { useCortex } from "@/lib/store";
import ViewHeader from "../ViewHeader";

const PIPELINE = ["Router", "Retrieval", "Specialists", "Reasoning", "Synthesis"];

export default function Agents() {
  const lang = useCortex((s) => s.lang);
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ViewHeader
        title={t(lang, "agents")}
        sub="A multi-agent architecture — not a single chatbot. The Router dispatches specialists; the Reasoning agent connects what no single agent sees."
      />
      <div className="flex-1 overflow-auto p-5.5">
        <div className="grid max-w-[920px] grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
          {AGENTS.map((a) => (
            <motion.div
              key={a.id}
              className="rounded-xl border border-border bg-panel p-4"
              style={{ borderLeft: `3px solid ${a.color}` }}
              whileHover={{ y: -2, boxShadow: "0 10px 30px rgba(0,0,0,0.34)" }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <div className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: a.color }} />
                <span className="font-display text-[15px] font-semibold">{a.name}</span>
              </div>
              <div className="mt-2 text-[12.5px] leading-relaxed text-muted">{a.role}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 max-w-[920px] rounded-2xl border border-border2 bg-panel p-4.5">
          <span className="font-mono text-[11px] tracking-wide text-amber">PIPELINE</span>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {PIPELINE.map((s, i) => (
              <Fragment key={s}>
                <span className="rounded-md border border-border2 px-3 py-1.5 text-[12.5px] transition-transform hover:-translate-y-px hover:border-amber/60">{s}</span>
                {i < PIPELINE.length - 1 && <ArrowRight size={16} className="text-faint" />}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
