// ─── Persistent Game State ────────────────────────────────────────────────────
// Simple reactive store backed by localStorage. Components subscribe via
// a custom hook. No external state library needed.

export interface GameState {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // ISO date string YYYY-MM-DD
  circuitsRun: number;
  lessonProgress: Record<number, number>; // lessonId -> progress 0-100
  completedChallenges: string[]; // challenge titles
  battleWins: number;
  battleLosses: number;
  dailyQuests: { run3: boolean; lesson: boolean; battle: boolean };
  notifications: { id: string; text: string; read: boolean }[];
}

const STORAGE_KEY = "quantum_arena_state_v2";

const DEFAULT_STATE: GameState = {
  xp: 8450,
  level: 17,
  streak: 12,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  circuitsRun: 47,
  lessonProgress: { 1: 100, 2: 72, 3: 35, 4: 0, 5: 0 },
  completedChallenges: [],
  battleWins: 24,
  battleLosses: 11,
  dailyQuests: { run3: true, lesson: true, battle: false },
  notifications: [
    { id: "n1", text: "You're close to rank #141! Keep going 🔥", read: false },
    { id: "n2", text: "New challenge unlocked: Beat the Oracle", read: false },
  ],
};

function load(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function save(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// In-memory snapshot (updated on every mutation)
let _state: GameState = load();
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

export const gameStore = {
  get(): GameState {
    return _state;
  },

  subscribe(fn: () => void): () => void {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },

  addXP(amount: number) {
    _state = { ..._state, xp: _state.xp + amount };
    _state.level = Math.floor(_state.xp / 500) + 1;
    save(_state);
    notify();
  },

  runCircuit() {
    _state = {
      ..._state,
      circuitsRun: _state.circuitsRun + 1,
      dailyQuests: {
        ..._state.dailyQuests,
        run3: _state.circuitsRun + 1 >= 3,
      },
    };
    save(_state);
    notify();
  },

  completeLesson(lessonId: number, delta: number) {
    const current = _state.lessonProgress[lessonId] ?? 0;
    const next = Math.min(100, current + delta);
    _state = {
      ..._state,
      lessonProgress: { ..._state.lessonProgress, [lessonId]: next },
      dailyQuests: {
        ..._state.dailyQuests,
        lesson: next >= 100 || _state.dailyQuests.lesson,
      },
    };
    if (next === 100) this.addXP(200);
    save(_state);
    notify();
  },

  completeChallenge(title: string, xp: number) {
    if (_state.completedChallenges.includes(title)) return;
    _state = {
      ..._state,
      completedChallenges: [..._state.completedChallenges, title],
    };
    this.addXP(xp);
    save(_state);
    notify();
  },

  recordBattle(win: boolean) {
    _state = {
      ..._state,
      battleWins: _state.battleWins + (win ? 1 : 0),
      battleLosses: _state.battleLosses + (win ? 0 : 1),
      dailyQuests: {
        ..._state.dailyQuests,
        battle: win || _state.dailyQuests.battle,
      },
    };
    if (win) this.addXP(250);
    save(_state);
    notify();
  },

  markNotificationRead(id: string) {
    _state = {
      ..._state,
      notifications: _state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    };
    save(_state);
    notify();
  },

  reset() {
    _state = { ...DEFAULT_STATE };
    save(_state);
    notify();
  },
};
