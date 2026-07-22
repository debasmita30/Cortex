"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Globe } from "lucide-react";
import { LANGS } from "@/lib/i18n";
import { useCortex } from "@/lib/store";

export default function LanguagePicker() {
  const [open, setOpen] = useState(false);
  const lang = useCortex((s) => s.lang);
  const setLang = useCortex((s) => s.setLang);
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  const india = LANGS.filter((l) => l.region === "India");
  const global = LANGS.filter((l) => l.region === "Global");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border2 bg-panel2 px-3 py-1.5 transition-colors duration-200 hover:border-amber/60"
      >
        <Globe size={14} className="text-amber" />
        <span className="text-xs text-ink">{current.native}</span>
        <ChevronDown size={12} className="text-muted" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-11 z-50 max-h-[430px] w-64 origin-top-right overflow-auto rounded-xl border border-border2 bg-panel2 p-1.5 shadow-2xl"
              initial={{ opacity: 0, scale: 0.93, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: -6 }}
              transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {[["INDIA", india], ["GLOBAL", global]].map(([label, list]) => (
                <div key={label as string}>
                  <div className="px-3 py-1.5 pt-2 font-mono text-[9.5px] tracking-wider text-faint">{label as string}</div>
                  {(list as typeof LANGS).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-[13px] transition-colors hover:bg-panel3"
                      style={{ color: l.code === lang ? "#FF7A3C" : "#ECF2EF", background: l.code === lang ? "#1B2724" : "transparent" }}
                    >
                      <span className="w-6 font-mono text-[10px] text-faint">{l.code}</span>
                      <span className="flex-1">{l.native}</span>
                      <span className="text-[11px] text-muted">{l.name}</span>
                    </button>
                  ))}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
