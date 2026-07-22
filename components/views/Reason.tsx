"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Paperclip, ScanLine, Mic, ArrowRight, FileText, UploadCloud } from "lucide-react";
import { DEMO, pickDemo, PROVENANCE } from "@/lib/data";
import { t } from "@/lib/i18n";
import { useCortex } from "@/lib/store";
import { sleep } from "@/lib/utils";
import type { ReasonAnswer, UploadedDoc } from "@/lib/types";
import ThreeField from "../ThreeField";
import ReasoningTrace, { type TraceState } from "../ReasoningTrace";
import AnswerCard from "../AnswerCard";
import { Button } from "../ui/button";

type ChatMsg =
  | { role: "user"; text: string; files: string[] }
  | { role: "assistant"; data: ReasonAnswer; streaming: boolean };

const SR_LOCALES: Record<string, string> = {
  hi: "hi-IN", bn: "bn-IN", ta: "ta-IN", te: "te-IN", mr: "mr-IN", gu: "gu-IN",
  kn: "kn-IN", ml: "ml-IN", pa: "pa-IN", ur: "ur-IN", ar: "ar-SA", zh: "zh-CN",
  es: "es-ES", fr: "fr-FR", de: "de-DE", pt: "pt-BR", ru: "ru-RU",
};

async function askBrain(query: string, langName: string, attachments: UploadedDoc[]): Promise<ReasonAnswer> {
  const res = await fetch("/api/reason", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, langName, attachments }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as ReasonAnswer;
}

export default function Reason({
  setHighlight,
  pendingQuery,
  clearPending,
}: {
  setHighlight: (ids: string[]) => void;
  pendingQuery: string | null;
  clearPending: () => void;
}) {
  const lang = useCortex((s) => s.lang);
  const uploads = useCortex((s) => s.uploads);
  const addUpload = useCortex((s) => s.addUpload);
  const removeUpload = useCortex((s) => s.removeUpload);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [trace, setTrace] = useState<TraceState | null>(null);
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const recogRef = useRef<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pendingQuery) { run(pendingQuery); clearPending(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuery]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages, trace]);

  const onFiles = (files: FileList | null) => {
    Array.from(files || []).forEach((f) => {
      if (f.size > 6 * 1024 * 1024) { setNote(`"${f.name}" is over 6 MB — use a smaller file for the demo.`); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = String(reader.result).split(",")[1];
        addUpload({ name: f.name, media_type: f.type, kind: f.type === "application/pdf" ? "pdf" : "image", data: b64 });
        setNote("");
      };
      reader.readAsDataURL(f);
    });
  };

  const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); dragCounter.current++; if (e.dataTransfer.types.includes("Files")) setDragging(true); };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); dragCounter.current--; if (dragCounter.current <= 0) { dragCounter.current = 0; setDragging(false); } };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); dragCounter.current = 0; setDragging(false); onFiles(e.dataTransfer.files); };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setNote("Live mic needs a browser with Web Speech (Chrome). Production should route voice through Bhashini/Sarvam so it also works on iPhone."); return; }
    try {
      const r = new SR();
      recogRef.current = r;
      r.lang = SR_LOCALES[lang] || "en-IN";
      r.interimResults = true;
      r.continuous = false;
      r.onresult = (e: any) => setInput(Array.from(e.results).map((x: any) => x[0].transcript).join(""));
      r.onend = () => setListening(false);
      r.onerror = (e: any) => {
        setListening(false);
        if (e.error === "not-allowed" || e.error === "service-not-allowed") setNote("Microphone permission was blocked.");
      };
      setListening(true); setNote(""); r.start();
    } catch { setListening(false); setNote("Voice unavailable in this browser."); }
  };
  const stopVoice = () => { try { recogRef.current?.stop(); } catch {} setListening(false); };

  async function run(qText?: string) {
    const q = (qText ?? input).trim();
    if (!q || busy) return;
    stopVoice();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q, files: uploads.map((u) => u.name) }]);
    setBusy(true);

    const langName = lang; // API resolves display name server-side via prompt only; pass code is fine for prompting
    const live = askBrain(q, langName, uploads).catch(() => null);
    const demo = pickDemo(q);
    const plan = demo?.agents ?? ["router", "retrieval", "reasoning", "synthesis"];
    setTrace({ agents: plan, step: 0, reasoning: [] });
    setHighlight([]);

    for (let i = 0; i < plan.length; i++) {
      await sleep(340);
      setTrace((tr) => (tr ? { ...tr, step: i + 1 } : tr));
    }

    const data: ReasonAnswer =
      (await live) ||
      demo || {
        confidence: 0.55,
        agents: plan,
        connections: [],
        reasoning: ["Searched the corpus but found no strong match."],
        answer: "I couldn't find a confident answer in the current corpus. Try P-101, the coke-oven hot-work permit, overdue inspections — or upload a document and ask about it.",
        workflow: null,
        citations: [],
      };

    setHighlight(data.connections || []);
    const steps = data.reasoning || [];
    for (let i = 0; i < steps.length; i++) {
      await sleep(300);
      setTrace((tr) => (tr ? { ...tr, reasoning: steps.slice(0, i + 1) } : tr));
    }
    await sleep(240);
    setMessages((m) => [...m, { role: "assistant", data, streaming: true }]);
    setTrace(null);
    setBusy(false);
  }

  const empty = messages.length === 0 && !trace;
  const samples = DEMO.map((d) => d.q);
  const steps3: [string, string, string, React.ElementType][] = [
    ["s1t", "s1d", "#7FD8FF", UploadCloud],
    ["s2t", "s2d", "#4FE0B0", Sparkline],
    ["s3t", "s3d", "#FF7A3C", CheckAction],
  ];

  return (
    <div
      className="relative flex h-full flex-col"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {dragging && (
        <motion.div
          className="absolute inset-2 z-30 flex items-center justify-center rounded-2xl border-2 border-dashed border-mint bg-bg/85 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex flex-col items-center gap-2.5 font-display text-[15px] font-semibold text-mint">
            <UploadCloud size={34} />
            <div>{t(lang, "drop")}</div>
          </div>
        </motion.div>
      )}

      <div ref={scroller} className="relative flex-1 overflow-y-auto">
        {empty && (
          <div className="relative">
            <ThreeField variant="ambient" density={0.7} />
            <div className="relative mx-auto max-w-[820px] px-6 pb-6 pt-[7vh]">
              <div className="mb-5 inline-block rounded-md border border-border2 bg-panel2 px-2.5 py-1 font-mono text-[9.5px] tracking-wide text-mint">
                ◆ ET AI HACKATHON · PROBLEM 8 · UNIFIED OPERATIONS BRAIN
              </div>
              <h1 className="font-display text-[42px] font-bold leading-[1.05] tracking-tight">
                {t(lang, "hero1")}{" "}
                <span className="bg-gradient-to-r from-amber to-gold bg-clip-text text-transparent">{t(lang, "hero2")}</span>
              </h1>
              <p className="mt-4 max-w-[580px] text-[15px] leading-relaxed text-muted">{t(lang, "heroSub")}</p>

              <div className="mt-7">
                <div className="mb-3 font-mono text-[11px] tracking-wide text-amber">{t(lang, "what")}</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {steps3.map(([tk, dk, col, Icon], i) => (
                    <motion.div
                      key={i}
                      className="rounded-xl border border-border bg-panel p-4"
                      whileHover={{ y: -3, borderColor: "#324640" }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border" style={{ color: col, borderColor: col + "55" }}>
                        <Icon size={18} />
                      </div>
                      <div className="mt-3 font-mono text-[10px] text-faint">{String(i + 1).padStart(2, "0")}</div>
                      <div className="mt-0.5 font-display text-base font-semibold">{t(lang, tk)}</div>
                      <div className="mt-1.5 text-xs leading-relaxed text-muted">{t(lang, dk)}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-7 font-mono text-[11px] tracking-wide text-faint">{t(lang, "tryThis").toUpperCase()}</div>
              <div className="mt-3 grid gap-2.5">
                {samples.map((s, i) => (
                  <motion.button
                    key={i}
                    onClick={() => run(s)}
                    className="group flex items-center gap-3.5 rounded-xl border border-border bg-panel px-4 py-3.5 text-start text-[13.5px] leading-snug"
                    whileHover={{ y: -2, borderColor: "#FF7A3C", boxShadow: "0 10px 34px rgba(0,0,0,.4), 0 0 0 1px rgba(255,122,60,.3)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 340, damping: 26 }}
                  >
                    <span className="flex-none font-mono text-xs text-mint">0{i + 1}</span>
                    <span className="flex-1">{s}</span>
                    <ArrowRight size={16} className="flex-none text-faint transition-transform duration-200 group-hover:translate-x-1 group-hover:text-amber" />
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[9.5px] tracking-wide text-faint">GROUNDED IN REAL SOURCES</span>
                {PROVENANCE.map((p) => (
                  <span key={p} className="rounded-md border border-border2 bg-panel2 px-2.5 py-1 font-mono text-[10.5px] text-muted">{p}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={empty ? "px-6 pb-5" : "px-6 py-5"}>
          {messages.map((m, i) => (
            <div key={i} className="mx-auto mb-5 max-w-[830px]">
              {m.role === "user" ? (
                <div className="ml-auto w-fit max-w-[80%] rounded-[12px] rounded-br-[4px] border border-border2 bg-gradient-to-br from-panel3 to-panel2 px-4 py-2.5 text-sm leading-relaxed">
                  {m.files.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {m.files.map((f) => (
                        <span key={f} className="inline-flex items-center gap-1 rounded-md border border-border2 bg-panel px-2 py-0.5 font-mono text-[10px]">
                          <FileText size={11} /> {f}
                        </span>
                      ))}
                    </div>
                  )}
                  {m.text}
                </div>
              ) : (
                <AnswerCard data={m.data} streaming={m.streaming} />
              )}
            </div>
          ))}
          {trace && (
            <div className="mx-auto mb-5 max-w-[830px]">
              <ReasoningTrace lang={lang} trace={trace} />
            </div>
          )}
        </div>
      </div>

      {uploads.length > 0 && (
        <div className="mx-auto flex w-full max-w-[882px] flex-wrap items-center gap-2 px-6 pt-2">
          <span className="font-mono text-[10px] tracking-wide text-faint">{t(lang, "ingested").toUpperCase()}</span>
          {uploads.map((u) => (
            <span key={u.name} className="inline-flex items-center gap-1.5 rounded-md border border-border2 bg-panel px-2 py-1 font-mono text-[11px]">
              <FileText size={12} className="text-mint" /> {u.name}
              <button className="pl-0.5 text-faint hover:text-coral" onClick={() => removeUpload(u.name)}>×</button>
            </span>
          ))}
        </div>
      )}
      {note && <div className="mx-auto mt-1.5 max-w-[830px] px-6 font-mono text-[11.5px] text-gold">{note}</div>}

      <div className="mt-2 border-t border-border bg-panel px-6 py-3.5">
        <input ref={fileRef} type="file" accept="application/pdf,image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <div className="mx-auto flex max-w-[830px] items-end gap-2">
          <Button variant="ghost" size="icon" title={t(lang, "attach")} onClick={() => fileRef.current?.click()}>
            <Paperclip size={18} />
          </Button>
          <Button variant="ghost" size="icon" title={t(lang, "scan")} onClick={() => camRef.current?.click()}>
            <ScanLine size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={t(lang, "voice")}
            onClick={() => (listening ? stopVoice() : startVoice())}
            className={listening ? "border-coral bg-coral text-white shadow-[0_0_18px_rgba(255,92,92,0.5)]" : ""}
          >
            {listening ? <MicWave /> : <Mic size={18} />}
          </Button>
          <textarea
            rows={1}
            value={input}
            placeholder={listening ? t(lang, "listening") : t(lang, "ask")}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(); } }}
            className="max-h-[120px] flex-1 resize-none rounded-[11px] border border-border2 bg-panel2 px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition-all duration-200 placeholder:text-faint focus:border-amber focus:shadow-[0_0_0_3px_rgba(255,122,60,0.13)]"
          />
          <Button disabled={busy || !input.trim()} onClick={() => run()} className="min-w-[92px]">
            {busy ? <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-black/25 border-t-[#160c05]" /> : <>{t(lang, "send")} <ArrowRight size={15} /></>}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MicWave() {
  return (
    <span className="flex h-4 items-center gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <motion.i
          key={i}
          className="w-[2.5px] rounded-sm bg-white"
          animate={{ height: [5, 16, 5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

function Sparkline(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a7 7 0 015 12v3H7v-3A7 7 0 0112 3zM9 21h6" />
    </svg>
  );
}
function CheckAction(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}
