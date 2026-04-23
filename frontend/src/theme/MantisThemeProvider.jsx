import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeModeContext = createContext(null);

const mantisPalette = {
  primary: "#4680ff",
  primaryDark: "#3366d6",
  secondary: "#5b6b79",
  success: "#2ca87f",
  warning: "#e58a00",
  error: "#dc2626",
  info: "#13c2c2",
  border: "#dbe0e5",
  paper: "#ffffff",
  background: "#f8f9fa",
  text: "#1d2630",
  muted: "#667085",
};

function buildTheme(mode) {
  const dark = mode === "dark";
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mantisPalette.primary,
        dark: mantisPalette.primaryDark,
        contrastText: "#ffffff",
      },
      secondary: {
        main: mantisPalette.secondary,
      },
      success: {
        main: mantisPalette.success,
      },
      warning: {
        main: mantisPalette.warning,
      },
      error: {
        main: mantisPalette.error,
      },
      info: {
        main: mantisPalette.info,
      },
      background: {
        default: dark ? "#111827" : mantisPalette.background,
        paper: dark ? "#1f2937" : mantisPalette.paper,
      },
      text: {
        primary: dark ? "#f8fafc" : mantisPalette.text,
        secondary: dark ? "#aab4c0" : mantisPalette.muted,
      },
      divider: dark ? "#334155" : mantisPalette.border,
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: "'Public Sans', Inter, Roboto, Arial, sans-serif",
      h1: { fontWeight: 700, letterSpacing: 0 },
      h2: { fontWeight: 700, letterSpacing: 0 },
      h3: { fontWeight: 700, letterSpacing: 0 },
      h4: { fontWeight: 700, letterSpacing: 0 },
      h5: { fontWeight: 600, letterSpacing: 0 },
      h6: { fontWeight: 600, letterSpacing: 0 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shadows: [
      "none",
      "0 2px 8px rgba(27, 46, 94, 0.06)",
      "0 4px 14px rgba(27, 46, 94, 0.08)",
      "0 8px 24px rgba(27, 46, 94, 0.10)",
      "0 12px 30px rgba(27, 46, 94, 0.12)",
      ...Array(20).fill("0 16px 40px rgba(27, 46, 94, 0.14)"),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: "none",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            minHeight: 40,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${dark ? "#334155" : mantisPalette.border}`,
            boxShadow: "0 2px 8px rgba(27, 46, 94, 0.06)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 8,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      },
    },
  });
}

export function MantisThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("theme") === "dark" ? "dark" : "light");
  const theme = useMemo(() => buildTheme(mode), [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.dataset.theme = "mantis";
    localStorage.setItem("theme", mode);
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    toggleMode: () => setMode((current) => current === "dark" ? "light" : "dark"),
  }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
