"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UploadedDoc, WorkflowPayload, WorkflowStatus, WorkflowTicket } from "./types";

interface CortexState {
  lang: string;
  setLang: (l: string) => void;

  plantId: string;
  setPlantId: (id: string) => void;

  uploads: UploadedDoc[];
  addUpload: (u: UploadedDoc) => void;
  removeUpload: (name: string) => void;

  workflows: WorkflowTicket[];
  addWorkflow: (w: WorkflowPayload, source: WorkflowTicket["source"]) => void;
  moveWorkflow: (id: string, status: WorkflowStatus) => void;
  reorderStatus: (status: WorkflowStatus, orderedIds: string[]) => void;
  removeWorkflow: (id: string) => void;
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useCortex = create<CortexState>()(
  persist(
    (set) => ({
      lang: "en",
      setLang: (l) => set({ lang: l }),

      plantId: "vizag",
      setPlantId: (id) => set({ plantId: id }),

      uploads: [],
      addUpload: (u) => set((s) => ({ uploads: [...s.uploads, u] })),
      removeUpload: (name) => set((s) => ({ uploads: s.uploads.filter((x) => x.name !== name) })),

      workflows: [],
      addWorkflow: (w, source) =>
        set((s) => ({
          workflows: [
            { ...w, id: uid(), status: "open", createdAt: Date.now(), source },
            ...s.workflows,
          ],
        })),
      moveWorkflow: (id, status) =>
        set((s) => ({ workflows: s.workflows.map((w) => (w.id === id ? { ...w, status } : w)) })),
      reorderStatus: (status, orderedIds) =>
        set((s) => {
          const others = s.workflows.filter((w) => w.status !== status);
          const inStatus = orderedIds
            .map((id) => s.workflows.find((w) => w.id === id))
            .filter((w): w is WorkflowTicket => !!w);
          return { workflows: [...inStatus, ...others] };
        }),
      removeWorkflow: (id) => set((s) => ({ workflows: s.workflows.filter((w) => w.id !== id) })),
    }),
    { name: "cortex-store" }
  )
);
