import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../../core/session.store';
export const systemAdminGuard: CanActivateFn = async () => {
  const session = inject(SessionStore); const router = inject(Router);
  try { if (!await session.restore() || session.user()?.systemRole !== 'SYSTEM_ADMIN') return router.parseUrl('/acesso-restrito'); return true; }
  catch { return router.parseUrl('/erro-conexao'); }
};
