"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LANGS } from "@/lib/i18n";
import { useCortex } from "@/lib/store";
import BootScreen from "./BootScreen";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Reason from "./views/Reason";
import NeuralMap from "./views/NeuralMap";
import Twin from "./views/Twin";
import Sources from "./views/Sources";
import Compliance from "./views/Compliance";
import Workflows from "./views/Workflows";
import Agents from "./views/Agents";

export type View = "reason" | "graph" | "twin" | "docs" | "compliance" | "workflows" | "agents";

export default function AppShell() {
  const [booting, setBooting] = useState(true);
  const [view, setView] = useState<View>("reason");
  const [highlight, setHighlight] = useState<string[]>([]);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const lang = useCortex((s) => s.lang);
  const rtl = LANGS.find((l) => l.code === lang)?.rtl ?? false;

  useEffect(() => {
    // Never blocks first paint: boot is a cosmetic overlay only.
    const t = setTimeout(() => setBooting(false), 3200);
    return () => clearTimeout(t);
  }, []);

  const askAndSwitch = (q: string) => {
    setPendingQuery(q);
    setView("reason");
  };

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="relative flex min-h-screen flex-col bg-bg text-ink">
      <AnimatePresence>{booting && <BootScreen onDone={() => setBooting(false)} />}</AnimatePresence>

      <Header onAlertQuery={askAndSwitch} />

      <div className="flex min-h-0 flex-1">
        <Sidebar view={view} setView={setView} />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              className="flex min-h-0 flex-1 flex-col"
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -7 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {view === "reason" && (
                <Reason
                  setHighlight={setHighlight}
                  pendingQuery={pendingQuery}
                  clearPending={() => setPendingQuery(null)}
                />
              )}
              {view === "graph" && <NeuralMap highlight={highlight} />}
              {view === "twin" && <Twin onAsk={askAndSwitch} />}
              {view === "docs" && <Sources />}
              {view === "compliance" && <Compliance />}
              {view === "workflows" && <Workflows />}
              {view === "agents" && <Agents />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
