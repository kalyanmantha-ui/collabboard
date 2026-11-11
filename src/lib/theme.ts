import { useCallback, useEffect, useState } from "react";

export type Theme = "paper" | "dark";
const KEY = "collabboard.theme";

function initial(): Theme {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "paper";
  } catch {
    return "paper";
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initial);

  useEffect(() => {
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem(KEY, theme);
    } catch {}
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "paper" ? "dark" : "paper")), []);
  return { theme, toggle };
}
