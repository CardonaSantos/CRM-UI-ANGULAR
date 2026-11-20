import { TestBed } from '@angular/core/testing';
import { accentVariables, hexToHsl, normalizeHexColor } from './accent';
import { UI_PREFERENCES_STORAGE_KEY } from './preferences-storage';
import { ThemeService } from './theme.service';
import { DEFAULT_PREFS } from './ui-preferences';

describe('accent', () => {
  it('normaliza hex corto y largo', () => {
    expect(normalizeHexColor('#ABC')).toBe('#aabbcc');
    expect(normalizeHexColor(' #20C497 ')).toBe('#20c497');
    expect(normalizeHexColor('rojo')).toBeNull();
  });

  it('convierte a HSL', () => {
    expect(hexToHsl('#ff0000')).toEqual({ h: 0, s: 100, l: 50 });
  });

  it('cambia el texto sobre primario según el modo', () => {
    expect(accentVariables('#2f7bf5', false)?.['--app-primary-foreground']).toBe('0 0% 100%');
    expect(accentVariables('#2f7bf5', true)?.['--app-primary-foreground']).toBe('195 18% 7%');
  });
});

describe('ThemeService', () => {
  const root = document.documentElement;

  beforeEach(() => {
    localStorage.clear();
    root.className = '';
    root.removeAttribute('style');
  });

  it('aplica densidad, radio, escala y modo en <html>', () => {
    const theme = TestBed.inject(ThemeService);
    theme.update({ appearance: 'dark', density: 'compact', radius: 'lg', scale: 1.25 });
    TestBed.tick();

    expect(root.classList.contains('dark')).toBe(true);
    expect(root.dataset['density']).toBe('compact');
    expect(root.dataset['radius']).toBe('lg');
    expect(root.style.getPropertyValue('--app-scale')).toBe('1.25');
  });

  it('aplica un acento distinto al de NOVA y lo limpia al volver', () => {
    const theme = TestBed.inject(ThemeService);
    theme.update({ accent: '#2f7bf5' });
    TestBed.tick();
    expect(root.style.getPropertyValue('--app-primary')).not.toBe('');

    theme.reset();
    TestBed.tick();
    expect(root.style.getPropertyValue('--app-primary')).toBe('');
  });

  it('persiste las preferencias', () => {
    TestBed.inject(ThemeService).update({ density: 'spacious' });
    TestBed.tick();
    const saved = JSON.parse(localStorage.getItem(UI_PREFERENCES_STORAGE_KEY) ?? '{}');
    expect(saved).toEqual({ ...DEFAULT_PREFS, density: 'spacious' });
  });
});
