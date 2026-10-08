import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from './api.service';

describe('ApiService session recovery', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('silently refreshes the short access session once and retries the original request', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'SESSION_INVALID', message: 'Sessão inválida.' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetch);
    document.cookie = 'orfina_csrf=csrf-proof; Path=/';

    await expect(new ApiService().getHouseholds()).resolves.toEqual([]);

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      'http://localhost:3000/api/households',
      'http://localhost:3000/api/auth/refresh',
      'http://localhost:3000/api/households',
    ]);
    expect(fetch.mock.calls[1][1]).toEqual(expect.objectContaining({ method: 'POST', credentials: 'include' }));
  });
});
