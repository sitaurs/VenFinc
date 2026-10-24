import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
type Locale = "id-ID" | "en-US";
type Theme = "light" | "dark" | "system";
type Preferences = {
  locale: Locale;
  theme: Theme;
  hidden: boolean;
  setLocale: (value: Locale) => void;
  setTheme: (value: Theme) => void;
  toggleHidden: () => void;
  t: (id: string, en: string) => string;
};
const Context = createContext<Preferences | null>(null);
function readPreference(key: string) {
  try {
    return localStorage.getItem(`venfinance:preferences:${key}`);
  } catch {
    return null;
  }
}
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() =>
    readPreference("locale") === "en-US" ? "en-US" : "id-ID",
  );
  const [theme, setTheme] = useState<Theme>(() => {
    const value = readPreference("theme");
    return value === "light" || value === "dark" ? value : "system";
  });
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    media.addEventListener("change", apply);
    try {
      localStorage.setItem("venfinance:preferences:theme", theme);
    } catch {
      /* Preference remains in memory. */
    }
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = locale === "id-ID" ? "id" : "en";
    try {
      localStorage.setItem("venfinance:preferences:locale", locale);
    } catch {
      /* Preference remains in memory. */
    }
  }, [locale]);
  return (
    <Context
      value={{
        locale,
        theme,
        hidden,
        setLocale,
        setTheme,
        toggleHidden: () => setHidden((v) => !v),
        t: (id, en) => (locale === "id-ID" ? id : en),
      }}
    >
      {children}
    </Context>
  );
}
export function usePreferences() {
  const value = useContext(Context);
  if (!value) throw new Error("Preferences provider missing");
  return value;
}
