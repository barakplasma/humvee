// Tracks which stages are unlocked and best scores, in localStorage.
const KEY = "humvee.progress";
const TOTAL_STAGES = 4;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {
    /* ignore */
  }
  return { unlocked: 1, scores: {} };
}

function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (_) {
    /* ignore */
  }
}

export function getUnlocked() {
  return load().unlocked;
}

export function isUnlocked(stage) {
  return stage <= load().unlocked;
}

export function completeStage(stage, score = 0) {
  const state = load();
  if (stage + 1 > state.unlocked && stage < TOTAL_STAGES) {
    state.unlocked = stage + 1;
  }
  const prev = state.scores[stage] || 0;
  state.scores[stage] = Math.max(prev, score);
  save(state);
  return state;
}

export function getScore(stage) {
  return load().scores[stage] || 0;
}

export function allComplete() {
  const state = load();
  return state.unlocked > TOTAL_STAGES;
}

export function reset() {
  save({ unlocked: 1, scores: {} });
}

export { TOTAL_STAGES };
