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
  const apiKey = process.env.ANTHROPIC_API_KEY;
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
Reply ONLY with minified JSON: {"confidence":0-1,"agents":[...],"connections":[...],"reasoning":["terse step",...max6],"answer":"in ${langName}, may use **bold** and newlines","workflow":{"type":"","title":"","fields":{}},"citations":[...]}
Base every claim on the corpus or uploaded files. The "answer" MUST be in ${langName}. Keep under ~700 tokens.`;

  const content: Record<string, unknown>[] = [{ type: "text", text: query }];
  (attachments || []).forEach((a) => {
    if (a.kind === "pdf") {
      content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: a.data } });
    } else {
      content.push({ type: "image", source: { type: "base64", media_type: a.media_type || "image/png", data: a.data } });
    }
  });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system,
        messages: [{ role: "user", content }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Anthropic API error (${res.status}): ${errText}` }, { status: 502 });
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("");

    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error reaching the reasoning model." },
      { status: 502 }
    );
  }
}
