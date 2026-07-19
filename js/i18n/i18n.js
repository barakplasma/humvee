import { en } from "./en.js";
import { he } from "./he.js";

// Registry of available locales. To add one: import it and add an entry here.
export const LOCALES = {
  en: { name: "English", rtl: false, strings: en },
  he: { name: "עברית", rtl: true, strings: he },
};

const STORAGE_KEY = "humvee.locale";
const DEFAULT_LOCALE = "he";

let current = DEFAULT_LOCALE;

// Lightweight event bus so UI can re-render when the language changes.
const listeners = new Set();

export function initLocaleFromStorage() {
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (_) {
    /* storage unavailable (private mode) — fall back to default */
  }
  if (saved && LOCALES[saved]) current = saved;
  applyDocumentDir();
}

export function getLocale() {
  return current;
}

export function isRTL() {
  return !!LOCALES[current].rtl;
}

export function setLocale(code) {
  if (!LOCALES[code] || code === current) return;
  current = code;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch (_) {
    /* ignore */
  }
  applyDocumentDir();
  listeners.forEach((fn) => fn(code));
}

export function onLocaleChanged(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Translate a key. Falls back to English, then to the raw key so missing
 * strings are visible rather than blank. Supports {placeholder} params.
 */
export function t(key, params) {
  const table = LOCALES[current].strings;
  let str = table[key];
  if (str === undefined) str = LOCALES[DEFAULT_LOCALE].strings[key];
  if (str === undefined) str = key;
  if (params) {
    str = str.replace(/\{(\w+)\}/g, (m, name) =>
      params[name] !== undefined ? params[name] : m
    );
  }
  return str;
}

// Keep the <html> dir/lang attributes in sync (affects the rotate hint + font shaping).
function applyDocumentDir() {
  if (typeof document === "undefined") return;
  document.documentElement.lang = current;
  document.documentElement.dir = isRTL() ? "rtl" : "ltr";
  // Update any static DOM strings tagged with data-i18n (e.g. rotate hint).
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
}
