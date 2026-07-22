"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DOCS, EQUIPMENT } from "@/lib/data";
import { t } from "@/lib/i18n";
import { useCortex } from "@/lib/store";
import ViewHeader from "../ViewHeader";
import { Button } from "../ui/button";

const STATUS_COLOR: Record<string, string> = { ok: "#4FE0B0", warn: "#FFC24B", alarm: "#FF5C5C" };
const GRID = ["TK-901", "P-101", "P-102", "V-204", "E-330", "COMP-7", "CO-BATT-3", "GD-12"];

function jitter(v: string) {
  const m = v.match(/[\d.]+/);
  if (!m) return v;
  return v.replace(m[0], (parseFloat(m[0]) + (Math.random() * 0.3 - 0.15)).toFixed(1));
}

export default function Twin({ onAsk }: { onAsk: (q: string) => void }) {
  const lang = useCortex((s) => s.lang);
  const [sel, setSel] = useState<string | null>(null);
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((x) => x + 1), 1500); return () => clearInterval(id); }, []);

  const byTag = Object.fromEntries(EQUIPMENT.map((e) => [e.tag, e]));
  const selEq = sel ? byTag[sel] : null;
  const linked = selEq ? DOCS.filter((d) => (d.snippet + d.title).includes(selEq.tag)) : [];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ViewHeader title={t(lang, "twin")} sub="A live blueprint of the complex. Sensors tick in real time; tap any unit to inspect it and ask Cortex." />
      <div className="flex min-h-0 flex-1">
        <div
          className="flex-1 overflow-auto p-6"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#080C0B,#080C0B 27px,#0E1513 28px), repeating-linear-gradient(90deg,#080C0B,#080C0B 27px,#0E1513 28px)",
          }}
        >
          <div className="grid max-w-[720px] grid-cols-4 gap-3.5">
            {GRID.map((tag) => {
              const e = byTag[tag];
              const c = STATUS_COLOR[e.status];
              return (
                <motion.button
                  key={tag}
                  onClick={() => setSel(tag)}
                  className="rounded-[11px] border bg-panel p-3 text-start"
                  style={{ borderColor: sel === tag ? c : "#324640", boxShadow: sel === tag ? `0 0 0 1px ${c}, 0 0 22px ${c}33` : undefined }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 340, damping: 26 }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={"h-[7px] w-[7px] rounded-full" + (e.status === "alarm" ? " animate-pulse2" : "")} style={{ background: c }} />
                    <span className="font-mono text-[13px] font-semibold">{e.tag}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted">{e.name}</div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="font-mono text-[9.5px] text-faint">CRIT {e.crit}</span>
                    <span className="font-mono text-[11px]" style={{ color: c }}>{e.status === "ok" ? e.val : jitter(e.val)}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="w-[300px] overflow-auto border-l border-border bg-panel p-5">
          {!selEq && <div className="mt-5 text-[13px] text-muted">Select equipment to inspect live status, linked records and knowledge.</div>}
          {selEq && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: STATUS_COLOR[selEq.status] }} />
                <span className="font-mono text-base font-semibold">{selEq.tag}</span>
              </div>
              <div className="mt-1.5 text-sm font-medium">{selEq.name}</div>
              <div className="mt-0.5 text-xs text-muted">{selEq.area} · Criticality {selEq.crit} · {selEq.val}</div>
              <Button className="mt-4 w-full justify-between" onClick={() => onAsk(`What is the maintenance and risk status of ${selEq.tag}?`)}>
                Ask Cortex about {selEq.tag} <ArrowRight size={15} />
              </Button>
              <div className="mt-4.5 font-mono text-[10px] tracking-wide text-faint">LINKED RECORDS</div>
              <div className="mt-2 grid gap-1.5">
                {linked.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 rounded-lg border border-border bg-panel2 px-2.5 py-1.5">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] font-semibold text-bg">{d.type}</span>
                    <span className="text-[11.5px]">{d.title}</span>
                  </div>
                ))}
                {linked.length === 0 && <div className="text-xs text-faint">No linked documents indexed yet.</div>}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
