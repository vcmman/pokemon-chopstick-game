export const ROUND_SECONDS = 60;
export const GOALS = [5, 8, 10] as const;
export type Round = {
  status: "ready" | "playing" | "cleared" | "won" | "lost" | "stopped";
  level: number;
  difficulty: number;
  caught: number;
  total: number;
  remaining: number;
  deadline: number;
};
export type RoundAction =
  | { type: "start" | "next" | "catch" | "tick" | "stop"; now: number }
  | { type: "difficulty"; difficulty: number; now: number };
export const initialRound: Round = { status: "ready", level: 0, difficulty: 0, caught: 0, total: 0, remaining: ROUND_SECONDS, deadline: 0 };
export function roundReducer(state: Round, action: RoundAction): Round {
  if (action.type === "start") {
    return { ...initialRound, difficulty: state.difficulty, status: "playing", deadline: action.now + ROUND_SECONDS * 1000 };
  }
  if (action.type === "next" && state.status === "cleared") {
    return { ...state, status: "playing", level: state.level + 1, difficulty: Math.max(state.difficulty, state.level + 1), caught: 0, remaining: ROUND_SECONDS, deadline: action.now + ROUND_SECONDS * 1000 };
  }
  if (action.type === "stop" && state.status === "cleared") return { ...state, status: "stopped" };
  if (action.type === "difficulty") {
    if (!Number.isInteger(action.difficulty) || action.difficulty < 0 || action.difficulty > 2) return state;
    if (state.status === "playing" && action.now >= state.deadline) return { ...state, status: "lost", remaining: 0 };
    return { ...state, difficulty: action.difficulty };
  }
  if (state.status !== "playing") return state;
  const remaining = Math.max(0, Math.ceil((state.deadline - action.now) / 1000));
  if (remaining === 0) return { ...state, status: "lost", remaining: 0 };
  if (action.type === "stop") return { ...state, status: "stopped", remaining };
  if (action.type === "catch") {
    const caught = state.caught + 1;
    const status = caught >= GOALS[state.level] ? (state.level === GOALS.length - 1 ? "won" : "cleared") : "playing";
    return { ...state, caught, total: state.total + 1, remaining, status };
  }
  return { ...state, remaining };
}
