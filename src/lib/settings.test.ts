import { afterEach, describe, expect, it } from 'vitest';
import { fontOptions, loadSettings, saveSettings } from './settings';

afterEach(() => localStorage.clear());

describe('editor settings', () => {
  it('uses gothic as the initial font', () => {
    expect(loadSettings()).toEqual({ font: 'gothic', theme: 'dark' });
    expect(fontOptions.gothic).toContain('Yu Gothic');
  });

  it('persists valid settings and ignores invalid stored values', () => {
    saveSettings({ font: 'serif', theme: 'light' });
    expect(loadSettings()).toEqual({ font: 'serif', theme: 'light' });

    localStorage.setItem('plainmark.settings', '{"font":"unknown","theme":"unknown"}');
    expect(loadSettings()).toEqual({ font: 'gothic', theme: 'dark' });
  });
});
