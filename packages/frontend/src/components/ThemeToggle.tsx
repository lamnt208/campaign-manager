import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { useThemeStore } from "../store/themeStore";

const options = [
  { value: "light" as const, icon: SunIcon, label: "Light" },
  { value: "dark" as const, icon: MoonIcon, label: "Dark" },
  { value: "system" as const, icon: ComputerDesktopIcon, label: "System" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div
      className="flex items-center rounded-lg border p-0.5"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-subtle)" }}
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`rounded-md p-1.5 transition-colors ${
            theme === value
              ? "bg-[var(--bg-card)] shadow-sm text-primary-600"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
