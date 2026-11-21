function syncSavedTheme() {
  try {
    const savedTheme = localStorage.getItem("portfolio-theme");
    const shouldUseDarkTheme = savedTheme
      ? savedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;

    const hasDarkTheme = document.documentElement.classList.contains("dark");
    if (hasDarkTheme !== shouldUseDarkTheme) {
      document.documentElement.classList.toggle("dark", shouldUseDarkTheme);
      window.dispatchEvent(new Event("portfolio-theme-change"));
    }
  } catch {
    // Theme initialization is optional when browser storage is unavailable.
  }
}

syncSavedTheme();
new MutationObserver(syncSavedTheme).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});
