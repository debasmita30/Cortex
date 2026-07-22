"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { GRAPH, NODE_COLOR } from "@/lib/data";
import { t } from "@/lib/i18n";
import { useCortex } from "@/lib/store";
import ViewHeader from "../ViewHeader";

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
}
interface SimLink extends d3.SimulationLinkDatum<SimNode> {}

const W = 900;
const H = 560;

export default function NeuralMap({ highlight }: { highlight: string[] }) {
  const lang = useCortex((s) => s.lang);
  const svgRef = useRef<SVGSVGElement>(null);
  const hoverRef = useRef<string | null>(null);
  const restyleRef = useRef<() => void>(() => {});
  const highlightRef = useRef<string[]>(highlight);

  useEffect(() => { highlightRef.current = highlight; restyleRef.current(); }, [highlight]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const svg = d3.select<SVGSVGElement, unknown>(el);
    svg.selectAll("*").remove();
    const root = svg.append("g");

    const nodes: SimNode[] = GRAPH.nodes.map((n) => ({
      ...n,
      x: W / 2 + (Math.random() - 0.5) * 40,
      y: H / 2 + (Math.random() - 0.5) * 40,
    }));
    const links: SimLink[] = GRAPH.edges.map(([s, tt]) => ({ source: s, target: tt }));

    const sim = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(92).strength(0.55))
      .force("charge", d3.forceManyBody().strength(-260))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collide", d3.forceCollide(30));

    const linkSel = root.append("g").selectAll("line").data(links).join("line")
      .attr("stroke", "#324640").attr("stroke-width", 1);

    const nodeSel = root.append("g").selectAll<SVGGElement, SimNode>("g").data(nodes, (d) => d.id).join("g")
      .style("cursor", "grab");

    nodeSel.append("circle").attr("class", "ring").attr("r", 16).attr("fill", (d) => NODE_COLOR[d.type]).attr("opacity", 0).style("pointer-events", "none");
    nodeSel.append("circle").attr("class", "dot").attr("r", 7).attr("fill", "#0E1513").attr("stroke", (d) => NODE_COLOR[d.type]).attr("stroke-width", 2);
    nodeSel.append("text").attr("y", -15).attr("text-anchor", "middle").attr("font-size", 11).attr("fill", "#7E8F89")
      .style("font-family", "'JetBrains Mono', monospace").text((d) => d.label);

    nodeSel
      .on("mouseenter", (_ev, d) => { hoverRef.current = d.id; restyle(); })
      .on("mouseleave", () => { hoverRef.current = null; restyle(); })
      .call(
        d3.drag<SVGGElement, SimNode>()
          .on("start", (ev, d) => { if (!ev.active) sim.alphaTarget(0.25).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag", (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
          .on("end", (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    sim.on("tick", () => {
      linkSel
        .attr("x1", (d) => (d.source as SimNode).x!).attr("y1", (d) => (d.source as SimNode).y!)
        .attr("x2", (d) => (d.target as SimNode).x!).attr("y2", (d) => (d.target as SimNode).y!);
      nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.55, 2.2]).on("zoom", (ev) => root.attr("transform", ev.transform.toString()));
    svg.call(zoom).on("dblclick.zoom", null);

    function restyle() {
      const hi = new Set(highlightRef.current || []);
      const hover = hoverRef.current;
      linkSel
        .transition().duration(260).ease(d3.easeCubicOut)
        .attr("stroke", (d) => {
          const sId = (d.source as SimNode).id ?? (d.source as unknown as string);
          const tId = (d.target as SimNode).id ?? (d.target as unknown as string);
          const on = (hi.has(sId) && hi.has(tId)) || (!!hover && (sId === hover || tId === hover));
          return on ? "#FF7A3C" : "#324640";
        })
        .attr("stroke-width", (d) => {
          const sId = (d.source as SimNode).id ?? (d.source as unknown as string);
          const tId = (d.target as SimNode).id ?? (d.target as unknown as string);
          const on = (hi.has(sId) && hi.has(tId)) || (!!hover && (sId === hover || tId === hover));
          return on ? 2 : 1;
        });
      nodeSel.each(function (d) {
        const on = hi.has(d.id) || hover === d.id;
        const g = d3.select(this);
        g.select(".dot").transition().duration(260).ease(d3.easeCubicOut).attr("r", on ? 9 : 7).attr("fill", on ? NODE_COLOR[d.type] : "#0E1513");
        g.select(".ring").transition().duration(400).attr("opacity", on ? 0.16 : 0);
        g.select("text").transition().duration(260).attr("fill", on ? "#ECF2EF" : "#7E8F89").style("font-weight", on ? 600 : 400);
      });
    }
    restyleRef.current = restyle;

    return () => { sim.stop(); };
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ViewHeader
        title={t(lang, "graph")}
        sub="Real physics — drag any node, scroll to zoom. Energy flows along the trail your last query reasoned through."
      />
      <motion.div
        className="flex flex-1 items-center justify-center overflow-hidden p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[1020px] cursor-grab active:cursor-grabbing" />
      </motion.div>
      <div className="flex flex-wrap gap-3.5 border-t border-border bg-panel px-5.5 py-2.5">
        {Object.entries(NODE_COLOR).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1.5 text-[11px] capitalize text-muted">
            <span className="h-[9px] w-[9px] rounded-full" style={{ background: c }} /> {k}
          </span>
        ))}
      </div>
    </div>
  );
}
