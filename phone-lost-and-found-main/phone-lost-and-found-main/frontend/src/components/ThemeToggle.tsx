import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-muted/40 animate-pulse" />;
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  const handleToggle = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="w-9 h-9 p-0 rounded-lg text-foreground hover:bg-secondary transition-colors"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle visual theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 hover:text-amber-300 transition-transform duration-200 hover:rotate-45 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
      ) : (
        <Moon className="h-4 w-4 text-primary hover:text-primary/80 transition-transform duration-200 hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};