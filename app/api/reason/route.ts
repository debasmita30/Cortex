import { NextRequest, NextResponse } from "next/server";
import { AGENTS, DOCS, EQUIPMENT, GRAPH } from "@/lib/data";
import type { UploadedDoc } from "@/lib/types";

export const runtime = "nodejs";

interface ReqBody {
  query: string;
  langName: string;
  attachments?: UploadedDoc[];
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server. Add it in your Vercel project settings or .env.local." },
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

  const corpus = DOCS.map((d) => `[${d.id}] (${d.type}) ${d.title} — ${d.snippet}`).join("\n");
  const equip = EQUIPMENT.map((e) => `${e.tag}: ${e.name} (${e.area}, crit ${e.crit}, ${e.status})`).join("; ");
  const hasFiles = !!attachments?.length;


  const system = `You are CORTEX, a multi-agent Industrial Knowledge Intelligence system for a fictional Indian plant "Bharat Heavy Industries — Vizag Integrated Steel & Petrochem Complex". Reason across the corpus and connect signals no single team member would.

EQUIPMENT: ${equip}
CORPUS:
${corpus}
${hasFiles ? 'The user has ALSO uploaded document(s), attached to this message. Read them and use their content; you may cite them as "UPLOADED:<filename>".\n' : ""}Agent ids: ${AGENTS.map((a) => a.id).join(", ")}
Graph node ids (connections): ${GRAPH.nodes.map((n) => n.id).join(", ")}
Citation ids: ${DOCS.map((d) => d.id).join(", ")}${hasFiles ? ", UPLOADED:<filename>" : ""}

HOW TO ANSWER — read carefully:
1. If the question relates to the plant, its equipment, documents, procedures, or compliance, AND the corpus/uploaded files contain relevant material: answer grounded in that material, set "citations" to the matching ids, and set "connections"/"agents" to whichever are actually relevant.
2. If the question relates to the plant but the corpus has NOTHING relevant: say plainly that no matching plant document was found, then still give your best answer from general engineering/industrial knowledge. Leave "citations" empty. Lower "confidence" accordingly (e.g. 0.4–0.6), but never refuse outright.
3. If the question is general knowledge, casual conversation, math, or anything unrelated to the plant (e.g. "2+2?", "what are you building?", "what is Python?"): just answer it directly and naturally using your own knowledge. Do NOT mention the corpus, do NOT say you "couldn't find" anything, set "citations": [], "connections": [], "agents": [] (or a single relevant agent if truly applicable), and "confidence" around 0.9+.
4. NEVER return a bare "I couldn't find a confident answer" with no actual content. Every response must contain a real, useful answer.

Reply ONLY with minified JSON, no markdown fences, no commentary before or after it:
{"confidence":0-1,"agents":[...],"connections":[...],"reasoning":["terse step",...max6],"answer":"in ${langName}, may use **bold** and newlines","workflow":{"type":"","title":"","fields":{}},"citations":[...]}
The "answer" MUST be in ${langName}. Keep under ~700 tokens.`;

  const content: Record<string, unknown>[] = [{ type: "text", text: query }];
  (attachments || []).forEach((a) => {
    if (a.kind === "pdf") {
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: a.data } });
    } else {
      content.push({ type: "image", source: { type: "base64", media_type: a.media_type || "image/png", data: a.data } });
    }
  });

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 1000,
        response_format: {
        type: "json_object"
    },
    messages: [
        {
            role: "system",
            content: system,
        },
        {
            role: "user",
            content: query,
        },
    ],
      }),

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Anthropic API error (${res.status}): ${errText}` }, { status: 502 });
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("");

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
        // fall through to final fallback
      }
    }

    return {
      confidence: 0.5,
      agents: [],
      connections: [],
      reasoning: ["Model response was not valid JSON; showing raw output."],
      answer: cleaned || "The model returned an empty response. Please try rephrasing your question.",
      workflow: { type: "", title: "", fields: {} },
      citations: [],
    };
  }
}
