import { Injectable, signal } from '@angular/core';
import { AdminApiService, AccessGrant, Page } from './admin-api.service';
@Injectable({ providedIn: 'root' })
export class AdminAccessStore {
  readonly data = signal<Page<AccessGrant>>({ items: [], total: 0, page: 1, pageSize: 25 });
  readonly loading = signal(false); readonly error = signal(''); readonly feedback = signal('');
  search = ''; status = ''; linked = ''; page = 1;
  private sequence = 0;
  constructor(private readonly api: AdminApiService) {}
  async load() {
    const sequence = ++this.sequence;
    this.loading.set(true); this.error.set('');
    try { const result = await this.api.list({ page: this.page, pageSize: 25, search: this.search, status: this.status, linked: this.linked }); if (sequence === this.sequence) this.data.set(result); }
    catch (error: unknown) { if (sequence === this.sequence) this.error.set(error instanceof Error ? error.message : 'Não foi possível carregar os acessos.'); }
    finally { if (sequence === this.sequence) this.loading.set(false); }
  }
  clear() { this.sequence++; this.data.set({ items: [], total: 0, page: 1, pageSize: 25 }); this.search = ''; this.status = ''; this.linked = ''; this.page = 1; this.feedback.set(''); }
}
