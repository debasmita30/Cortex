"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ClipboardPlus } from "lucide-react";
import { AGENT_BY_ID, DOC_BY_ID } from "@/lib/data";
import { t } from "@/lib/i18n";
import { useCortex } from "@/lib/store";
import type { ReasonAnswer } from "@/lib/types";
import { Button } from "./ui/button";

function renderMD(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={j} className="text-ink">{p.slice(2, -2)}</strong>
      ) : (
        <span key={j}>{p}</span>
      )
    );
    return <div key={i} className="mb-1.5">{parts}</div>;
  });
}

export default function AnswerCard({ data, streaming }: { data: ReasonAnswer; streaming?: boolean }) {
  const lang = useCortex((s) => s.lang);
  const addWorkflow = useCortex((s) => s.addWorkflow);
  const [added, setAdded] = useState(false);
  const conf = Math.round((data.confidence || 0) * 100);
  const cc = conf >= 80 ? "#4FE0B0" : conf >= 60 ? "#FFC24B" : "#FF5C5C";

  const full = data.answer || "";
  const [shown, setShown] = useState(streaming ? "" : full);
  useEffect(() => {
    if (!streaming) { setShown(full); return; }
    let i = 0;
    const tk = full.split(/(\s+)/);
    const id = setInterval(() => {
      i++;
      setShown(tk.slice(0, i).join(""));
      if (i >= tk.length) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [full, streaming]);

  return (
    <motion.div
      className="rounded-2xl border border-border bg-panel p-5"
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] tracking-wide text-faint">{t(lang, "agentsFired").toUpperCase()}</span>
        {data.agents.map((id) => {
          const a = AGENT_BY_ID[id];
          if (!a) return null;
          return (
            <span key={id} className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10.5px] font-medium" style={{ borderColor: a.color, color: a.color }}>
              <span className="h-[7px] w-[7px] rounded-full" style={{ background: a.color }} />
              {a.name}
            </span>
          );
        })}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-faint">{t(lang, "confidence").toUpperCase()}</span>
          <div className="h-[5px] w-14 overflow-hidden rounded-full bg-panel3">
            <div className="h-full transition-all duration-700 ease-out" style={{ width: `${conf}%`, background: cc }} />
          </div>
          <span className="font-mono text-xs" style={{ color: cc }}>{conf}%</span>
        </div>
      </div>

      <div className="text-sm leading-relaxed text-ink">{renderMD(shown)}</div>

      {data.workflow?.type && (
        <div className="mt-4 rounded-xl border border-amber/25 bg-bg p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ClipboardPlus size={15} className="text-amber" />
              <span className="font-mono text-[10px] tracking-wide text-amber">
                {t(lang, "generated").toUpperCase()} · {data.workflow.type}
              </span>
            </div>
            <Button
              size="sm"
              variant={added ? "subtle" : "outline"}
              onClick={() => { if (!added && data.workflow) { addWorkflow(data.workflow, "reason"); setAdded(true); } }}
            >
              {added ? <><CheckCircle2 size={13} /> {t(lang, "addedToWorkflows")}</> : t(lang, "addToWorkflows")}
            </Button>
          </div>
          <div className="mb-2 font-display text-sm font-semibold">{data.workflow.title}</div>
          <div className="grid grid-cols-[auto,1fr] gap-x-3.5 gap-y-1.5 text-[12.5px]">
            {Object.entries(data.workflow.fields).map(([k, v]) => (
              <span key={k} className="contents">
                <span className="font-mono text-[11px] text-muted">{k}</span>
                <span>{v}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {data.citations.length > 0 && (
        <div className="mt-3.5 border-t border-border pt-3">
          <div className="mb-2 font-mono text-[10px] tracking-wide text-faint">{t(lang, "sources").toUpperCase()}</div>
          <div className="grid gap-1.5">
            {data.citations.map((cid) => {
              const isUpload = cid.startsWith("UPLOADED");
              const d = DOC_BY_ID[cid];
              return (
                <div key={cid} className="flex items-start gap-2.5 rounded-lg border border-border bg-panel2 p-2.5 transition-transform duration-200 hover:translate-x-0.5">
                  <span className="flex-none rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold text-bg" style={{ background: isUpload ? "#4FE0B0" : "#7E8F89" }}>
                    {isUpload ? "UPLOAD" : d?.type ?? "REF"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-medium">{isUpload ? cid.replace("UPLOADED:", "") : d?.title ?? cid}</div>
                    {d && <div className="mt-0.5 truncate text-[11.5px] text-muted">{d.snippet.slice(0, 116)}…</div>}
                  </div>
                  {!isUpload && <span className="flex-none whitespace-nowrap font-mono text-[10.5px] text-faint">{cid}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
