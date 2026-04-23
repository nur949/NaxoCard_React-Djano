import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "../../theme/MantisThemeProvider.jsx";
import { Button } from "../ui/button.jsx";

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const dark = mode === "dark";

  return (
    <Button variant="outline" size="icon" onClick={toggleMode} aria-label="Toggle dark mode">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}
