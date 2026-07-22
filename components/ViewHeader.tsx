export default function ViewHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="border-b border-border px-6 py-4.5">
      <div className="font-display text-[21px] font-semibold tracking-wide">{title}</div>
      <div className="mt-1 max-w-[770px] text-[12.5px] leading-relaxed text-muted">{sub}</div>
    </div>
  );
}
