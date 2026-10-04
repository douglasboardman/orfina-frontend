import { Injectable, computed, signal } from '@angular/core';
import { ApiService } from '../api.service';

export type SessionUser = { id: string; email: string; name: string };

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly userState = signal<SessionUser | undefined>(undefined);

  readonly user = this.userState.asReadonly();
  readonly authenticated = computed(() => Boolean(this.userState()));

  constructor(private readonly api: ApiService) {}

  /** Restores a cookie session. A missing or expired session is an expected anonymous state. */
  async restore(): Promise<boolean> {
    try {
      this.userState.set(await this.api.me());
      return true;
    } catch (error: unknown) {
      this.userState.set(undefined);
      if (error instanceof Error && error.message.startsWith('HTTP 401:')) return false;
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.api.logout();
    this.userState.set(undefined);
  }

  beginGoogleSignIn() {
    location.assign('http://localhost:3000/api/auth/google');
  }
}
