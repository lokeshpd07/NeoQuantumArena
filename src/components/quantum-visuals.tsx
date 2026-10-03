import { useMemo } from "react";

export function QuantumCircuit({ active = true, compact = false }: { active?: boolean; compact?: boolean }) {
  return <div className={`relative overflow-hidden rounded-md border border-border bg-foreground p-5 text-background ${compact ? "h-52" : "h-80"}`}>
    <div className="absolute inset-0 opacity-10" style={{backgroundImage:"linear-gradient(var(--background) 1px,transparent 1px),linear-gradient(90deg,var(--background) 1px,transparent 1px)",backgroundSize:"24px 24px"}} />
    <div className="relative flex items-center justify-between font-mono text-[10px] uppercase text-background/60"><span>Bell state // 2 qubits</span><span className="flex items-center gap-2"><span className={`size-2 rounded-full bg-cyan ${active ? "quantum-pulse" : ""}`}/>simulator live</span></div>
    <svg viewBox="0 0 720 250" className="relative mt-3 h-[80%] w-full" aria-label="Animated quantum circuit">
      {[70,150].map((y) => <line key={y} x1="30" y1={y} x2="690" y2={y} stroke="currentColor" opacity=".3" strokeWidth="2" />)}
      <path d="M95 70 H625" stroke="var(--cyan)" strokeWidth="2" strokeDasharray="8 12" className={active ? "circuit-flow" : ""}/>
      <g transform="translate(120 42)"><rect width="56" height="56" rx="5" fill="var(--primary)"/><text x="28" y="36" fill="white" textAnchor="middle" fontSize="23" fontWeight="700">H</text></g>
      <g transform="translate(320 70)"><circle r="9" fill="var(--cyan)"/><line y1="9" y2="80" stroke="var(--cyan)" strokeWidth="3"/><circle cy="80" r="24" fill="none" stroke="var(--cyan)" strokeWidth="3"/><line x1="-16" x2="16" y1="80" y2="80" stroke="var(--cyan)" strokeWidth="3"/><line y1="64" y2="96" stroke="var(--cyan)" strokeWidth="3"/></g>
      <g transform="translate(500 42)"><rect width="56" height="56" rx="28" fill="none" stroke="var(--warning)" strokeWidth="3"/><path d="M12 36 Q28 8 44 36" stroke="var(--warning)" strokeWidth="3" fill="none"/><line x1="28" y1="34" x2="39" y2="18" stroke="var(--warning)" strokeWidth="3"/></g>
      <g transform="translate(595 122)"><rect width="56" height="56" rx="28" fill="none" stroke="var(--warning)" strokeWidth="3"/><path d="M12 36 Q28 8 44 36" stroke="var(--warning)" strokeWidth="3" fill="none"/><line x1="28" y1="34" x2="39" y2="18" stroke="var(--warning)" strokeWidth="3"/></g>
      <text x="30" y="76" fill="currentColor" opacity=".65" fontSize="14">q0</text><text x="30" y="156" fill="currentColor" opacity=".65" fontSize="14">q1</text>
    </svg>
  </div>;
}

export function ProbabilityBars({ running = false }: { running?: boolean }) {
  const values = useMemo(() => running ? [48, 2, 3, 47] : [50, 0, 0, 50], [running]);
  return <div className="flex h-40 items-end gap-3">{values.map((value,i)=><div key={i} className="flex flex-1 flex-col items-center gap-2"><span className="font-mono text-xs font-bold">{value}%</span><div className="relative h-28 w-full overflow-hidden rounded-sm bg-muted"><div className="absolute bottom-0 w-full bg-primary transition-all duration-700" style={{height:`${value*2}%`}}/></div><span className="font-mono text-[10px] text-muted-foreground">{i.toString(2).padStart(2,"0")}</span></div>)}</div>;
}