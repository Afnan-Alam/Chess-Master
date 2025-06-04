import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 dark:from-slate-600 dark:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <Sun
          className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300 ${
            theme === "light" ? "opacity-100 rotate-0" : "opacity-0 rotate-180"
          }`}
        />
        <Moon
          className={`absolute inset-0 w-6 h-6 text-slate-200 transition-all duration-300 ${
            theme === "dark" ? "opacity-100 rotate-0" : "opacity-0 -rotate-180"
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
