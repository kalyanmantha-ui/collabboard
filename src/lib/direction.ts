import { useCallback, useSyncExternalStore } from "react";

export type Dir = "ltr" | "rtl";
const KEY = "collabboard.dir";
const EVENT = "collabboard:dir";

function stored(): Dir {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("dir");
    if (fromUrl === "rtl" || fromUrl === "ltr") return fromUrl;
    return localStorage.getItem(KEY) === "rtl" ? "rtl" : "ltr";
  } catch {
    return "ltr";
  }
}

export function applyDirection(dir: Dir) {
  document.documentElement.setAttribute("dir", dir);
  try {
    localStorage.setItem(KEY, dir);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function initDirection() {
  applyDirection(stored());
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};
const snapshot = (): Dir => (document.documentElement.getAttribute("dir") === "rtl" ? "rtl" : "ltr");

export function useDirection() {
  const dir = useSyncExternalStore(subscribe, snapshot, () => "ltr" as Dir);
  const toggle = useCallback(() => applyDirection(snapshot() === "rtl" ? "ltr" : "rtl"), []);
  return { dir, toggle };
}
