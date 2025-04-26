import { useState, useEffect } from "react";

const THEMES = ["light", "dark", "system"];

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.theme || "system");

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (mode) => {
      if (mode === "light") {
        root.classList.remove("dark");
      } else if (mode === "dark") {
        root.classList.add("dark");
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", prefersDark);
      }
    };

    applyTheme(theme);

    if (theme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.theme = theme;
    }
  }, [theme]);

  // Update theme on system preference change
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
  
    const handleChange = () => {
      if (theme === "system") {
        document.documentElement.classList.toggle("dark", media.matches);
      }
    };
  
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);
  

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center w-30 cursor-pointer justify-center px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
    >
      {theme === "light" && "🌞 Light"}
      {theme === "dark" && "🌙 Dark"}
      {theme === "system" && "🖥️ System"}
    </button>
  );
  
}
