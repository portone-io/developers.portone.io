import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  type ParentProps,
  useContext,
} from "solid-js";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "portone-theme";

interface ThemeContextValue {
  theme: () => ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>();

function parseTheme(value: string | null | undefined): ThemeMode | null {
  return value === "light" || value === "dark" ? value : null;
}

function getSystemTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialTheme(): ThemeMode {
  const storedTheme = parseTheme(window.localStorage.getItem(STORAGE_KEY));
  if (storedTheme) return storedTheme;

  const domTheme = parseTheme(document.documentElement.dataset.theme);
  if (domTheme) return domTheme;

  return getSystemTheme();
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider(props: ParentProps) {
  const [theme, setThemeSignal] = createSignal<ThemeMode>("light");

  const setTheme = (mode: ThemeMode) => {
    setThemeSignal(mode);
  };

  const toggleTheme = () => {
    setTheme(theme() === "dark" ? "light" : "dark");
  };

  onMount(() => {
    setThemeSignal(getInitialTheme());

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => {
      if (parseTheme(window.localStorage.getItem(STORAGE_KEY))) return;
      setThemeSignal(getSystemTheme());
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const nextTheme = parseTheme(event.newValue) ?? getSystemTheme();
      setThemeSignal(nextTheme);
    };

    mediaQuery.addEventListener("change", onMediaChange);
    window.addEventListener("storage", onStorage);

    onCleanup(() => {
      mediaQuery.removeEventListener("change", onMediaChange);
      window.removeEventListener("storage", onStorage);
    });
  });

  createEffect(() => {
    const nextTheme = theme();
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export { STORAGE_KEY as themeStorageKey };
