import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  Clock3,
  Crosshair,
  Flame,
  Play,
  Radio,
  Shield,
  Swords,
  Users,
  Wifi,
  X,
  Zap,
  FlaskConical,
  Trophy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageShell, PageTitle, Panel, ProgressBar } from "@/components/quantum-shell";
import { Button } from "@/components/ui/button";
import { gameStore } from "@/lib/game-state";
import { useGameState } from "@/hooks/use-game-state";

export const Route = createFileRoute("/battle")({
  head: () => ({
    meta: [
      { title: "Live Battle — NeoQuantum Arena" },
      { name: "description", content: "Enter live one-on-one quantum circuit battles." },
    ],
  }),
  component: Battle,
});

const OPPONENTS = [
  { initials: "AR", name: "Arjun R.", rating: 1506, wins: 31, losses: 14 },
  { initials: "MS", name: "Mira S.", rating: 1550, wins: 45, losses: 18 },
  { initials: "NV", name: "Neel V.", rating: 1470, wins: 22, losses: 20 },
  { initials: "ZR", name: "Zoya R.", rating: 1620, wins: 58, losses: 12 },
];

const BATTLE_MISSIONS = [
  {
    title: "Debug the broken teleporter",
    description: "Repair the circuit in the fewest edits while preserving 98% fidelity.",
    timeLimit: 240,
    xp: 250,
    hint: "The CX gate is misplaced — move it after the H gate.",
  },
  {
    title: "Forge a GHZ state",
    description: "Entangle 3 qubits in the GHZ configuration: (|000⟩+|111⟩)/√2.",
    timeLimit: 300,
    xp: 300,
    hint: "H on q0, then CX(q0,q1), then CX(q0,q2) — or CX(q1,q2).",
  },
  {
    title: "Implement X oracle",
    description: "Mark the |11⟩ state using a Toffoli-like construction. Use H, X, CX.",
    timeLimit: 360,
    xp: 400,
    hint: "CX with both qubits as controls (CCX) flips the target only when both are |1⟩.",
  },
];

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function Battle() {
  const gameState = useGameState();
  const [phase, setPhase] = useState<"idle" | "matching" | "ready" | "playing" | "result">("idle");
  const [matchCountdown, setMatchCountdown] = useState(5);
  const [opponent, setOpponent] = useState(OPPONENTS[0]!);
  const [mission, setMission] = useState(BATTLE_MISSIONS[0]!);
  const [timeLeft, setTimeLeft] = useState(240);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [result, setResult] = useState<"win" | "loss" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Matching countdown
  useEffect(() => {
    if (phase !== "matching") return;
    const t = setInterval(() => {
      setMatchCountdown((s) => {
        if (s <= 1) {
          clearInterval(t);
          setPhase("ready");
          return 0;
        }
        return s - 1;
      });
    }, 600);
    return () => clearInterval(t);
  }, [phase]);

  // Battle timer + AI opponent simulation
  useEffect(() => {
    if (phase !== "playing") { if (timerRef.current) clearInterval(timerRef.current); return; }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time's up — result based on progress
          clearInterval(timerRef.current!);
          const win = playerProgress > opponentProgress;
          setResult(win ? "win" : "loss");
          setPhase("result");
          gameStore.recordBattle(win);
          return 0;
        }
        return t - 1;
      });

      // Simulate opponent progress
      setOpponentProgress((p) => Math.min(100, p + Math.random() * 1.2));
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current!); };
  }, [phase, playerProgress, opponentProgress]);

  function startMatching() {
    const opp = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)]!;
    const mis = BATTLE_MISSIONS[Math.floor(Math.random() * BATTLE_MISSIONS.length)]!;
    setOpponent(opp);
    setMission(mis);
    setMatchCountdown(5);
    setPhase("matching");
  }

  function enterBattle() {
    setTimeLeft(mission.timeLimit);
    setPlayerProgress(0);
    setOpponentProgress(0);
    setResult(null);
    setShowHint(false);
    setPhase("playing");
  }

  function submitSolution() {
    // Simulate player completing — random quality
    const quality = 70 + Math.random() * 30;
    setPlayerProgress(quality);
    setTimeout(() => {
      const win = quality > opponentProgress;
      setResult(win ? "win" : "loss");
      setPhase("result");
      if (timerRef.current) clearInterval(timerRef.current);
      gameStore.recordBattle(win);
      if (win) gameStore.addXP(mission.xp);
    }, 500);
  }

  function reset() {
    setPhase("idle");
    setPlayerProgress(0);
    setOpponentProgress(0);
    setResult(null);
    setTimeLeft(240);
  }

  const winRate = Math.round(
    (gameState.battleWins / Math.max(1, gameState.battleWins + gameState.battleLosses)) * 100
  );

  return (
    <PageShell>
      <PageTitle
        eyebrow="Real-time competition"
        title="Live quantum battle"
        description="Same mission. Same clock. Cleanest circuit wins."
        action={
          <div className="flex items-center gap-2 font-mono text-xs text-success">
            <Wifi className="size-4" /> ARENA ONLINE
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Main battle area */}
        <Panel className="relative min-h-[570px] overflow-hidden bg-foreground text-background">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "linear-gradient(var(--background) 1px,transparent 1px),linear-gradient(90deg,var(--background) 1px,transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative grid h-full min-h-[570px] place-items-center p-7 text-center">
            {/* IDLE */}
            {phase === "idle" && (
              <div className="max-w-md">
                <div className="relative mx-auto grid size-40 place-items-center">
                  <div className="absolute inset-0 rounded-full border border-cyan/40 quantum-pulse" />
                  <div className="absolute inset-5 rounded-full border border-dashed border-background/30 animate-spin [animation-duration:14s]" />
                  <Swords className="size-14 text-cyan" />
                </div>
                <h2 className="mt-7 text-3xl font-extrabold">Ready to duel?</h2>
                <p className="mt-3 text-sm leading-6 text-background/60">
                  We'll find an opponent near your skill rating and reveal the mission when the countdown ends.
                </p>
                <Button size="lg" className="mt-7" id="find-opponent-btn" onClick={startMatching}>
                  <Crosshair className="size-4" /> Find opponent
                </Button>
              </div>
            )}

            {/* MATCHING */}
            {phase === "matching" && (
              <div>
                <div className="mx-auto grid size-36 place-items-center rounded-full border border-cyan/40">
                  <Radio className="size-12 animate-pulse text-cyan" />
                </div>
                <h2 className="mt-7 text-2xl font-extrabold">Scanning the arena…</h2>
                <p className="mt-2 font-mono text-sm text-background/60">
                  Match estimate: {matchCountdown}s
                </p>
                <div className="mx-auto mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-background/15">
                  <div
                    className="h-full bg-cyan transition-all duration-700"
                    style={{ width: `${(5 - matchCountdown) * 20}%` }}
                  />
                </div>
                <Button
                  variant="secondary"
                  className="mt-6"
                  id="cancel-matching-btn"
                  onClick={() => setPhase("idle")}
                >
                  <X className="size-4" /> Cancel
                </Button>
              </div>
            )}

            {/* READY */}
            {phase === "ready" && (
              <div className="w-full max-w-2xl">
                <span className="font-mono text-xs font-bold text-cyan">MATCH FOUND</span>
                <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-5">
                  <PlayerCard initials="LP" name="You" rating={1482} />
                  <div className="font-mono text-2xl font-black text-warning">VS</div>
                  <PlayerCard initials={opponent.initials} name={opponent.name} rating={opponent.rating} />
                </div>
                <div className="mt-8 rounded-md border border-background/20 bg-background/10 p-5 text-left">
                  <div className="flex items-center justify-between">
                    <b>{mission.title}</b>
                    <span className="font-mono text-xs text-warning">{formatTime(mission.timeLimit)}</span>
                  </div>
                  <p className="mt-2 text-sm text-background/60">{mission.description}</p>
                  <span className="mt-2 font-mono text-xs text-cyan">+{mission.xp} XP on win</span>
                </div>
                <Button className="mt-6" id="enter-battle-btn" onClick={enterBattle}>
                  <Zap className="size-4" /> Enter battle room
                </Button>
              </div>
            )}

            {/* PLAYING */}
            {phase === "playing" && (
              <div className="w-full max-w-2xl space-y-5">
                {/* Timer */}
                <div className={`text-center font-mono text-4xl font-black ${timeLeft <= 30 ? "text-destructive animate-pulse" : "text-background"}`}>
                  {formatTime(timeLeft)}
                </div>

                {/* Mission */}
                <div className="rounded-md border border-background/20 bg-background/10 p-4 text-left">
                  <b className="text-sm">{mission.title}</b>
                  <p className="mt-1 text-sm text-background/60">{mission.description}</p>
                  {showHint && (
                    <div className="mt-3 rounded-md bg-primary/20 p-3 text-xs text-primary-foreground">
                      💡 {mission.hint}
                    </div>
                  )}
                </div>

                {/* Progress bars */}
                <div className="grid gap-3 text-left">
                  <div>
                    <div className="mb-1 flex justify-between font-mono text-xs">
                      <span>You</span>
                      <span>{Math.round(playerProgress)}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-background/20">
                      <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${playerProgress}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between font-mono text-xs">
                      <span>{opponent.name}</span>
                      <span>{Math.round(opponentProgress)}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-background/20">
                      <div className="h-full rounded-full bg-destructive transition-all duration-300" style={{ width: `${opponentProgress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    id="solve-circuit-btn"
                    onClick={() => setPlayerProgress((p) => Math.min(100, p + 25 + Math.random() * 15))}
                  >
                    <Play className="size-4" /> Build circuit (+25%)
                  </Button>
                  <Button variant="secondary" id="show-hint-battle-btn" onClick={() => setShowHint(!showHint)}>
                    💡 Hint
                  </Button>
                  <Button id="submit-btn" onClick={submitSolution}
                    className="bg-success text-white hover:bg-success/80"
                  >
                    <CheckCircle2 className="size-4" /> Submit
                  </Button>
                </div>
              </div>
            )}

            {/* RESULT */}
            {phase === "result" && (
              <div className="max-w-md">
                <div className={`mx-auto grid size-24 place-items-center rounded-full ${result === "win" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                  {result === "win" ? <Trophy className="size-12" /> : <X className="size-12" />}
                </div>
                <h2 className="mt-6 text-3xl font-extrabold">
                  {result === "win" ? "Victory! 🎉" : "Defeated"}
                </h2>
                <p className="mt-3 text-sm text-background/60">
                  {result === "win"
                    ? `+${mission.xp} XP earned! Your circuit outperformed ${opponent.name}.`
                    : `${opponent.name} solved it faster. Keep training and try again!`}
                </p>
                <div className="mt-6 flex gap-3 justify-center">
                  <Button id="rematch-btn" onClick={startMatching}>
                    <Swords className="size-4" /> Rematch
                  </Button>
                  <Button variant="secondary" id="back-to-lobby-btn" onClick={reset}>
                    Back to lobby
                  </Button>
                </div>
                {result === "win" && (
                  <Link to="/lab" className="mt-4 block font-mono text-xs text-cyan hover:underline">
                    Practice this circuit in lab →
                  </Link>
                )}
              </div>
            )}
          </div>
        </Panel>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Battle rules */}
          <Panel className="p-5">
            <b>Battle rules</b>
            <div className="mt-4 space-y-4">
              {[
                { Icon: Clock3, text: "4 minute limit" },
                { Icon: Check, text: "Correctness first" },
                { Icon: Zap, text: "Efficiency breaks ties" },
                { Icon: Shield, text: "Fair-play validation" },
                { Icon: Flame, text: "Streak bonus ×2" },
              ].map(({ Icon, text }) => (
                <div className="flex items-center gap-3 text-sm" key={text}>
                  <div className="grid size-8 place-items-center rounded-md bg-accent">
                    <Icon className="size-4 text-primary" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </Panel>

          {/* Battle card */}
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <b>Your battle card</b>
              <Users className="size-4 text-primary" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {([
                [String(gameState.battleWins), "Wins"],
                [String(gameState.battleLosses), "Losses"],
                [`${winRate}%`, "Win rate"],
                [String(gameState.streak), "Day streak"],
              ] as [string, string][]).map(([v, l]) => (
                <div key={l} className="rounded-md bg-muted p-3">
                  <b className="font-mono text-xl">{v}</b>
                  <span className="block text-xs text-muted-foreground">{l}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Practice */}
          <Panel className="p-5">
            <b>Warm up first?</b>
            <p className="mt-2 text-sm text-muted-foreground">
              Practice Bell states in the lab before entering a ranked battle.
            </p>
            <Button asChild variant="secondary" className="mt-4 w-full" id="warmup-lab-btn">
              <Link to="/lab"><FlaskConical className="size-4" /> Open quantum lab</Link>
            </Button>
          </Panel>
        </aside>
      </div>
    </PageShell>
  );
}

function PlayerCard({ initials, name, rating }: { initials: string; name: string; rating: number }) {
  return (
    <div>
      <div className="mx-auto grid size-20 place-items-center rounded-md bg-primary font-mono text-xl font-bold text-primary-foreground">
        {initials}
      </div>
      <b className="mt-3 block">{name}</b>
      <span className="font-mono text-xs text-background/60">{rating.toLocaleString()} ELO</span>
    </div>
  );
}