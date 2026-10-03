import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { Trophy, Zap, Star, Hexagon, Target, Swords, Gem, Crown, Atom } from "lucide-react";
import { cn } from "@/lib/utils";

const tokens = ["H", "X", "CX", "|0⟩", "|1⟩", "Z", "M", "Y", "|ψ⟩", "+250XP", "T", "S", "LVL 7", "COMBO ×3", "E=ℏω", "|+⟩", "GG", "QUBIT"];

/** Fixed game backdrop: drifting gate tokens, loot props, orbit rings, Bloch spheres, cursor glow, scan line. */
export function GameBackdrop() {
  const glow = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (glow.current) glow.current.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
    };
    const scroll = () => setScrollY(window.scrollY);
    window.addEventListener("pointermove", move);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("scroll", scroll); };
  }, []);

  const props = [
    { Icon: Trophy, left: "6%", top: "18%", size: 44, dur: 7, delay: 0, tint: "text-warning/50" },
    { Icon: Zap, left: "88%", top: "14%", size: 38, dur: 6, delay: -2, tint: "text-cyan/60" },
    { Icon: Star, left: "14%", top: "68%", size: 30, dur: 8, delay: -4, tint: "text-warning/45" },
    { Icon: Hexagon, left: "80%", top: "58%", size: 52, dur: 9, delay: -1, tint: "text-primary/35" },
    { Icon: Target, left: "46%", top: "82%", size: 40, dur: 7, delay: -5, tint: "text-primary/40" },
    { Icon: Swords, left: "68%", top: "30%", size: 42, dur: 8, delay: -3, tint: "text-primary-deep/35" },
    { Icon: Gem, left: "30%", top: "40%", size: 30, dur: 6, delay: -6, tint: "text-cyan/55" },
    { Icon: Crown, left: "56%", top: "8%", size: 36, dur: 9, delay: -2.5, tint: "text-warning/40" },
    { Icon: Atom, left: "92%", top: "78%", size: 46, dur: 10, delay: -4.5, tint: "text-primary/35" },
    { Icon: Zap, left: "4%", top: "46%", size: 26, dur: 5.5, delay: -1.5, tint: "text-cyan/50" },
  ];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* cursor glow */}
      <div ref={glow} className="absolute left-0 top-0 size-[500px] rounded-full bg-primary/15 blur-3xl transition-transform duration-300 ease-out" />
      {/* scan line */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cyan/20 to-transparent scan-line" />
      {/* orbit rings with satellites */}
      <div className="absolute -right-32 top-24 size-[480px] rounded-full border-2 border-primary/25 animate-spin [animation-duration:60s]" style={{ translate: `0 ${scrollY * -0.15}px` }}>
        <span className="absolute left-1/2 top-0 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan shadow-[0_0_16px_var(--cyan)]" />
        <span className="absolute bottom-6 left-10 size-2.5 rounded-full bg-primary" />
      </div>
      <div className="absolute -left-40 bottom-0 size-[540px] rounded-full border-2 border-dashed border-primary/25 animate-spin [animation-duration:90s] [animation-direction:reverse]" style={{ translate: `0 ${scrollY * 0.1}px` }}>
        <span className="absolute bottom-10 right-16 size-3 rounded-full bg-primary shadow-[0_0_14px_var(--primary)]" />
      </div>
      {/* Bloch sphere wireframes */}
      <div className="absolute right-[12%] top-[38%] size-40 rounded-full border border-cyan/40 float-slow" style={{ translate: `0 ${scrollY * -0.06}px` }}>
        <div className="absolute inset-3 rounded-full border border-cyan/30" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-cyan/30" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-cyan/30" />
        <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan quantum-pulse" />
      </div>
      <div className="absolute left-[10%] top-[32%] size-24 rounded-full border border-primary/35 float-slow [animation-delay:-2.5s]" style={{ translate: `0 ${scrollY * 0.05}px` }}>
        <div className="absolute inset-x-0 top-1/2 h-px bg-primary/30" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-primary/30" />
      </div>
      {/* game loot props */}
      {props.map(({ Icon, left, top, size, dur, delay, tint }, i) => (
        <Icon key={i} className={cn("absolute bob", tint)} style={{ left, top, width: size, height: size, animationDuration: `${dur}s`, animationDelay: `${delay}s`, translate: `0 ${scrollY * (i % 2 ? -0.07 : 0.05)}px`, filter: "drop-shadow(0 0 10px currentColor)" }} strokeWidth={1.6} />
      ))}
      {/* rising XP particles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={`p${i}`} className="absolute bottom-0 size-1.5 rounded-full bg-cyan/70 rise" style={{ left: `${6 + i * 9.5}%`, animationDuration: `${7 + (i % 4) * 2}s`, animationDelay: `${i * -1.3}s` }} />
      ))}
      {/* drifting gate chips */}
      {tokens.map((t, i) => (
        <span key={i} className="absolute font-mono text-sm font-bold text-primary/45 drift"
          style={{ left: `${(i * 29) % 96}%`, top: `${(i * 41) % 94}%`, animationDelay: `${i * -1.7}s`, animationDuration: `${14 + (i % 5) * 3}s`, translate: `0 ${scrollY * (i % 2 ? -0.08 : 0.05)}px` }}>
          <span className="rounded-md border border-primary/35 bg-card/70 px-2.5 py-1 shadow-sm backdrop-blur-sm">{t}</span>
        </span>
      ))}
    </div>
  );
}

/** Thin XP-style scroll progress bar under the header. */
export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => { const h = document.documentElement.scrollHeight - innerHeight; setP(h > 0 ? scrollY / h : 0); };
    on(); addEventListener("scroll", on, { passive: true }); return () => removeEventListener("scroll", on);
  }, []);
  return <div className="fixed left-0 top-16 z-50 h-0.5 bg-gradient-to-r from-primary to-cyan transition-[width] duration-150" style={{ width: `${p * 100}%` }} />;
}

/** Reveal-on-scroll wrapper. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={cn("transition-all duration-700 ease-out", shown ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-[2px]", className)}>{children}</div>;
}

/** 3D tilt card with glare that follows the pointer. */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-3px)`;
    el.style.setProperty("--gx", `${x * 100}%`); el.style.setProperty("--gy", `${y * 100}%`);
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={reset} className={cn("group/tilt relative transition-transform duration-200 ease-out will-change-transform", className)}>
      {children}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity group-hover/tilt:opacity-100" style={{ background: "radial-gradient(circle at var(--gx,50%) var(--gy,50%), color-mix(in oklab, var(--cyan) 22%, transparent), transparent 55%)" }} />
    </div>
  );
}

/** Count-up number when scrolled into view. */
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return; io.disconnect();
      const start = performance.now();
      const tick = (t: number) => { const k = Math.min(1, (t - start) / 1400); setV(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    io.observe(el); return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{Number.isInteger(to) ? Math.round(v).toLocaleString() : v.toFixed(1)}{suffix}</span>;
}
