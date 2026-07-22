
import { NextRequest, NextResponse } from "next/server";
import { AGENTS, DOCS, EQUIPMENT, GRAPH } from "@/lib/data";
import type { UploadedDoc } from "@/lib/types";
 
export const runtime = "nodejs";
 

const MODEL = "deepseek/deepseek-r1-0528:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
 
interface ReqBody {
  query: string;
  langName: string;
  attachments?: UploadedDoc[];
}
 
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "XAI_API_KEY is not configured on the server. Add it in your Vercel project settings (and .env.local for local dev)." },
      { status: 500 }
    );
  }
 
  let body: ReqBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { query, langName, attachments } = body;
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Missing 'query'" }, { status: 400 });
  }
 
  // Images ride along as vision input (OpenAI-compatible image_url format,
  // which Grok's vision models support). PDFs are not a confirmed-reliable
  // input format here, so — same honest approach as the Groq version — say
  // so plainly rather than silently ignoring or guessing at a format.
  const images = (attachments || []).filter((a) => a.kind !== "pdf");
  const pdfs = (attachments || []).filter((a) => a.kind === "pdf");
  const attachmentNote = pdfs.length
    ? `\n\nNote: the user attached ${pdfs.length} PDF(s), but this model configuration cannot read PDF uploads — answer using the corpus/equipment list only, and mention in your answer that PDF reading isn't available right now.`
    : "";
 
  const corpus = DOCS.map((d) => `[${d.id}] (${d.type}) ${d.title} — ${d.snippet}`).join("\n");
  const equip = EQUIPMENT.map((e) => `${e.tag}: ${e.name} (${e.area}, crit ${e.crit}, ${e.status})`).join("; ");
  const hasFiles = images.length > 0;
 
  const system = `You are CORTEX, a multi-agent Industrial Knowledge Intelligence system for a fictional Indian plant "Bharat Heavy Industries — Vizag Integrated Steel & Petrochem Complex". Reason across the corpus and connect signals no single team member would.
 
EQUIPMENT: ${equip}
CORPUS:
${corpus}
${hasFiles ? 'The user has ALSO uploaded image(s), attached to this message. Read them and use their content; you may cite them as "UPLOADED:<filename>".\n' : ""}${attachmentNote}
Agent ids: ${AGENTS.map((a) => a.id).join(", ")}
Graph node ids (connections): ${GRAPH.nodes.map((n) => n.id).join(", ")}
Citation ids: ${DOCS.map((d) => d.id).join(", ")}${hasFiles ? ", UPLOADED:<filename>" : ""}
 
HOW TO ANSWER — read carefully. You must ALWAYS produce a real, helpful answer. Never refuse and never reply with only "I couldn't find a confident answer" or anything equivalent — that response is forbidden.
 
1. If the question relates to the plant, its equipment, documents, procedures, or compliance, AND the corpus/uploaded files contain relevant material: answer grounded in that material, set "citations" to the matching ids, and set "connections"/"agents" to whichever are actually relevant.
2. If the question relates to the plant but the corpus has NOTHING relevant: say plainly, in one short sentence, that no matching plant document was found — then still give your best answer from general engineering/industrial knowledge. Leave "citations" empty. Lower "confidence" accordingly (roughly 0.4–0.6), but never stop at the refusal.
3. If the question is general knowledge, casual conversation, math, or anything unrelated to the plant (e.g. "2+2?", "what are you building?", "what is Python?"): just answer it directly and naturally using your own knowledge. Do NOT mention the corpus, do NOT say you "couldn't find" anything, set "citations": [], "connections": [], "agents": ["router","synthesis"], and "confidence" around 0.9+.
4. Every single response must contain real, useful content in "answer" — never leave it blank or apologetic-only.
 
Reply ONLY with minified JSON, no markdown fences, no commentary before or after it, nothing but the JSON object itself:
{"confidence":0-1,"agents":[...],"connections":[...],"reasoning":["terse step",...max6],"answer":"in ${langName}, may use **bold** and newlines","workflow":{"type":"","title":"","fields":{}},"citations":[...]}
The "answer" MUST be in ${langName}. Keep under ~700 tokens.`;
 
  const userContent: Record<string, unknown>[] = [{ type: "text", text: query }];
  images.forEach((a) => {
    userContent.push({
      type: "image_url",
      image_url: { url: `data:${a.media_type || "image/png"};base64,${a.data}` },
    });
  });
 
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json",Authorization: `Bearer ${apiKey}`,"HTTP-Referer": "http://localhost:3000","X-Title": 
       "CORTEX",
               },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 1200,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent },
        ],
      }),
    });
 
    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Grok API error (${res.status}): ${errText}` }, { status: 502 });
    }
 
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    const parsed = safeParseModelJson(text);
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error reaching the reasoning model." },
      { status: 502 }
    );
  }
}
 
function safeParseModelJson(raw: string) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fall through
      }
    }
    return buildFallback(cleaned || "The model returned an empty response. Please try rephrasing your question.");
  }
}
 
function buildFallback(answerText: string) {
  return {
    confidence: 0.5,
    agents: ["router", "synthesis"],
    connections: [],
    reasoning: ["Model response could not be parsed as structured JSON; showing its reply directly."],
    answer: answerText,
    workflow: null,
    citations: [],
  };
}
 
