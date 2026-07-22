"use client";

import { useMemo, useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Plus, X, ArrowRight, ArrowLeft, Ticket } from "lucide-react";
import { t } from "@/lib/i18n";
import { useCortex } from "@/lib/store";
import type { WorkflowStatus, WorkflowTicket } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import ViewHeader from "../ViewHeader";

const COLUMNS: { key: WorkflowStatus; labelKey: string; color: string }[] = [
  { key: "open", labelKey: "workflowsOpen", color: "#FF7A3C" },
  { key: "progress", labelKey: "workflowsProgress", color: "#FFC24B" },
  { key: "done", labelKey: "workflowsDone", color: "#4FE0B0" },
];

const SOURCE_LABEL: Record<WorkflowTicket["source"], string> = {
  reason: "From Reason",
  compliance: "From Compliance",
  manual: "Manual",
};

export default function Workflows() {
  const lang = useCortex((s) => s.lang);
  const workflows = useCortex((s) => s.workflows);
  const moveWorkflow = useCortex((s) => s.moveWorkflow);
  const reorderStatus = useCortex((s) => s.reorderStatus);
  const removeWorkflow = useCortex((s) => s.removeWorkflow);
  const addWorkflow = useCortex((s) => s.addWorkflow);
  const [draft, setDraft] = useState("");

  const byStatus = useMemo(() => {
    const m: Record<WorkflowStatus, WorkflowTicket[]> = { open: [], progress: [], done: [] };
    for (const w of workflows) m[w.status].push(w);
    return m;
  }, [workflows]);

  const addManual = () => {
    const title = draft.trim();
    if (!title) return;
    addWorkflow({ type: "Task", title, fields: {} }, "manual");
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ViewHeader
        title={t(lang, "workflows")}
        sub="Every reasoning answer and compliance deviation can become a real ticket here — drag to reorder, move across stages."
      />
      <div className="flex-1 overflow-auto p-5.5">
        <div className="mb-4 flex max-w-xl items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addManual()}
            placeholder={t(lang, "addTask")}
            className="flex-1 rounded-lg border border-border2 bg-panel2 px-3.5 py-2.5 text-sm outline-none transition-all focus:-translate-y-px focus:border-amber focus:shadow-[0_0_0_3px_rgba(255,122,60,0.12)]"
          />
          <button
            onClick={addManual}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-border2 bg-panel2 text-muted transition-all hover:border-amber hover:text-amber active:scale-90"
          >
            <Plus size={17} />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.key} className="rounded-2xl border border-border bg-panel p-3.5">
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className="h-2 w-2 rounded-full" style={{ background: col.color }} />
                <span className="font-display text-[13px] font-semibold">{t(lang, col.labelKey)}</span>
                <span className="ml-auto font-mono text-[11px] text-faint">{byStatus[col.key].length}</span>
              </div>

              {byStatus[col.key].length === 0 && (
                <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-faint">
                  {t(lang, "noTickets")}
                </div>
              )}

              <Reorder.Group
                axis="y"
                values={byStatus[col.key]}
                onReorder={(ordered) => reorderStatus(col.key, ordered.map((w) => w.id))}
                className="grid gap-2.5"
              >
                {byStatus[col.key].map((w) => (
                  <Reorder.Item
                    key={w.id}
                    value={w}
                    className="cursor-grab rounded-xl border border-border2 bg-panel2 p-3.5 active:cursor-grabbing"
                    whileDrag={{ scale: 1.03, boxShadow: "0 14px 40px rgba(0,0,0,0.45)", zIndex: 10 }}
                  >
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-panel3 px-1.5 py-0.5 font-mono text-[9px] text-muted">
                        <Ticket size={10} /> {w.type}
                      </span>
                      <button onClick={() => removeWorkflow(w.id)} className="text-faint transition-colors hover:text-coral">
                        <X size={13} />
                      </button>
                    </div>
                    <div className="text-[13px] font-medium leading-snug">{w.title}</div>
                    {Object.keys(w.fields).length > 0 && (
                      <div className="mt-2 grid gap-0.5">
                        {Object.entries(w.fields).slice(0, 2).map(([k, v]) => (
                          <div key={k} className="truncate text-[11px] text-muted">
                            <span className="text-faint">{k}:</span> {v}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-faint">{SOURCE_LABEL[w.source]} · {timeAgo(w.createdAt)}</span>
                      <div className="flex gap-1">
                        {col.key !== "open" && (
                          <button
                            onClick={() => moveWorkflow(w.id, col.key === "done" ? "progress" : "open")}
                            className="rounded border border-border2 p-1 text-faint transition-colors hover:border-ice hover:text-ice"
                            title={t(lang, "moveBack")}
                          >
                            <ArrowLeft size={12} />
                          </button>
                        )}
                        {col.key !== "done" && (
                          <button
                            onClick={() => moveWorkflow(w.id, col.key === "open" ? "progress" : "done")}
                            className="rounded border border-border2 p-1 text-faint transition-colors hover:border-mint hover:text-mint"
                            title={col.key === "open" ? t(lang, "moveToProgress") : t(lang, "moveToDone")}
                          >
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
