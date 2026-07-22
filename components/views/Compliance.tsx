"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileCheck2, ShieldAlert } from "lucide-react";
import { DOCS } from "@/lib/data";
import { t } from "@/lib/i18n";
import { useCortex } from "@/lib/store";
import ViewHeader from "../ViewHeader";
import { Button } from "../ui/button";

export default function Compliance() {
  const lang = useCortex((s) => s.lang);
  const addWorkflow = useCortex((s) => s.addWorkflow);
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  const overdue = useMemo(() => DOCS.filter((d) => d.meta.toLowerCase().includes("overdue")), []);
  const openIncidents = useMemo(() => DOCS.filter((d) => d.type === "Incident" && /open/i.test(d.snippet)), []);
  const regulations = useMemo(() => DOCS.filter((d) => d.type === "Regulation"), []);
  const deviations = [...overdue, ...openIncidents];

  const score = Math.max(0, Math.min(100, 100 - overdue.length * 15 - openIncidents.length * 10));
  const scoreColor = score >= 80 ? "#4FE0B0" : score >= 55 ? "#FFC24B" : "#FF5C5C";

  // regulation "at risk" if any deviation's snippet references it loosely (demo heuristic)
  const regAtRisk = (regId: string) => {
    if (regId === "REG-FACT-40B") return overdue.length > 0;
    if (regId === "REG-OISD-105") return openIncidents.length > 0;
    return false;
  };

  const generate = (id: string, title: string, meta: string) => {
    addWorkflow(
      {
        type: "Compliance Evidence Pack",
        title: `Evidence pack · ${title}`,
        fields: { Record: id, Status: meta, Generated: new Date().toLocaleDateString() },
      },
      "compliance"
    );
    setGenerated((s) => new Set(s).add(id));
  };

  // gauge geometry — semicircle arc
  const R = 74;
  const CIRC = Math.PI * R;
  const dash = (score / 100) * CIRC;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ViewHeader
        title={t(lang, "compliance")}
        sub="Live audit posture computed from the same corpus Cortex reasons over — OISD, Factory Act 1948, and your inspection & incident records."
      />
      <div className="flex-1 overflow-auto p-5.5">
        <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
          {/* Score gauge */}
          <div className="rounded-2xl border border-border bg-panel p-5">
            <div className="font-mono text-[10px] tracking-wide text-faint">{t(lang, "complianceScore").toUpperCase()}</div>
            <div className="mt-3 flex justify-center">
              <svg viewBox="0 0 200 120" width="220">
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1B2724" strokeWidth="14" strokeLinecap="round" />
                <motion.path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  initial={{ strokeDashoffset: CIRC }}
                  animate={{ strokeDashoffset: CIRC - dash }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                />
                <text x="100" y="92" textAnchor="middle" className="font-display" fontSize="34" fontWeight={700} fill="#ECF2EF">
                  {score}
                </text>
                <text x="100" y="110" textAnchor="middle" fontSize="10" fill="#7E8F89" fontFamily="'JetBrains Mono', monospace">
                  / 100
                </text>
              </svg>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-border bg-panel2 py-2">
                <div className="font-display text-lg font-bold text-coral">{deviations.length}</div>
                <div className="font-mono text-[9.5px] text-faint">{t(lang, "deviations").toUpperCase()}</div>
              </div>
              <div className="rounded-lg border border-border bg-panel2 py-2">
                <div className="font-display text-lg font-bold text-ice">{regulations.length}</div>
                <div className="font-mono text-[9.5px] text-faint">{t(lang, "regulations").toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* Deviations + regs */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-panel p-5">
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-wide text-faint">
                <ShieldAlert size={13} className="text-coral" /> OPEN DEVIATIONS
              </div>
              {deviations.length === 0 && <div className="text-sm text-muted">{t(lang, "noDeviations")}</div>}
              <div className="grid gap-2.5">
                {deviations.map((d) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-coral/25 bg-bg px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] font-semibold text-bg">{d.type}</span>
                        <span className="truncate text-[13px] font-medium">{d.title}</span>
                      </div>
                      <div className="mt-1 truncate text-[11.5px] text-muted">{d.meta}</div>
                    </div>
                    <Button
                      size="sm"
                      variant={generated.has(d.id) ? "subtle" : "outline"}
                      onClick={() => generate(d.id, d.title, d.meta)}
                      className="flex-none"
                    >
                      {generated.has(d.id) ? <><CheckCircle2 size={13} /> Added</> : <><FileCheck2 size={13} /> {t(lang, "generateEvidence")}</>}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-panel p-5">
              <div className="mb-3 font-mono text-[10px] tracking-wide text-faint">REGULATIONS TRACKED</div>
              <div className="grid gap-2">
                {regulations.map((r) => {
                  const atRisk = regAtRisk(r.id);
                  return (
                    <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-panel2 px-3.5 py-2.5">
                      <div className="min-w-0">
                        <div className="truncate text-[12.5px] font-medium">{r.title}</div>
                        <div className="mt-0.5 truncate text-[11px] text-muted">{r.snippet.slice(0, 100)}…</div>
                      </div>
                      <span
                        className="flex-none rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold"
                        style={atRisk ? { borderColor: "#FF5C5C", color: "#FF5C5C" } : { borderColor: "#4FE0B0", color: "#4FE0B0" }}
                      >
                        {atRisk ? "AT RISK" : "COMPLIANT"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
