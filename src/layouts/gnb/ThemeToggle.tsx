import { useTheme } from "~/state/theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-default bg-surface text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
      aria-label={theme() === "dark" ? "라이트 모드 켜기" : "다크 모드 켜기"}
      onClick={toggleTheme}
    >
      <i
        class="text-xl"
        classList={{
          "icon-[material-symbols--light-mode-rounded]": theme() === "dark",
          "icon-[material-symbols--dark-mode-rounded]": theme() !== "dark",
        }}
      />
    </button>
  );
}
