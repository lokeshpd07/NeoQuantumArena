import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Crown,
  Filter,
  Search,
  SlidersHorizontal,
  Target,
  Trophy,
  Zap,
  X,
  Lightbulb,
  FlaskConical,
} from "lucide-react";
import { useState } from "react";
import { PageShell, PageTitle, Panel } from "@/components/quantum-shell";
import { Button } from "@/components/ui/button";
import { challenges } from "@/data/quantum";
import { cn } from "@/lib/utils";
import { useGameState } from "@/hooks/use-game-state";
import { gameStore } from "@/lib/game-state";

export const Route = createFileRoute("/arena")({
  head: () => ({
    meta: [
      { title: "Challenge Arena — NeoQuantum Arena" },
      { name: "description", content: "Solve ranked quantum circuit and coding challenges." },
    ],
  }),
  component: Arena,
});

function Arena() {
  const state = useGameState();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [activeChallenge, setActiveChallenge] = useState<(typeof challenges)[0] | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [claimed, setClaimed] = useState<string[]>([...state.completedChallenges]);

  const visible = challenges.filter((c) => {
    const matchFilter = filter === "All" || c.difficulty === filter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  function openChallenge(c: typeof challenges[0]) {
    setActiveChallenge(c);
    setShowHint(false);
  }

  function claimXP(title: string, xp: number) {
    gameStore.completeChallenge(title, xp);
    setClaimed((prev) => [...prev, title]);
    setActiveChallenge(null);
  }

  const weeklyTimeLeft = (() => {
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + (7 - now.getDay()));
    sunday.setHours(23, 59, 59);
    const diff = sunday.getTime() - now.getTime();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return `${d}D ${h}H`;
  })();

  return (
    <PageShell>
      <PageTitle
        eyebrow="Ranked missions"
        title="Challenge Arena"
        description="Solve circuits. Optimize solutions. Climb the global ladder."
        action={
          <Button asChild id="find-battle-btn">
            <Link to="/battle"><Zap className="size-4" />Find live battle</Link>
          </Button>
        }
      />

      {/* Challenge detail modal */}
      {activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
            <Panel className="overflow-hidden">
              <div className="flex items-start justify-between border-b border-border p-5">
                <div>
                  <span className={cn(
                    "font-mono text-[10px] font-bold uppercase",
                    activeChallenge.difficulty === "Easy" && "text-success",
                    activeChallenge.difficulty === "Medium" && "text-warning",
                    activeChallenge.difficulty === "Hard" && "text-destructive",
                  )}>
                    {activeChallenge.difficulty} · {activeChallenge.category}
                  </span>
                  <h2 className="mt-1 text-xl font-extrabold">{activeChallenge.title}</h2>
                </div>
                <button onClick={() => setActiveChallenge(null)} className="grid size-8 place-items-center rounded-md hover:bg-accent">
                  <X className="size-4" />
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm leading-6 text-muted-foreground">{activeChallenge.description}</p>
                <div className="mt-4 flex gap-6 font-mono text-xs">
                  <span><b className="block text-lg text-warning">{activeChallenge.xp}</b>XP REWARD</span>
                  <span><b className="block text-lg">{activeChallenge.acceptance}</b>ACCEPTANCE</span>
                </div>

                {showHint && (
                  <div className="mt-4 rounded-md border border-primary/30 bg-accent p-4 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      <Lightbulb className="size-4" /> Hint
                    </div>
                    <p className="mt-2 text-muted-foreground">{activeChallenge.hint}</p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {claimed.includes(activeChallenge.title) ? (
                    <div className="flex w-full items-center justify-center gap-2 rounded-md bg-success/10 py-2 font-semibold text-success">
                      <CheckCircle2 className="size-4" /> Already solved · +{activeChallenge.xp} XP earned
                    </div>
                  ) : (
                    <>
                      <Button
                        id="solve-in-lab-btn"
                        asChild
                        onClick={() => {
                          // Mark as solved when they open the lab
                          claimXP(activeChallenge.title, activeChallenge.xp);
                        }}
                      >
                        <Link to="/lab" search={{ mission: activeChallenge.title, hint: activeChallenge.hint }}>
                          <FlaskConical className="size-4" /> Solve in Lab <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="secondary" id="show-hint-btn" onClick={() => setShowHint(!showHint)}>
                        <Lightbulb className="size-4" /> {showHint ? "Hide" : "Show"} hint
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* Weekly featured challenge */}
      <Panel className="relative overflow-hidden bg-foreground text-background">
        <div className="absolute right-8 top-1/2 hidden size-44 -translate-y-1/2 place-items-center rounded-full border border-cyan/40 md:grid">
          <div className="size-32 rounded-full border border-dashed border-background/30 animate-spin [animation-duration:16s]" />
          <Crown className="absolute size-10 text-warning" />
        </div>
        <div className="relative p-7 md:max-w-[68%] md:p-9">
          <div className="font-mono text-[11px] font-bold uppercase text-cyan">Challenge of the week · #04</div>
          <h2 className="mt-3 text-3xl font-extrabold">Forge a perfect Bell state</h2>
          <p className="mt-3 text-sm leading-6 text-background/65">
            Create maximum entanglement with two qubits using no more than three gates. Submit a circuit with at least 99% fidelity.
          </p>
          <div className="mt-6 flex flex-wrap gap-7 font-mono text-xs">
            <span><b className="block text-lg text-warning">1,200</b>XP REWARD</span>
            <span><b className="block text-lg">{weeklyTimeLeft}</b>TIME LEFT</span>
            <span><b className="block text-lg">2,481</b>SOLVERS</span>
          </div>
          <Button
            asChild
            className="mt-7"
            id="accept-weekly-mission-btn"
            onClick={() => claimXP("Forge a Bell State", 1200)}
          >
            <Link to="/lab" search={{ mission: "Forge a perfect Bell state", hint: "Apply H to q0, then CX(q0→q1). This creates the Bell state (|00⟩+|11⟩)/√2 with ~50% probability each." }}>
              Accept mission <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </Panel>

      {/* Search + filter */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-card px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            id="challenge-search"
            aria-label="Search challenges"
            placeholder="Search challenges…"
            className="h-10 w-full bg-transparent text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {["All", "Easy", "Medium", "Hard"].map((f) => (
            <Button
              key={f}
              size="sm"
              id={`filter-${f}`}
              variant={filter === f ? "default" : "secondary"}
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
          <Button size="icon" variant="secondary" aria-label="More filters">
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      {/* Challenge list */}
      <Panel className="mt-4 overflow-hidden">
        <div className="grid grid-cols-[1fr_90px_80px] gap-4 border-b border-border bg-muted/60 px-5 py-3 font-mono text-[10px] font-bold uppercase text-muted-foreground md:grid-cols-[1fr_110px_100px_100px_120px]">
          <span>Challenge</span>
          <span>Difficulty</span>
          <span>XP</span>
          <span className="hidden md:block">Acceptance</span>
          <span className="hidden md:block">Action</span>
        </div>
        {visible.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No challenges match your search.</div>
        ) : (
          visible.map((c) => {
            const isDone = claimed.includes(c.title);
            return (
              <div
                key={c.title}
                className="grid cursor-pointer grid-cols-[1fr_90px_80px] items-center gap-4 border-b border-border px-5 py-4 last:border-0 hover:bg-accent/40 md:grid-cols-[1fr_110px_100px_100px_120px]"
                onClick={() => openChallenge(c)}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                  ) : (
                    <Target className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <b className="block truncate text-sm">{c.title}</b>
                    <span className="font-mono text-[10px] text-muted-foreground">{c.category}</span>
                  </div>
                </div>
                <span className={cn(
                  "font-mono text-xs font-bold",
                  c.difficulty === "Easy" && "text-success",
                  c.difficulty === "Medium" && "text-warning",
                  c.difficulty === "Hard" && "text-destructive",
                )}>
                  {c.difficulty}
                </span>
                <span className="font-mono text-xs text-primary">+{c.xp}</span>
                <span className="hidden font-mono text-xs text-muted-foreground md:block">{c.acceptance}</span>
                <Button
                  size="sm"
                  variant={isDone ? "secondary" : "secondary"}
                  className="hidden md:inline-flex"
                  id={`solve-${c.title.replace(/\s/g, "-")}`}
                  onClick={(e) => { e.stopPropagation(); openChallenge(c); }}
                >
                  {isDone ? "Review" : "Solve"}
                </Button>
              </div>
            );
          })
        )}
      </Panel>

      {/* Bottom stats */}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Panel className="flex items-center gap-4 p-5">
          <Trophy className="size-7 text-warning" />
          <div>
            <b className="block">Silver III</b>
            <span className="text-xs text-muted-foreground">Current division</span>
          </div>
        </Panel>
        <Panel className="flex items-center gap-4 p-5">
          <Clock3 className="size-7 text-primary" />
          <div>
            <b className="block">{claimed.length} solved</b>
            <span className="text-xs text-muted-foreground">Of {challenges.length} challenges</span>
          </div>
        </Panel>
        <Panel className="flex items-center gap-4 p-5">
          <Filter className="size-7 text-success" />
          <div>
            <b className="block">{claimed.length > 0 ? Math.round((claimed.length / challenges.length) * 100) : 0}% solved</b>
            <span className="text-xs text-muted-foreground">Arena completion</span>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}