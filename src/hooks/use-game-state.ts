import { useEffect, useState } from "react";
import { gameStore, type GameState } from "@/lib/game-state";

/** Subscribe to the game store; component re-renders on any mutation. */
export function useGameState(): GameState {
  const [state, setState] = useState<GameState>(() => gameStore.get());
  useEffect(() => {
    // Sync in case store changed before mount
    setState(gameStore.get());
    return gameStore.subscribe(() => setState(gameStore.get()));
  }, []);
  return state;
}
