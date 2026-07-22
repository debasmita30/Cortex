export default function Logo({ size = 34 }: { size?: number }) {
  const pts: [number, number][] = [[12, 13], [32, 13], [11, 30], [31, 31], [22, 10]];
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <defs>
        <radialGradient id="cortex-logo-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC24B" />
          <stop offset="100%" stopColor="#FF7A3C" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="40" height="40" rx="11" fill="#141E1B" stroke="#324640" />
      <g stroke="url(#cortex-logo-grad)" strokeWidth="1.5" opacity="0.9">
        <line x1="22" y1="22" x2="12" y2="13" />
        <line x1="22" y1="22" x2="32" y2="13" />
        <line x1="22" y1="22" x2="11" y2="30" />
        <line x1="22" y1="22" x2="31" y2="31" />
        <line x1="22" y1="22" x2="22" y2="10" />
      </g>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.3" fill="#4FE0B0" className="animate-pulse2" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
      <circle cx="22" cy="22" r="4" fill="url(#cortex-logo-grad)" className="animate-corepulse" />
    </svg>
  );
}
