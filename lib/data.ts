import type { AgentDef, DocRecord, Equipment, GraphNode, Plant, ReasonAnswer } from "./types";

export const EQUIPMENT: Equipment[] = [
  { tag: "P-101", name: "Crude Transfer Pump", area: "Crude Unit", crit: "A", status: "warn", val: "6.2 mm/s" },
  { tag: "P-102", name: "Standby Transfer Pump", area: "Crude Unit", crit: "A", status: "ok", val: "1.1 mm/s" },
  { tag: "CO-BATT-3", name: "Coke Oven Battery 3", area: "Coke Ovens", crit: "A", status: "warn", val: "1040 °C" },
  { tag: "GD-12", name: "Gas Detector 12", area: "Coke Ovens", crit: "A", status: "alarm", val: "38 ppm CO" },
  { tag: "V-204", name: "Naphtha Surge Vessel", area: "Crude Unit", crit: "B", status: "ok", val: "3.4 bar" },
  { tag: "E-330", name: "Feed/Effluent Exchanger", area: "Crude Unit", crit: "B", status: "ok", val: "212 °C" },
  { tag: "COMP-7", name: "Recycle Gas Compressor", area: "Hydro Unit", crit: "A", status: "ok", val: "42 bar" },
  { tag: "TK-901", name: "Crude Storage Tank", area: "Tank Farm", crit: "B", status: "ok", val: "78 %" },
];

export const DOCS: DocRecord[] = [
  { id: "PID-CRUDE-01", type: "P&ID", title: "P&ID — Crude Transfer Loop (P-101/102)", meta: "Rev 7 · 2019", snippet: "P-101 discharges through XV-1011 into header to V-204. Suction strainer S-101 upstream. Mechanical seal Plan 53B. Vibration switch VSH-101 trips at 7.1 mm/s RMS." },
  { id: "WO-2023-0442", type: "Work Order", title: "WO — P-101 Mechanical Seal Replacement", meta: "Closed · Aug 2023", snippet: "Seal failure on P-101 outboard. Root cause: coke fines ingress past degraded strainer S-101. Replaced seal, cleaned strainer. Recommended strainer inspection interval reduced to 90 days. Recommendation NOT actioned in CMMS." },
  { id: "WO-2024-1187", type: "Work Order", title: "WO — P-101 High Vibration Investigation", meta: "Closed · Mar 2024", snippet: "Vibration trend rising 3.4→6.2 mm/s over 6 weeks. Bearing wear suspected. Strainer S-101 dP high (0.9 bar). Signature matches WO-2023-0442." },
  { id: "INSP-P101-Q1", type: "Inspection", title: "Inspection — P-101 Quarterly", meta: "Overdue · due Apr 2024", snippet: "Quarterly mechanical inspection of P-101 incl. strainer dP + seal flush. STATUS: OVERDUE by 96 days. Blocks Factory Act Sec.40B compliance for rotating equipment in hydrocarbon service." },
  { id: "SOP-HW-014", type: "SOP", title: "SOP — Hot Work Permit in Hydrocarbon Areas", meta: "Rev 4", snippet: "Hot work prohibited where LEL > 5% or fixed gas detector in area is in alarm. Requires continuous gas monitoring, standby fire watch, isolation within 15 m radius." },
  { id: "SOP-CSE-006", type: "SOP", title: "SOP — Confined Space Entry", meta: "Rev 6", snippet: "No entry while adjacent unit is under abnormal process conditions. O₂ 19.5–23.5%, H₂S < 10 ppm, CO < 25 ppm, valid isolation certificate required." },
  { id: "INC-2022-COB", type: "Incident", title: "Near-Miss — Coke Oven Gas Release", meta: "Jun 2022", snippet: "During maintenance on CO-BATT-3, GD-12 recorded rising CO while a work permit was active nearby. Pressure warning existed but was not linked to permit control. Corrective action: link gas alarms to active permits. Action OPEN." },
  { id: "REG-OISD-105", type: "Regulation", title: "OISD-STD-105 — Work Permit System", meta: "Standard", snippet: "Hot work and confined-space permits must be cross-checked against real-time area gas readings. Simultaneous hot work + elevated gas in a common area prohibited without written deviation from the unit head." },
  { id: "REG-FACT-40B", type: "Regulation", title: "Factory Act 1948 — Section 40B", meta: "Statutory", snippet: "Safety officer must ensure periodic examination of hazardous plant. Rotating equipment in hydrocarbon service requires documented quarterly mechanical inspection; lapses are a reportable deviation." },
];
export const DOC_BY_ID: Record<string, DocRecord> = Object.fromEntries(DOCS.map((d) => [d.id, d]));

export const GRAPH: { nodes: GraphNode[]; edges: [string, string][] } = {
  nodes: [
    { id: "P-101", label: "P-101", type: "asset" },
    { id: "CO-BATT-3", label: "CO-BATT-3", type: "asset" },
    { id: "GD-12", label: "GD-12", type: "sensor" },
    { id: "S-101", label: "S-101", type: "asset" },
    { id: "WO-2023-0442", label: "WO-2023", type: "doc" },
    { id: "WO-2024-1187", label: "WO-2024", type: "doc" },
    { id: "INSP-P101-Q1", label: "Insp Q1", type: "doc" },
    { id: "INC-2022-COB", label: "INC-2022", type: "incident" },
    { id: "SOP-HW-014", label: "Hot Work SOP", type: "sop" },
    { id: "REG-OISD-105", label: "OISD-105", type: "reg" },
    { id: "REG-FACT-40B", label: "Factory Act 40B", type: "reg" },
    { id: "PERMIT-A", label: "Active Permit", type: "permit" },
  ],
  edges: [
    ["P-101", "S-101"], ["P-101", "WO-2023-0442"], ["P-101", "WO-2024-1187"], ["P-101", "INSP-P101-Q1"],
    ["S-101", "WO-2023-0442"], ["S-101", "WO-2024-1187"], ["INSP-P101-Q1", "REG-FACT-40B"],
    ["WO-2024-1187", "WO-2023-0442"], ["CO-BATT-3", "GD-12"], ["CO-BATT-3", "INC-2022-COB"],
    ["GD-12", "INC-2022-COB"], ["INC-2022-COB", "REG-OISD-105"], ["GD-12", "PERMIT-A"],
    ["PERMIT-A", "SOP-HW-014"], ["SOP-HW-014", "REG-OISD-105"], ["CO-BATT-3", "PERMIT-A"],
  ],
};

export const NODE_COLOR: Record<string, string> = {
  asset: "#FF7A3C", sensor: "#FFC24B", doc: "#7E8F89", incident: "#FF5C5C",
  sop: "#4FE0B0", reg: "#B69CFF", permit: "#7FD8FF",
};

export const AGENTS: AgentDef[] = [
  { id: "router", name: "Router", role: "Plans the query, selects specialists", color: "#7E8F89" },
  { id: "retrieval", name: "Retrieval", role: "Hybrid vector + knowledge-graph search", color: "#7FD8FF" },
  { id: "maintenance", name: "Maintenance & RCA", role: "Work-order history + failure patterns", color: "#FF7A3C" },
  { id: "safety", name: "Safety", role: "Permits, gas readings, hazard interlocks", color: "#FF5C5C" },
  { id: "compliance", name: "Compliance", role: "OISD / Factory Act / PESO mapping", color: "#B69CFF" },
  { id: "reasoning", name: "Reasoning", role: "Connects cross-document signals", color: "#4FE0B0" },
  { id: "synthesis", name: "Synthesis", role: "Answer + citations + workflow", color: "#FFC24B" },
];
export const AGENT_BY_ID: Record<string, AgentDef> = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

export const PROVENANCE = ["OISD-STD-105", "Factory Act 1948", "DGFASLI OSH data", "AI4I 2020 PdM"];

export const PLANTS: Plant[] = [
  { id: "vizag", name: "Vizag Integrated Complex", location: "Visakhapatnam, AP", status: "active" },
  { id: "jamnagar", name: "Jamnagar Refinery North", location: "Jamnagar, GJ", status: "onboarding" },
  { id: "paradip", name: "Paradip EPC Data Centre Site", location: "Paradip, OD", status: "onboarding" },
];

export const DEMO: { match: string[]; q: string; data: ReasonAnswer }[] = [
  {
    match: ["p-101", "p101", "pump", "fail", "recur", "risk"],
    q: "Is Pump P-101 at risk of failing again — and why?",
    data: {
      confidence: 0.91,
      agents: ["router", "retrieval", "maintenance", "compliance", "reasoning", "synthesis"],
      connections: ["P-101", "S-101", "WO-2023-0442", "WO-2024-1187", "INSP-P101-Q1", "REG-FACT-40B"],
      reasoning: [
        "Resolved 'P-101' to Crude Transfer Pump (Criticality A).",
        "Retrieved 2 work orders, 1 P&ID and 1 inspection linked to P-101.",
        "WO-2023-0442 root cause = coke-fines past degraded strainer S-101; the 90-day fix was never entered in the CMMS.",
        "WO-2024-1187 shows the SAME signature returning: strainer dP 0.9 bar, vibration 3.4→6.2 mm/s.",
        "INSP-P101-Q1 is OVERDUE by 96 days — the safeguard that would catch this is inactive.",
        "The overdue inspection also breaches Factory Act Sec.40B for rotating equipment in hydrocarbon service.",
      ],
      answer:
        "**Yes — P-101 is trending toward a repeat failure, and the original root cause was never closed out.**\n\nIn Aug 2023 (WO-2023-0442) the outboard mechanical seal failed due to **coke-fines ingress past a degraded suction strainer (S-101)**. The engineer recommended cutting the strainer inspection interval to 90 days — but that **was never entered into the CMMS**, so the safeguard never took effect.\n\nThe **same failure signature is returning now**: WO-2024-1187 records strainer dP at 0.9 bar and vibration climbing 3.4→6.2 mm/s — the exact 2023 precursor. And the quarterly inspection that would catch it (INSP-P101-Q1) is **overdue by 96 days**, which also puts you in breach of **Factory Act Sec. 40B**.\n\n**Do this now:** clean/replace strainer S-101, complete the overdue inspection, and finally set the 90-day interval in the CMMS.",
      workflow: {
        type: "Maintenance Ticket + RCA",
        title: "PM-Auto · P-101 strainer & seal risk",
        fields: { Asset: "P-101 (Crude Transfer Pump)", Priority: "High — Criticality A", Trigger: "Recurring failure signature vs WO-2023-0442", Actions: "Inspect/replace S-101 · complete INSP-P101-Q1 · set 90-day CMMS interval", Compliance: "Closes Factory Act Sec.40B deviation" },
      },
      citations: ["WO-2023-0442", "WO-2024-1187", "INSP-P101-Q1", "PID-CRUDE-01", "REG-FACT-40B"],
    },
  },
  {
    match: ["hot work", "permit", "coke", "gas", "safe", "co-batt", "issue"],
    q: "Is it safe to issue a hot work permit near Coke Oven Battery 3 now?",
    data: {
      confidence: 0.87,
      agents: ["router", "retrieval", "safety", "compliance", "reasoning", "synthesis"],
      connections: ["CO-BATT-3", "GD-12", "PERMIT-A", "SOP-HW-014", "REG-OISD-105", "INC-2022-COB"],
      reasoning: [
        "Resolved area = Coke Oven Battery 3; found co-located detector GD-12.",
        "GD-12 is currently in ALARM (elevated CO) in the same area.",
        "SOP-HW-014 prohibits hot work where a fixed area detector is in alarm.",
        "OISD-STD-105 prohibits simultaneous hot work + elevated gas without written deviation from the unit head.",
        "INC-2022-COB was a near-miss with this exact combination — its corrective action is still OPEN.",
      ],
      answer:
        "**No — do not issue the hot work permit right now.**\n\nGas detector **GD-12 is currently in alarm** in the same area as Coke Oven Battery 3. Two independent rules block this:\n\n• **SOP-HW-014** — no hot work where a fixed area gas detector is in alarm.\n• **OISD-STD-105** — no simultaneous hot work + elevated gas in a common area without a **written deviation from the unit head**.\n\nThis is not hypothetical: **INC-2022-COB** was a near-miss caused by *exactly* this combination, and its corrective action is **still open**. Clear the alarm and confirm GD-12 is normal before authorising any hot work.",
      workflow: {
        type: "Safety Hold",
        title: "Permit blocked · hot work vs GD-12 alarm",
        fields: { Area: "Coke Oven Battery 3", Blocker: "GD-12 in alarm (CO)", Rules: "SOP-HW-014 · OISD-STD-105", Required: "Written deviation from Unit Head", Precedent: "INC-2022-COB near-miss (OPEN)" },
      },
      citations: ["GD-12", "SOP-HW-014", "REG-OISD-105", "INC-2022-COB"],
    },
  },
  {
    match: ["overdue", "inspection", "compliance", "factory act", "audit"],
    q: "Which overdue inspections put us at risk of a compliance deviation?",
    data: {
      confidence: 0.84,
      agents: ["router", "retrieval", "compliance", "synthesis"],
      connections: ["INSP-P101-Q1", "P-101", "REG-FACT-40B"],
      reasoning: [
        "Filtered inspection records by status = overdue.",
        "INSP-P101-Q1 (P-101 quarterly mechanical) overdue by 96 days.",
        "Mapped to Factory Act Sec.40B for rotating equipment in hydrocarbon service.",
        "Overdue status = reportable deviation ahead of audit.",
      ],
      answer:
        "**One inspection currently creates a reportable deviation.**\n\n**INSP-P101-Q1** — the quarterly mechanical inspection of Crude Transfer Pump P-101 — is **overdue by 96 days**. Under **Factory Act Sec. 40B**, rotating equipment in hydrocarbon service needs a documented quarterly inspection, so this lapse is a **reportable deviation** an auditor would flag on sight.\n\nCompleting it also closes the safety loop on the P-101 strainer/seal trend — doubly worth prioritising.",
      workflow: {
        type: "Compliance Evidence Pack",
        title: "Deviation · INSP-P101-Q1 overdue",
        fields: { Standard: "Factory Act Sec.40B", Asset: "P-101", Overdue: "96 days", Status: "Reportable deviation", Action: "Schedule + document quarterly inspection" },
      },
      citations: ["INSP-P101-Q1", "REG-FACT-40B"],
    },
  },
];

export function pickDemo(q: string): ReasonAnswer | null {
  const s = q.toLowerCase();
  let best: (typeof DEMO)[number] | null = null;
  let bestScore = 0;
  for (const d of DEMO) {
    const score = d.match.reduce((a, k) => (s.includes(k) ? a + 1 : a), 0);
    if (score > bestScore) { best = d; bestScore = score; }
  }
  return bestScore >= 2 && best ? best.data : null;
}
