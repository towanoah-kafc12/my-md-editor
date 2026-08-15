export const fontOptions = {
  gothic: '"Yu Gothic UI", "Yu Gothic", "Meiryo", ui-sans-serif, system-ui, sans-serif',
  system: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: 'ui-serif, Georgia, "Yu Mincho", "Hiragino Mincho ProN", serif',
} as const;

export type FontChoice = keyof typeof fontOptions;

const settingsKey = 'plainmark.settings';

interface EditorSettings {
  font: FontChoice;
  theme: ThemeChoice;
}

export const themeOptions = ['dark', 'light', 'midnight'] as const;
export type ThemeChoice = (typeof themeOptions)[number];

const defaults: EditorSettings = { font: 'gothic', theme: 'dark' };

export function loadSettings(): EditorSettings {
  try {
    const saved = localStorage.getItem(settingsKey);
    if (!saved) return defaults;
    const value = JSON.parse(saved) as Partial<EditorSettings>;
    return {
      font: value.font && value.font in fontOptions ? value.font : defaults.font,
      theme: value.theme && themeOptions.includes(value.theme) ? value.theme : defaults.theme,
    };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: EditorSettings) {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}
