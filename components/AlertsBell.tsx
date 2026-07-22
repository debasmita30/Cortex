"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, TriangleAlert } from "lucide-react";
import { DOCS, EQUIPMENT } from "@/lib/data";
import { t } from "@/lib/i18n";
import { useCortex } from "@/lib/store";

interface AlertItem {
  id: string;
  label: string;
  detail: string;
  level: "alarm" | "warn";
}

export default function AlertsBell({ onSelect }: { onSelect: (query: string) => void }) {
  const [open, setOpen] = useState(false);
  const lang = useCortex((s) => s.lang);

  const alerts: AlertItem[] = useMemo(() => {
    const fromEquipment: AlertItem[] = EQUIPMENT.filter((e) => e.status !== "ok").map((e) => ({
      id: e.tag,
      label: `${e.tag} — ${e.name}`,
      detail: e.status === "alarm" ? `In alarm · ${e.val}` : `Warning trend · ${e.val}`,
      level: e.status as "alarm" | "warn",
    }));
    const fromDocs: AlertItem[] = DOCS.filter((d) => d.meta.toLowerCase().includes("overdue")).map((d) => ({
      id: d.id,
      label: d.title,
      detail: d.meta,
      level: "warn",
    }));
    return [...fromEquipment, ...fromDocs];
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border2 bg-panel2 text-muted transition-colors duration-200 hover:border-coral hover:text-coral"
      >
        <Bell size={16} />
        {alerts.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-coral px-1 font-mono text-[9px] font-bold text-white">
            {alerts.length}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-11 z-50 w-80 origin-top-right rounded-xl border border-border2 bg-panel2 p-1.5 shadow-2xl"
              initial={{ opacity: 0, scale: 0.93, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: -6 }}
              transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div className="px-3 py-2 font-mono text-[9.5px] tracking-wider text-faint">
                LIVE ALERTS · {alerts.length}
              </div>
              {alerts.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-muted">{t(lang, "noAlerts")}</div>
              )}
              {alerts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => { onSelect(`What is the risk and required action for ${a.id}?`); setOpen(false); }}
                  className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-start transition-colors hover:bg-panel3"
                >
                  <TriangleAlert size={14} className={a.level === "alarm" ? "mt-0.5 flex-none text-coral" : "mt-0.5 flex-none text-gold"} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-medium text-ink">{a.label}</div>
                    <div className="truncate text-[11px] text-muted">{a.detail}</div>
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
