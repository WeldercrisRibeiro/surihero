import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Forçado para tema claro por tempo indeterminado
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
    
    // Dispara um evento para manter todos os componentes sincronizados
    window.dispatchEvent(new Event("themeChangeSync"));
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem("theme") as Theme;
      if (currentTheme && currentTheme !== theme) {
        setTheme(currentTheme);
      }
    };
    
    window.addEventListener("themeChangeSync", handleThemeChange);
    return () => window.removeEventListener("themeChangeSync", handleThemeChange);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return { theme, setTheme, toggleTheme };
}
