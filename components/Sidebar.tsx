"use client";

import { motion } from "framer-motion";
import { Sparkles, Waypoints, Layers3, FileStack, ShieldCheck, ListChecks, Users } from "lucide-react";
import { t } from "@/lib/i18n";
import { useCortex } from "@/lib/store";
import type { View } from "./AppShell";

const NAV: { key: View; icon: React.ElementType; labelKey: string }[] = [
  { key: "reason", icon: Sparkles, labelKey: "copilot" },
  { key: "graph", icon: Waypoints, labelKey: "graph" },
  { key: "twin", icon: Layers3, labelKey: "twin" },
  { key: "docs", icon: FileStack, labelKey: "docs" },
  { key: "compliance", icon: ShieldCheck, labelKey: "compliance" },
  { key: "workflows", icon: ListChecks, labelKey: "workflows" },
  { key: "agents", icon: Users, labelKey: "agents" },
];

export default function Sidebar({ view, setView }: { view: View; setView: (v: View) => void }) {
  const lang = useCortex((s) => s.lang);

  return (
    <nav className="relative z-[6] flex w-[74px] flex-col items-center gap-1.5 border-r border-border bg-panel py-3.5">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = view === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className="relative z-[1] flex h-[54px] w-[58px] flex-col items-center justify-center gap-1 rounded-[10px]"
            style={{ color: active ? "#FF7A3C" : "#7E8F89" }}
          >
            {active && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute inset-0 -z-10 rounded-[10px] border border-border2 bg-panel3 shadow-[0_0_18px_rgba(255,122,60,0.12)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Icon size={20} strokeWidth={1.6} />
            <span className="text-[8px] tracking-tight">{t(lang, item.labelKey)}</span>
          </button>
        );
      })}
      <div className="flex-1" />
      <div className="mb-1.5 flex flex-col items-center gap-1 font-mono text-[8px] tracking-widest text-mint opacity-80">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
        </svg>
        <span>PWA</span>
      </div>
    </nav>
  );
}
