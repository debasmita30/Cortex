"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { useCortex } from "@/lib/store";
import Logo from "./Logo";
import PlantSwitcher from "./PlantSwitcher";
import AlertsBell from "./AlertsBell";
import LanguagePicker from "./LanguagePicker";

export default function Header({ onAlertQuery }: { onAlertQuery: (q: string) => void }) {
  const lang = useCortex((s) => s.lang);
  const [risk, setRisk] = useState(62);

  useEffect(() => {
    const id = setInterval(() => setRisk((r) => Math.max(48, Math.min(74, r + (Math.random() * 6 - 3)))), 2200);
    return () => clearInterval(id);
  }, []);
  const rc = risk > 68 ? "#FF5C5C" : risk > 58 ? "#FFC24B" : "#4FE0B0";

  return (
    <header className="relative z-10 flex items-center gap-3 border-b border-border bg-panel px-4 py-3">
      <Logo />
      <div>
        <div className="bg-gradient-to-r from-ink to-amber bg-clip-text font-display text-lg font-bold tracking-[3px] text-transparent">
          CORTEX
        </div>
        <div className="mt-0.5 text-[10.5px] text-muted">{t(lang, "tagline")}</div>
      </div>
      <div className="flex-1" />
      <div className="hidden items-center gap-2 rounded-lg border border-border2 bg-panel2 px-3 py-1.5 md:flex">
        <span className="font-mono text-[10px] text-faint">{t(lang, "riskIndex").toUpperCase()}</span>
        <div className="h-[5px] w-[58px] overflow-hidden rounded-full bg-panel3">
          <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${risk}%`, background: rc }} />
        </div>
        <span className="font-mono text-[11px]" style={{ color: rc }}>{Math.round(risk)}</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-border2 bg-panel2 px-3 py-1.5">
        <span className="h-[7px] w-[7px] animate-pulse2 rounded-full bg-mint" />
        <span className="font-mono text-[10.5px] tracking-wide text-mint">{t(lang, "online")}</span>
      </div>
      <PlantSwitcher />
      <AlertsBell onSelect={onAlertQuery} />
      <LanguagePicker />
    </header>
  );
}
