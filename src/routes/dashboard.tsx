import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarClock,
  Flame,
  Swords,
  Target,
  Trophy,
  Zap,
  Bell,
  CheckCircle2,
  X,
} from "lucide-react";
import { useState } from "react";
import { PageShell, PageTitle, Panel, ProgressBar, Stat } from "@/components/quantum-shell";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/hooks/use-game-state";
import { gameStore } from "@/lib/game-state";
import { lessons } from "@/data/quantum";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Mission HQ — NeoQuantum Arena" },
      { name: "description", content: "Your personalized quantum learning dashboard and mission control." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const state = useGameState();
  const [showNotifications, setShowNotifications] = useState(false);
  const unread = state.notifications.filter((n) => !n.read);
  const xpToNext = 500 - (state.xp % 500);
  const levelPct = Math.round(((state.xp % 500) / 500) * 100);

  // Current lesson in progress
  const activeLesson = lessons.find(
    (l) => ((state.lessonProgress[l.id] ?? l.progress ?? 0) > 0 && (state.lessonProgress[l.id] ?? l.progress ?? 0) < 100)
  ) ?? lessons[0] ?? { id: 1, title: "Qubits & States", level: "Foundation", xp: 240, duration: "8 min", description: "Fundamentals", content: { intro: "", concepts: [], quiz: [] } };
  const activeProgress = state.lessonProgress[activeLesson.id] ?? activeLesson.progress ?? 0;

  const questItems: [string, boolean, string][] = [
    ["Run 3 circuits", state.dailyQuests.run3, "+50 XP"],
    ["Finish one lesson", state.dailyQuests.lesson, "+100 XP"],
    ["Win an arena match", state.dailyQuests.battle, "+150 XP"],
  ];
  const questsDone = questItems.filter(([, done]) => done).length;

  return (
    <PageShell>
      <PageTitle
        eyebrow="Learner command center"
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, Lokesh.`}
        description="Your next breakthrough is one mission away."
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                id="notifications-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <Bell className="size-5" />
                {unread.length > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-destructive font-mono text-[9px] text-white">
                    {unread.length}
                  </span>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 top-10 z-50 w-72 rounded-md border border-border bg-card shadow-xl">
                  <div className="flex items-center justify-between border-b border-border p-3">
                    <b className="text-sm">Notifications</b>
                    <button onClick={() => setShowNotifications(false)}><X className="size-4" /></button>
                  </div>
                  {state.notifications.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">All caught up!</p>
                  ) : (
                    state.notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-2 border-b border-border p-3 text-sm last:border-0 ${n.read ? "opacity-50" : ""}`}
                      >
                        <span className={`mt-1 size-2 shrink-0 rounded-full ${n.read ? "bg-muted" : "bg-primary"}`} />
                        <span>{n.text}</span>
                        {!n.read && (
                          <button
                            onClick={() => gameStore.markNotificationRead(n.id)}
                            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <Button asChild id="resume-mission-btn">
              <Link to="/learn">Resume mission <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        }
      />

      {/* Stats bar */}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="League" value="# 142" detail="Top 8% this week" accent />
        <Stat label="Total XP" value={state.xp.toLocaleString()} detail={`${xpToNext} to level ${state.level + 1}`} />
        <Stat label="Streak" value={`${state.streak} days`} detail="Personal best: 19" />
        <Stat label="Circuits" value={String(state.circuitsRun)} detail="91% avg fidelity" />
      </div>

      {/* XP level bar */}
      <Panel className="mt-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-primary font-mono text-sm font-bold text-primary-foreground">
              {state.level}
            </div>
            <div>
              <b className="text-sm">Level {state.level}</b>
              <p className="text-xs text-muted-foreground">Quantum Coder</p>
            </div>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{xpToNext} XP to next level</span>
        </div>
        <div className="mt-3">
          <ProgressBar value={levelPct} />
        </div>
      </Panel>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.45fr_.75fr]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Continue learning */}
          <Panel className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[11px] font-bold uppercase text-primary">Continue learning</span>
                <h2 className="mt-2 text-2xl font-extrabold">{activeLesson.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Module {activeLesson.id} · {activeLesson.duration}
                </p>
              </div>
              <div className="grid size-12 place-items-center rounded-md bg-accent">
                <BookOpen className="text-primary" />
              </div>
            </div>
            <div className="mt-7">
              <div className="mb-2 flex justify-between font-mono text-xs">
                <span>MODULE PROGRESS</span>
                <b>{activeProgress}%</b>
              </div>
              <ProgressBar value={activeProgress} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild id="continue-lesson-btn">
                <Link to="/learn">Continue <ArrowRight className="size-4" /></Link>
              </Button>
              <Button variant="secondary" id="open-lab-btn" asChild>
                <Link to="/lab">Open lab</Link>
              </Button>
            </div>
          </Panel>

          {/* AI recommendation */}
          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] font-bold uppercase text-primary">Recommended by Qubit AI</span>
                <h2 className="mt-2 text-xl font-extrabold">Strengthen your gate intuition</h2>
              </div>
              <BrainCircuit className="size-7 text-primary" />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your Hadamard accuracy is high, but controlled gates need work. Try this 8-minute visual lab before entering the weekly challenge.
            </p>
            <Button asChild variant="secondary" className="mt-5" id="practice-lab-btn">
              <Link to="/lab">Launch practice lab</Link>
            </Button>
          </Panel>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Arena status */}
          <Panel className="overflow-hidden">
            <div className="border-b border-border bg-foreground p-5 text-background">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase text-cyan">Arena status</span>
                <Trophy className="size-5 text-warning" />
              </div>
              <div className="mt-4 text-3xl font-extrabold">Silver III</div>
              <p className="mt-1 text-xs text-background/60">2 wins to promotion</p>
              <div className="mt-3 font-mono text-xs">
                W: <b className="text-success">{state.battleWins}</b>
                {" · "}
                L: <b className="text-destructive">{state.battleLosses}</b>
                {" · "}
                Rate: <b>{Math.round((state.battleWins / Math.max(1, state.battleWins + state.battleLosses)) * 100)}%</b>
              </div>
            </div>
            <div className="space-y-4 p-5">
              {[
                { Icon: Swords, title: "Next battle", sub: "Today · 19:30" },
                { Icon: Target, title: "Weekly mission", sub: "Top 18%" },
                { Icon: CalendarClock, title: "Quantum Cup", sub: "Starts in 4 days" },
              ].map(({ Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-md bg-accent">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div>
                    <b className="block text-sm">{title}</b>
                    <span className="text-xs text-muted-foreground">{sub}</span>
                  </div>
                </div>
              ))}
              <Button asChild variant="secondary" className="w-full mt-2" id="find-battle-btn">
                <Link to="/battle"><Swords className="size-4" />Find battle</Link>
              </Button>
            </div>
          </Panel>

          {/* Daily quests */}
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <b>Daily quests</b>
              <span className="font-mono text-xs text-primary">{questsDone} / {questItems.length}</span>
            </div>
            {questItems.map(([t, done, reward]) => (
              <div className="mt-4" key={String(t)}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    {done && <CheckCircle2 className="size-3 text-success" />}
                    {String(t)}
                  </span>
                  <span className={done ? "text-success" : "text-muted-foreground"}>{done ? "✓ Done" : reward}</span>
                </div>
                <ProgressBar value={done ? 100 : 0} />
              </div>
            ))}
            {questsDone === questItems.length ? (
              <div className="mt-5 flex items-center gap-2 rounded-md bg-success/10 p-3 text-xs font-semibold text-success">
                <CheckCircle2 className="size-4" /> All quests done! 2× XP bonus active.
              </div>
            ) : (
              <div className="mt-5 flex items-center gap-2 rounded-md bg-accent p-3 text-xs font-semibold">
                <Flame className="size-4 text-warning" /> Complete all quests for a 2× bonus.
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* Skill constellation */}
      <Panel className="mt-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Skill constellation</h2>
          <span className="font-mono text-xs text-muted-foreground">LIVE</span>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {([
            ["Qubits", state.lessonProgress[1] ?? 92],
            ["Superposition", state.lessonProgress[2] ?? 78],
            ["Gates", state.lessonProgress[3] ?? 61],
            ["Entanglement", state.lessonProgress[4] ?? 34],
            ["Algorithms", state.lessonProgress[5] ?? 12],
          ] as [string, number][]).map(([n, v]) => (
            <div key={String(n)} className="rounded-md border border-border p-4">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                <b className="text-sm">{String(n)}</b>
              </div>
              <div className="mt-4 font-mono text-2xl font-bold">
                {String(v)}<span className="text-xs text-muted-foreground">%</span>
              </div>
              <ProgressBar value={Number(v)} />
            </div>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
}