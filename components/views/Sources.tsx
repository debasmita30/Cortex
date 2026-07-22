"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DOCS } from "@/lib/data";
import { t } from "@/lib/i18n";
import { useCortex } from "@/lib/store";
import ViewHeader from "../ViewHeader";

export default function Sources() {
  const lang = useCortex((s) => s.lang);
  const uploads = useCortex((s) => s.uploads);
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const types = useMemo(() => ["All", ...Array.from(new Set(DOCS.map((d) => d.type)))], []);
  const list = DOCS.filter(
    (d) => (type === "All" || d.type === type) && (d.title + d.snippet + d.id).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ViewHeader
        title={t(lang, "docs")}
        sub={`${DOCS.length + uploads.length} records ingested — P&IDs, work orders, SOPs, inspections, incidents, regulations, and anything you upload. Every answer cites back to these.`}
      />
      <div className="flex flex-wrap gap-2.5 border-b border-border bg-panel px-5.5 py-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter records…"
          className="min-w-[180px] flex-1 rounded-lg border border-border2 bg-panel2 px-3 py-2 text-[13px] outline-none transition-all focus:-translate-y-px focus:border-amber focus:shadow-[0_0_0_3px_rgba(255,122,60,0.12)]"
        />
        {types.map((tp) => (
          <button
            key={tp}
            onClick={() => setType(tp)}
            className="rounded-md border px-3 py-1.5 text-xs transition-transform hover:-translate-y-px active:scale-95"
            style={{ borderColor: type === tp ? "#FF7A3C" : "#324640", color: type === tp ? "#FF7A3C" : "#7E8F89" }}
          >
            {tp}
          </button>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5 overflow-auto p-5.5">
        {uploads.map((u) => (
          <motion.div
            key={u.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border p-4"
            style={{ borderColor: "#4FE0B066" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-mint px-1.5 py-0.5 font-mono text-[9px] font-semibold text-bg">UPLOAD</span>
              <span className="font-mono text-[10.5px] text-faint">{u.kind}</span>
            </div>
            <div className="font-display text-[13.5px] font-semibold">{u.name}</div>
            <div className="mt-1.5 text-xs text-muted">Ingested by you — Cortex reasons over this alongside the plant corpus.</div>
          </motion.div>
        ))}
        {list.map((d) => (
          <div key={d.id} className="rounded-xl border border-border bg-panel p-4 transition-all duration-200 hover:border-border2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.32)]">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] font-semibold text-bg">{d.type}</span>
              <span className="font-mono text-[10.5px] text-faint">{d.id}</span>
              <div className="flex-1" />
              <span className="text-[10.5px] text-muted">{d.meta}</span>
            </div>
            <div className="font-display text-[13.5px] font-semibold">{d.title}</div>
            <div className="mt-1.5 text-xs leading-relaxed text-muted">{d.snippet}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
