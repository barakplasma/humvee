// @ts-nocheck
// Tracks best scores in localStorage. `unlocked` is kept only for older saves.
const KEY = "humvee.progress";
const TOTAL_STAGES = 10;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {
    /* ignore */
  }
  return { unlocked: TOTAL_STAGES, scores: {} };
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
  state.unlocked = TOTAL_STAGES;
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
  return Array.from({ length: TOTAL_STAGES }, (_, i) => String(i + 1)).every((stage) => state.scores[stage] > 0);
}

export function reset() {
  save({ unlocked: TOTAL_STAGES, scores: {} });
}

export { TOTAL_STAGES };
