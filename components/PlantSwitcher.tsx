"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Factory } from "lucide-react";
import { PLANTS } from "@/lib/data";
import { useCortex } from "@/lib/store";

export default function PlantSwitcher() {
  const [open, setOpen] = useState(false);
  const plantId = useCortex((s) => s.plantId);
  const setPlantId = useCortex((s) => s.setPlantId);
  const plant = PLANTS.find((p) => p.id === plantId) ?? PLANTS[0];

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border2 bg-panel2 px-3 py-1.5 transition-colors duration-200 hover:border-amber/60"
      >
        <Factory size={14} className="text-amber" />
        <span className="max-w-[160px] truncate text-xs text-ink">{plant.name}</span>
        <ChevronDown size={12} className="text-muted" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-11 z-50 w-72 origin-top-right rounded-xl border border-border2 bg-panel2 p-1.5 shadow-2xl"
              initial={{ opacity: 0, scale: 0.93, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: -6 }}
              transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="px-3 py-2 font-mono text-[9.5px] tracking-wider text-faint">YOUR PLANTS</div>
              {PLANTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPlantId(p.id); setOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start transition-colors hover:bg-panel3"
                  style={{ background: p.id === plantId ? "#1B2724" : "transparent" }}
                >
                  <span
                    className="h-2 w-2 flex-none rounded-full"
                    style={{ background: p.status === "active" ? "#4FE0B0" : "#54635E" }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium" style={{ color: p.id === plantId ? "#FF7A3C" : "#ECF2EF" }}>
                      {p.name}
                    </div>
                    <div className="truncate text-[11px] text-muted">
                      {p.location}
                      {p.status === "onboarding" ? " · onboarding — corpus not yet ingested" : ""}
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
