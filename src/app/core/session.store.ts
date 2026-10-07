import { Injectable, computed, signal } from '@angular/core';
import { ApiService, API_URL, SessionUser } from '../api.service';

export type { SessionUser } from '../api.service';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly userState = signal<SessionUser | undefined>(undefined);

  readonly user = this.userState.asReadonly();
  readonly authenticated = computed(() => Boolean(this.userState()));

  constructor(private readonly api: ApiService) { window.addEventListener('orfina-session-lost', () => this.userState.set(undefined)); }

  clear() { this.userState.set(undefined); }

  /** Restores a cookie session. A missing or expired session is an expected anonymous state. */
  async restore(): Promise<boolean> {
    try {
      this.userState.set(await this.api.me());
      return true;
    } catch (error: unknown) {
      if (error instanceof Error && error.message.startsWith('HTTP 401:')) { this.userState.set(undefined); return false; }
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.api.logout();
    this.userState.set(undefined);
  }

  beginGoogleSignIn() {
    location.assign(`${API_URL}/auth/google`);
  }
}
