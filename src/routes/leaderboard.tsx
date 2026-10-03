import { createFileRoute } from "@tanstack/react-router";
import { Building2, Crown, Flame, Medal, Search, Trophy, Users, X } from "lucide-react";
import { useState, useMemo } from "react";
import { PageShell, PageTitle, Panel, ProgressBar } from "@/components/quantum-shell";
import { Button } from "@/components/ui/button";
import { ranks } from "@/data/quantum";
import { useGameState } from "@/hooks/use-game-state";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — NeoQuantum Arena" },
      { name: "description", content: "See the top quantum learners, teams, and institutions." },
    ],
  }),
  component: Leaderboard,
});

const MY_NAME = "Lokesh P.";
const MY_RANK = 6; // 1-indexed position in ranks array

const TEAMS = [
  ["QC", "Qubit Crew", "IIT Delhi", "34,210"],
  ["QQ", "QuantumQore", "IIT Bombay", "31,890"],
  ["EP", "Entanglers Pro", "MIT", "29,450"],
  ["WV", "WaveVector", "Stanford", "27,100"],
  ["SQ", "SuperQ", "IIT Madras", "24,650"],
];

const CAMPUS = [
  ["IIT Madras", "8 members", "92,340"],
  ["IIT Bombay", "11 members", "88,120"],
  ["IIT Delhi", "9 members", "81,660"],
  ["MIT", "5 members", "74,900"],
  ["Stanford", "6 members", "69,200"],
];

function Leaderboard() {
  const gameState = useGameState();
  const [scope, setScope] = useState<"Global" | "Teams" | "Campus">("Global");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"xp" | "rank">("rank");

  // Merge real XP from game state for "Lokesh P."
  const enrichedRanks = useMemo(() => {
    return ranks.map((r) => {
      if (r[1] === MY_NAME) {
        return [r[0], r[1], r[2], gameState.xp.toLocaleString()];
      }
      return r;
    });
  }, [gameState.xp]);

  const filteredRanks = useMemo(() => {
    return enrichedRanks.filter((r) =>
      r[1]!.toLowerCase().includes(search.toLowerCase())
    );
  }, [enrichedRanks, search]);

  // Podium: positions 2nd, 1st, 3rd (visual order)
  const podium = [enrichedRanks[1], enrichedRanks[0], enrichedRanks[2]].filter(Boolean) as string[][];

  const myEntry = enrichedRanks[MY_RANK - 1];
  const myXP = parseInt(gameState.xp.toLocaleString().replace(",", ""));
  const nextEntry = enrichedRanks[MY_RANK - 2];
  const nextXP = nextEntry ? parseInt(nextEntry[3]!.replace(",", "")) : myXP + 1000;
  const progressToNext = Math.max(0, Math.min(100, Math.round(((myXP - 7000) / (nextXP - 7000)) * 100)));

  return (
    <PageShell>
      <PageTitle
        eyebrow="Season 04 rankings"
        title="Leaderboard"
        description="Skill is measured. Consistency is rewarded. The arena remembers."
        action={
          <div className="flex gap-2">
            {(["Global", "Teams", "Campus"] as const).map((x) => (
              <Button
                key={x}
                size="sm"
                id={`scope-${x}`}
                variant={scope === x ? "default" : "secondary"}
                onClick={() => setScope(x)}
              >
                {x}
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div>
          {/* Podium (Global only) */}
          {scope === "Global" && (
            <div className="mb-5 grid grid-cols-3 items-end gap-3">
              {podium.map((r, i) => {
                const pos = i === 0 ? 2 : i === 1 ? 1 : 3;
                return (
                  <Panel
                    key={r[1]}
                    className={`p-4 text-center ${pos === 1 ? "pb-7 pt-7 border-primary ring-1 ring-primary/30" : ""}`}
                  >
                    {pos === 1 && <Crown className="mx-auto mb-3 size-5 text-warning" />}
                    <div
                      className={`mx-auto grid place-items-center rounded-md bg-foreground font-mono font-bold text-background ${pos === 1 ? "size-16 text-lg" : "size-12 text-sm"}`}
                    >
                      {r[0]}
                    </div>
                    <b className="mt-3 block text-sm">{r[1]}</b>
                    <span className="font-mono text-xs text-primary">{r[3]} XP</span>
                    <div className="mt-2 font-mono text-[10px] text-muted-foreground">#{pos}</div>
                  </Panel>
                );
              })}
            </div>
          )}

          {/* Search */}
          {scope === "Global" && (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-card px-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                id="leaderboard-search"
                aria-label="Search players"
                placeholder="Search players…"
                className="h-10 w-full bg-transparent text-sm outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X className="size-4 text-muted-foreground" />
                </button>
              )}
            </div>
          )}

          {/* Global ranking table */}
          {scope === "Global" && (
            <Panel className="overflow-hidden">
              <div className="grid grid-cols-[45px_1fr_130px_90px] border-b border-border bg-muted px-4 py-3 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                <span>Rank</span>
                <span>Player</span>
                <span>League</span>
                <span className="text-right">XP</span>
              </div>
              {filteredRanks.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">No players found.</div>
              ) : (
                filteredRanks.map((r, i) => {
                  const isMe = r[1] === MY_NAME;
                  return (
                    <div
                      key={r[1]}
                      className={`grid grid-cols-[45px_1fr_130px_90px] items-center border-b border-border px-4 py-3.5 last:border-0 transition-colors ${isMe ? "bg-accent" : "hover:bg-muted/40"}`}
                    >
                      <b className="font-mono text-sm">{i + 1}</b>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-foreground font-mono text-[10px] text-background">
                          {r[0]}
                        </span>
                        <b className="truncate text-sm">
                          {r[1]}
                          {isMe && <span className="ml-2 text-xs text-primary">YOU</span>}
                        </b>
                      </div>
                      <span className="truncate text-xs text-muted-foreground">{r[2]}</span>
                      <b className="text-right font-mono text-xs">{r[3]}</b>
                    </div>
                  );
                })
              )}
            </Panel>
          )}

          {/* Teams table */}
          {scope === "Teams" && (
            <Panel className="overflow-hidden">
              <div className="grid grid-cols-[45px_1fr_130px_90px] border-b border-border bg-muted px-4 py-3 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                <span>Rank</span>
                <span>Team</span>
                <span>Campus</span>
                <span className="text-right">XP</span>
              </div>
              {TEAMS.map((t, i) => (
                <div key={t[1]} className="grid grid-cols-[45px_1fr_130px_90px] items-center border-b border-border px-4 py-3.5 last:border-0 hover:bg-muted/40">
                  <b className="font-mono text-sm">{i + 1}</b>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-foreground font-mono text-[10px] text-background">{t[0]}</span>
                    <b className="truncate text-sm">{t[1]}</b>
                  </div>
                  <span className="truncate text-xs text-muted-foreground">{t[2]}</span>
                  <b className="text-right font-mono text-xs">{t[3]}</b>
                </div>
              ))}
            </Panel>
          )}

          {/* Campus table */}
          {scope === "Campus" && (
            <Panel className="overflow-hidden">
              <div className="grid grid-cols-[45px_1fr_130px_90px] border-b border-border bg-muted px-4 py-3 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                <span>Rank</span>
                <span>Institution</span>
                <span>Size</span>
                <span className="text-right">Team XP</span>
              </div>
              {CAMPUS.map((c, i) => (
                <div key={c[0]} className="grid grid-cols-[45px_1fr_130px_90px] items-center border-b border-border px-4 py-3.5 last:border-0 hover:bg-muted/40">
                  <b className="font-mono text-sm">{i + 1}</b>
                  <b className="truncate text-sm">{c[0]}</b>
                  <span className="truncate text-xs text-muted-foreground">{c[1]}</span>
                  <b className="text-right font-mono text-xs">{c[2]}</b>
                </div>
              ))}
            </Panel>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Your standing */}
          <Panel className="p-5">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-warning" />
              <b>Your standing</b>
            </div>
            <div className="mt-5 text-4xl font-extrabold">#{MY_RANK}</div>
            <p className="mt-1 text-sm text-muted-foreground">Top 8% globally</p>
            <div className="mt-5 rounded-md bg-accent p-4">
              <div className="flex justify-between font-mono text-xs">
                <span>TO #{MY_RANK - 1}</span>
                <b>{(nextXP - myXP).toLocaleString()} XP</b>
              </div>
              <div className="mt-3">
                <ProgressBar value={progressToNext} />
              </div>
            </div>
          </Panel>

          {/* Season records */}
          <Panel className="p-5">
            <b>Season records</b>
            <div className="mt-4 space-y-4">
              {[
                { Icon: Flame, label: "Longest streak", value: "28 days" },
                { Icon: Medal, label: "Most battle wins", value: "Aarav K." },
                { Icon: Users, label: "Top team", value: "Qubit Crew" },
                { Icon: Building2, label: "Top campus", value: "IIT Madras" },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="size-4 text-primary" />
                  <div className="flex-1">
                    <span className="block text-xs text-muted-foreground">{label}</span>
                    <b className="text-sm">{value}</b>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Your XP */}
          <Panel className="p-5">
            <b>Your XP this session</b>
            <div className="mt-3 text-3xl font-extrabold text-primary">{gameState.xp.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Level {gameState.level} · Quantum Coder</p>
          </Panel>
        </aside>
      </div>
    </PageShell>
  );
}