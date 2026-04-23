import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeModeContext = createContext(null);

export function MantisThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("theme") === "dark" ? "dark" : "light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.dataset.theme = "shadcn";
    localStorage.setItem("theme", mode);
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    toggleMode: () => setMode((current) => current === "dark" ? "light" : "dark"),
  }), [mode]);

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
