import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { ApiService } from '../api.service';
import { SessionStore } from './session.store';

describe('SessionStore', () => {
  it('treats a 401 from /auth/me as an anonymous session', async () => {
    const api = { me: vi.fn().mockRejectedValue(new Error('HTTP 401: Unauthorized')), logout: vi.fn() };
    TestBed.configureTestingModule({ providers: [SessionStore, { provide: ApiService, useValue: api }] });
    const store = TestBed.inject(SessionStore);

    await expect(store.restore()).resolves.toBe(false);
    expect(store.authenticated()).toBe(false);
    expect(store.user()).toBeUndefined();
  });

  it('keeps an authenticated user and clears it after logout', async () => {
    const user = { id: 'user_1', email: 'ana@example.test', name: 'Ana' };
    const api = { me: vi.fn().mockResolvedValue(user), logout: vi.fn().mockResolvedValue(undefined) };
    TestBed.configureTestingModule({ providers: [SessionStore, { provide: ApiService, useValue: api }] });
    const store = TestBed.inject(SessionStore);

    await expect(store.restore()).resolves.toBe(true);
    expect(store.user()).toEqual(user);
    await store.logout();
    expect(store.authenticated()).toBe(false);
  });
});
