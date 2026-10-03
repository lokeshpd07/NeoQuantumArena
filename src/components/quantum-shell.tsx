import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, BookOpen, FlaskConical, Gauge, Menu, Radio, Swords, Trophy, X, Zap } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GameBackdrop, ScrollProgress } from "@/components/quantum-motion";
import { useGameState } from "@/hooks/use-game-state";

const navigation = [
  { to: "/dashboard", label: "HQ", icon: Gauge },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/lab", label: "Lab", icon: FlaskConical },
  { to: "/arena", label: "Arena", icon: Zap },
  { to: "/battle", label: "Battle", icon: Swords },
  { to: "/leaderboard", label: "Ranks", icon: Trophy },
] as const;

export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-bold text-foreground">
      <span className="relative grid size-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-[0_3px_0_var(--primary-deep)]">
        <span className="absolute size-4 rounded-full border border-primary-foreground/70" />
        <span className="size-1.5 rounded-full bg-primary-foreground" />
      </span>
      <span className="text-base tracking-normal">NeoQuantum <span className="text-primary">Arena</span></span>
    </Link>
  );
}

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const gameState = useGameState();
  const unread = gameState.notifications.filter((n) => !n.read).length;
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-7 px-4 md:px-7">
        <Brand />
        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {navigation.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", pathname === to && "bg-accent text-primary")}>
              <Icon className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-4 sm:flex">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold">
            <Zap className="size-4 text-warning" />{gameState.streak} day streak
          </div>
          <div className="h-7 w-px bg-border" />
          <Link to="/dashboard" aria-label="Notifications" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="size-5"/>
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-destructive font-mono text-[9px] text-white">{unread}</span>
            )}
          </Link>
          <Link to="/dashboard" className="grid size-9 place-items-center rounded-md bg-foreground font-mono text-xs font-bold text-background">LP</Link>
        </div>
        <Button aria-label="Open menu" variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</Button>
      </div>
      {open && <nav className="grid grid-cols-2 gap-2 border-t border-border bg-background p-4 lg:hidden">{navigation.map(({to,label,icon:Icon}) => <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-md bg-card p-3 text-sm font-semibold"><Icon className="size-4 text-primary"/>{label}</Link>)}</nav>}
    </header>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <><GameBackdrop /><AppHeader /><ScrollProgress /><main className="relative mx-auto min-h-[calc(100vh-4rem)] max-w-[1500px] px-4 py-6 md:px-7 md:py-8 animate-in fade-in slide-in-from-bottom-2 duration-500">{children}</main></>;
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end"><div><div className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase text-primary"><Radio className="size-3.5"/>{eyebrow}</div><h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p></div>{action}</div>;
}

export function Stat({ label, value, detail, accent = false }: { label: string; value: string; detail: string; accent?: boolean }) {
  return <div className={cn("border-l-2 border-border pl-4", accent && "border-primary")}><div className="font-mono text-[11px] font-bold uppercase text-muted-foreground">{label}</div><div className="mt-1 text-2xl font-extrabold">{value}</div><div className="text-xs text-muted-foreground">{detail}</div></div>;
}

export function Panel({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-md border border-border bg-card/95 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--primary)_35%,transparent)]", className)} {...props}>{children}</section>;
}

export function ProgressBar({ value }: { value: number }) {
  return <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${value}%` }} /></div>;
}