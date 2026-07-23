const STORAGE_KEY = "iwatchwatches-theme";

type Theme = "dark" | "light";

function getPreferredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);

  const toggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!toggle) return;

  const isDark = theme === "dark";
  toggle.setAttribute("aria-pressed", String(isDark));
  toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  toggle.textContent = isDark ? "Light" : "Dark";
}

function initTheme() {
  applyTheme(getPreferredTheme());

  const toggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  toggle?.addEventListener("click", () => {
    const next: Theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next);
  });
}

initTheme();
