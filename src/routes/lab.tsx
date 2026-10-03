import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
  Braces,
  CircleStop,
  Code2,
  Cpu,
  Grip,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageShell, PageTitle, Panel } from "@/components/quantum-shell";
import { Button } from "@/components/ui/button";
import { simulate, explainCircuit, type GateOp } from "@/lib/quantum-sim";
import { gameStore } from "@/lib/game-state";

export type LabSearchParams = {
  mission?: string;
  hint?: string;
};

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "Quantum Lab — NeoQuantum Arena" },
      { name: "description", content: "Build, simulate, debug, and visualize quantum circuits." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): LabSearchParams => {
    const res: LabSearchParams = {};
    if (typeof s["mission"] === "string") res.mission = s["mission"];
    if (typeof s["hint"] === "string") res.hint = s["hint"];
    return res;
  },
  component: Lab,
});

const NUM_QUBITS = 3;
const GATE_PALETTE = ["H", "X", "Y", "Z", "CX", "S", "T", "M"];

const GATE_COLORS: Record<string, string> = {
  H: "bg-primary text-primary-foreground",
  X: "bg-destructive text-white",
  Y: "bg-purple-500 text-white",
  Z: "bg-zinc-600 text-white",
  CX: "bg-cyan-600 text-white",
  S: "bg-amber-500 text-white",
  T: "bg-emerald-600 text-white",
  M: "bg-zinc-800 text-white",
};

const CODE_TEMPLATE = (ops: GateOp[]) => `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

qc = QuantumCircuit(${NUM_QUBITS}, ${NUM_QUBITS})
${ops
  .map((op) => {
    if (op.type === "H") return `qc.h(${op.qubit})`;
    if (op.type === "X") return `qc.x(${op.qubit})`;
    if (op.type === "Y") return `qc.y(${op.qubit})`;
    if (op.type === "Z") return `qc.z(${op.qubit})`;
    if (op.type === "CX") return `qc.cx(${Math.max(0, op.qubit - 1)}, ${op.qubit})`;
    if (op.type === "S") return `qc.s(${op.qubit})`;
    if (op.type === "T") return `qc.t(${op.qubit})`;
    if (op.type === "M") return `qc.measure(${op.qubit}, ${op.qubit})`;
    return "";
  })
  .filter(Boolean)
  .join("\n")}
qc.measure_all()

simulator = AerSimulator()
result = simulator.run(transpile(qc, simulator), shots=1024).result()
print(result.get_counts())`;

function Lab() {
  const { mission, hint } = useSearch({ from: "/lab" });

  const [gates, setGates] = useState<GateOp[]>(() =>
    mission === "bell"
      ? [{ id: 1, type: "H", qubit: 0 }, { id: 2, type: "CX", qubit: 1 }]
      : [{ id: 1, type: "H", qubit: 0 }, { id: 2, type: "CX", qubit: 1 }]
  );
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [tab, setTab] = useState<"circuit" | "code">("circuit");
  const [dragOver, setDragOver] = useState<{ qubit: number } | null>(null);
  const [shotCounts, setShotCounts] = useState<Record<string, number>>({});
  const [xpGained, setXpGained] = useState(0);

  const result = useMemo(() => simulate(gates, NUM_QUBITS), [gates]);
  const explanation = useMemo(() => explainCircuit(gates, result), [gates, result]);

  // Animate shot counts when running
  useEffect(() => {
    if (!running) return;
    const steps = 6;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      // Build intermediate noisy counts
      const noisyCounts: Record<string, number> = {};
      result.labels.forEach((lbl, i) => {
        const baseCount = Math.round((result.probabilities[i] ?? 0) * 1024);
        const noise = Math.floor((Math.random() - 0.5) * (1024 / steps));
        noisyCounts[lbl] = Math.max(0, baseCount + noise);
      });
      setShotCounts(noisyCounts);
      if (step >= steps) {
        clearInterval(interval);
        // Final accurate counts
        const finalCounts: Record<string, number> = {};
        result.labels.forEach((lbl, i) => {
          finalCounts[lbl] = Math.round((result.probabilities[i] ?? 0) * 1024);
        });
        setShotCounts(finalCounts);
        setRunning(false);
        setHasRun(true);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [running, result]);

  const addGate = (type: string, qubit?: number) => {
    const q = qubit !== undefined ? qubit : (gates.length % NUM_QUBITS);
    setGates((v) => [...v, { id: Date.now(), type, qubit: q }]);
  };

  const removeGate = (id: number) => setGates((v) => v.filter((g) => g.id !== id));

  const runCircuit = () => {
    setRunning(true);
    setHasRun(false);
    gameStore.runCircuit();
    const xp = Math.max(10, gates.length * 8);
    setXpGained(xp);
    gameStore.addXP(xp);
  };

  const reset = () => { setGates([]); setHasRun(false); setShotCounts({}); setXpGained(0); };

  const maxProb = Math.max(...result.probabilities, 0.001);

  return (
    <PageShell>
      <PageTitle
        eyebrow="Visual simulator"
        title="Quantum Lab"
        description={mission ? `Mission: ${mission}` : "Compose a circuit, execute it, and inspect every measurement."}
        action={
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={reset} id="lab-reset-btn">
              <RotateCcw className="size-4" /> Reset
            </Button>
            <Button onClick={runCircuit} disabled={running || gates.length === 0} id="lab-run-btn">
              {running ? <CircleStop className="size-4 animate-spin" /> : <Play className="size-4" />}
              {running ? "Running…" : "Run circuit"}
            </Button>
          </div>
        }
      />

      {/* Mission banner */}
      {mission && (
        <div className="mb-4 flex items-start gap-3 rounded-md border border-warning/40 bg-warning/10 p-4">
          <Cpu className="mt-0.5 size-4 shrink-0 text-warning" />
          <div className="text-sm">
            <b className="text-warning">Active mission: {mission}</b>
            {hint && <p className="mt-1 text-muted-foreground">{hint}</p>}
          </div>
        </div>
      )}

      <div className="grid min-h-[650px] gap-4 xl:grid-cols-[180px_1fr_330px]">
        {/* Gate palette */}
        <Panel className="p-4">
          <div className="font-mono text-[10px] font-bold uppercase text-muted-foreground">Gate palette</div>
          <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-1">
            {GATE_PALETTE.map((g) => (
              <button
                key={g}
                id={`gate-${g}`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("gate", g)}
                onClick={() => addGate(g)}
                className="flex h-11 cursor-grab items-center justify-between rounded-md border border-border bg-background px-3 font-mono text-sm font-bold transition-all hover:border-primary hover:bg-accent active:cursor-grabbing"
                title={`Add ${g} gate`}
              >
                <span className={`grid size-7 place-items-center rounded-sm font-mono text-xs font-bold ${GATE_COLORS[g] ?? "bg-primary text-primary-foreground"}`}>
                  {g}
                </span>
                <Grip className="size-3 text-muted-foreground" />
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-md bg-accent p-3 text-xs leading-5 text-muted-foreground">
            <b className="text-foreground">Tip</b>
            <br />
            Click or drag gates onto qubit lanes.
          </div>
        </Panel>

        {/* Circuit canvas */}
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex gap-4">
              <button
                id="tab-circuit"
                onClick={() => setTab("circuit")}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${tab === "circuit" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Braces className="size-4" /> Circuit
              </button>
              <button
                id="tab-code"
                onClick={() => setTab("code")}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${tab === "code" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Code2 className="size-4" /> Python
              </button>
            </div>
            <div className="flex items-center gap-3">
              {hasRun && xpGained > 0 && (
                <span className="animate-in fade-in slide-in-from-bottom-2 font-mono text-xs font-bold text-success">
                  +{xpGained} XP
                </span>
              )}
              <span className="font-mono text-[10px] text-muted-foreground">AER SIMULATOR · {NUM_QUBITS}Q</span>
            </div>
          </div>

          {tab === "circuit" ? (
            <div className="relative min-h-[490px] overflow-hidden bg-foreground p-6 text-background">
              {/* Scan line animation */}
              {running && (
                <div className="absolute left-0 right-0 top-0 h-14 bg-primary/20 animate-[scan_0.9s_linear_infinite]" />
              )}
              {/* Qubit lanes */}
              {Array.from({ length: NUM_QUBITS }).map((_, q) => (
                <div
                  key={q}
                  className={`relative mt-16 flex h-16 items-center transition-colors ${dragOver?.qubit === q ? "bg-primary/10" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver({ qubit: q }); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const gateType = e.dataTransfer.getData("gate");
                    if (gateType) addGate(gateType, q);
                    setDragOver(null);
                  }}
                >
                  <span className="w-12 font-mono text-xs text-background/60">q[{q}]</span>
                  <div className="h-px flex-1 bg-background/30" />
                  {/* Drop zone hint */}
                  {dragOver?.qubit === q && (
                    <div className="absolute left-16 flex size-11 items-center justify-center rounded-sm border-2 border-dashed border-primary/60">
                      <Plus className="size-4 text-primary" />
                    </div>
                  )}
                  {/* Gates on this qubit */}
                  <div className="absolute left-16 right-4 flex flex-wrap gap-3 pl-4">
                    {gates
                      .map((g, idx) => ({ g, idx }))
                      .filter(({ g }) => g.qubit === q)
                      .map(({ g, idx }) => (
                        <div key={g.id} className="relative group">
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] text-background/40">
                            {idx + 1}
                          </span>
                          <button
                            title="Remove gate"
                            onClick={() => removeGate(g.id)}
                            className={`grid size-11 place-items-center rounded-sm font-mono font-bold shadow-lg transition-transform hover:scale-110 ${GATE_COLORS[g.type] ?? "bg-primary text-primary-foreground"}`}
                          >
                            <span className="group-hover:hidden">{g.type}</span>
                            <Trash2 className="hidden size-3 group-hover:block" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
              {gates.length === 0 && (
                <div className="absolute inset-0 grid place-items-center text-sm text-background/50">
                  Add gates or drag them onto qubit lanes.
                </div>
              )}
            </div>
          ) : (
            <pre className="min-h-[490px] overflow-auto bg-foreground p-6 font-mono text-xs text-background/85">
              {CODE_TEMPLATE(gates)}
            </pre>
          )}

          <div className="flex items-center justify-between border-t border-border p-4 text-xs">
            <span className="text-muted-foreground">
              Depth: <b className="text-foreground">{result.depth}</b>
            </span>
            <span className="text-muted-foreground">
              Fidelity:{" "}
              <b className={result.fidelity >= 99 ? "text-success" : result.fidelity >= 97 ? "text-warning" : "text-destructive"}>
                {result.fidelity}%
              </b>
            </span>
            <span className="text-muted-foreground">
              Entangled:{" "}
              <b className={result.entangled ? "text-cyan" : "text-muted-foreground"}>
                {result.entangled ? "Yes" : "No"}
              </b>
            </span>
          </div>
        </Panel>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Measurement results */}
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <b>Measurements</b>
              <span className="font-mono text-[10px] text-success">1024 SHOTS</span>
            </div>
            <div className="mt-5 space-y-2">
              {result.labels.map((lbl, i) => {
                const prob = result.probabilities[i] ?? 0;
                const shots = hasRun ? (shotCounts[lbl] ?? 0) : Math.round(prob * 1024);
                const pct = Math.round(prob * 100);
                if (pct === 0 && !hasRun) return null;
                return (
                  <div key={lbl}>
                    <div className="mb-1 flex justify-between font-mono text-xs">
                      <span className="text-muted-foreground">|{lbl}⟩</span>
                      <span className="font-bold">{pct}% <span className="font-normal text-muted-foreground">({shots})</span></span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${(prob / maxProb) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {gates.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">Run a circuit to see results.</p>
              )}
            </div>
          </Panel>

          {/* AI explanation */}
          <Panel className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <b>Qubit AI</b>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{explanation}</p>
            {result.entangled && (
              <div className="mt-3 flex items-center gap-2 rounded-md bg-cyan/10 px-3 py-2 text-xs font-semibold text-cyan">
                <ChevronRight className="size-3" /> Bell pair detected — entanglement confirmed!
              </div>
            )}
          </Panel>

          {/* Quick-build presets */}
          <Panel className="p-5">
            <div className="font-mono text-[10px] font-bold uppercase text-muted-foreground">Quick presets</div>
            <div className="mt-3 grid gap-2">
              {[
                { label: "Bell State", ops: [{ id: 1, type: "H", qubit: 0 }, { id: 2, type: "CX", qubit: 1 }] },
                { label: "GHZ State", ops: [{ id: 1, type: "H", qubit: 0 }, { id: 2, type: "CX", qubit: 1 }, { id: 3, type: "CX", qubit: 2 }] },
                { label: "Superposition", ops: [{ id: 1, type: "H", qubit: 0 }, { id: 2, type: "H", qubit: 1 }, { id: 3, type: "H", qubit: 2 }] },
              ].map(({ label, ops }) => (
                <button
                  key={label}
                  id={`preset-${label.replace(/\s/g, "-")}`}
                  onClick={() => { setGates(ops); setHasRun(false); setShotCounts({}); }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-left text-xs font-semibold transition-all hover:border-primary hover:bg-accent"
                >
                  {label}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </PageShell>
  );
}