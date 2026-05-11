import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="shrink-0 rounded-xl w-10 h-10 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
      title="Alternar tema"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-slate-700" />
      ) : (
        <Sun className="w-5 h-5 text-amber-400" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
