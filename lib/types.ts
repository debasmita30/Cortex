export interface UploadedDoc {
  name: string;
  media_type: string;
  kind: "pdf" | "image";
  data: string; // base64
}

export interface DocRecord {
  id: string;
  type: string;
  title: string;
  meta: string;
  snippet: string;
}

export interface Equipment {
  tag: string;
  name: string;
  area: string;
  crit: "A" | "B";
  status: "ok" | "warn" | "alarm";
  val: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "asset" | "sensor" | "doc" | "incident" | "sop" | "reg" | "permit";
}

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface WorkflowPayload {
  type: string;
  title: string;
  fields: Record<string, string>;
}

export interface ReasonAnswer {
  confidence: number;
  agents: string[];
  connections: string[];
  reasoning: string[];
  answer: string;
  workflow: WorkflowPayload | null;
  citations: string[];
}

export type WorkflowStatus = "open" | "progress" | "done";

export interface WorkflowTicket extends WorkflowPayload {
  id: string;
  status: WorkflowStatus;
  createdAt: number;
  source: "reason" | "compliance" | "manual";
}

export interface Plant {
  id: string;
  name: string;
  location: string;
  status: "active" | "onboarding";
}
