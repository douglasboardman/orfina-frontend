import { Injectable } from '@angular/core';
import { ApiService, SessionUser } from '../../api.service';
export type AccessStatus = 'ENABLED' | 'DISABLED';
export type AuditEntry = { id: string; actorUserId: string | null; actorType: string; action: string; targetId: string; changes: unknown; reason: string | null; createdAt: string };
export type AccessGrant = { id: string; email: string; userId: string | null; status: AccessStatus; source: string; reason: string | null; version: number; createdAt: string; updatedAt: string; user: (SessionUser & { lastLoginAt: string | null; createdAt: string }) | null; history?: AuditEntry[] };
export type Page<T> = { items: T[]; total: number; page: number; pageSize: number };
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  constructor(private readonly api: ApiService) {}
  list(query: Record<string, string | number>) { return this.api.request<Page<AccessGrant>>(`/admin/access-grants?${new URLSearchParams(Object.entries(query).filter(([,value]) => value !== '').map(([key,value]) => [key, String(value)]))}`); }
  detail(id: string) { return this.api.request<AccessGrant>(`/admin/access-grants/${encodeURIComponent(id)}`); }
  create(email: string, reason?: string) { return this.api.request<AccessGrant>('/admin/access-grants', { method: 'POST', body: JSON.stringify({ email, ...(reason ? { reason } : {}) }) }); }
  status(grant: AccessGrant, status: AccessStatus, reason?: string) { return this.api.request<AccessGrant>(`/admin/access-grants/${grant.id}/status`, { method: 'PATCH', body: JSON.stringify({ status, expectedVersion: grant.version, ...(reason ? { reason } : {}) }) }); }
  revoke(userId: string, reason: string) { return this.api.request<{ revokedCount: number }>(`/admin/users/${userId}/revoke-sessions`, { method: 'POST', body: JSON.stringify({ reason }) }); }
  audit(query: Record<string, string | number>) { return this.api.request<Page<AuditEntry>>(`/admin/audit-logs?${new URLSearchParams(Object.entries(query).filter(([,value]) => value !== '').map(([key,value]) => [key, String(value)]))}`); }
}

export function auditActionLabel(action: string) {
  return ({ ACCESS_GRANTED: 'Acesso autorizado', ACCESS_LINKED: 'Identidade vinculada', ACCESS_DISABLED: 'Acesso desabilitado', ACCESS_ENABLED: 'Acesso habilitado', SESSIONS_REVOKED: 'Sessões encerradas', ALL_SESSIONS_REVOKED: 'Todas as sessões encerradas', ADMIN_BOOTSTRAPPED: 'Administrador inicial criado', ADMIN_RECOVERED: 'Acesso administrativo recuperado', ADMIN_PROMOTED: 'Administrador promovido', ADMIN_DEMOTED: 'Administrador rebaixado' } as Record<string, string>)[action] ?? action;
}
