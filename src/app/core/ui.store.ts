import { Injectable, signal } from '@angular/core';
import { Theme } from '../models';

@Injectable({ providedIn: 'root' })
export class UiStore {
  private readonly themeState = signal<Theme>(this.initialTheme());
  private readonly sidebarOpenState = signal(localStorage.getItem('orfina.sidebar-open') === 'true');
  private readonly userMenuOpenState = signal(false);

  readonly theme = this.themeState.asReadonly();
  readonly sidebarOpen = this.sidebarOpenState.asReadonly();
  readonly userMenuOpen = this.userMenuOpenState.asReadonly();

  setTheme(theme: Theme) {
    this.themeState.set(theme);
    localStorage.setItem('orfina.theme', theme);
  }

  toggleTheme() { this.setTheme(this.themeState() === 'dark' ? 'light' : 'dark'); }

  setSidebarOpen(open: boolean, persist = false) {
    this.sidebarOpenState.set(open);
    if (persist) localStorage.setItem('orfina.sidebar-open', String(open));
  }

  toggleUserMenu() { this.userMenuOpenState.update((open) => !open); }
  setUserMenuOpen(open: boolean) { this.userMenuOpenState.set(open); }
  closeUserMenu() { this.userMenuOpenState.set(false); }

  private initialTheme(): Theme {
    const saved = localStorage.getItem('orfina.theme') as Theme | null;
    return saved === 'dark' || saved === 'light'
      ? saved
      : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
}
