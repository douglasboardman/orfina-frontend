import { Injectable } from '@angular/core';
import { Account, Category, Household, HouseholdInvitation, HouseholdMember, Overview, Subcategory, Transaction, TransactionFilters, TransactionPage, TransactionType } from './models';
import { environment } from '../environments/environment';

const API_URL = (globalThis as typeof globalThis & { ORFINA_API_URL?: string }).ORFINA_API_URL ?? environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {
  async me(): Promise<{ id: string; email: string; name: string }> { return this.request('/auth/me'); }
  async logout(): Promise<void> { await this.request('/auth/logout', { method: 'POST' }); }

  async getHouseholds(): Promise<Household[]> { return this.request('/households'); }
  async createHousehold(name: string): Promise<Household> { return this.request('/households', { method: 'POST', body: JSON.stringify({ name }) }); }
  async householdMembers(id: string): Promise<HouseholdMember[]> { return this.request(`/households/${id}/members`); }
  async householdInvitations(id: string): Promise<HouseholdInvitation[]> { return this.request(`/households/${id}/invitations`); }
  async createHouseholdInvitation(id: string, data: { email: string; role: 'MEMBER' | 'VIEWER' }): Promise<HouseholdInvitation> { return this.request(`/households/${id}/invitations`, { method: 'POST', body: JSON.stringify(data) }); }
  async revokeHouseholdInvitation(id: string, invitationId: string): Promise<HouseholdInvitation> { return this.request(`/households/${id}/invitations/${invitationId}/revoke`, { method: 'PATCH' }); }
  async myHouseholdInvitations(): Promise<HouseholdInvitation[]> { return this.request('/households/invitations/mine'); }
  async acceptHouseholdInvitation(invitationId: string): Promise<HouseholdInvitation> { return this.request(`/households/invitations/${invitationId}/accept`, { method: 'POST' }); }
  async overview(id: string): Promise<Overview> { return this.request(`/households/${id}/overview`); }
  async accounts(id: string): Promise<Account[]> { return this.request(`/households/${id}/accounts`); }
  async categories(id: string): Promise<Category[]> { return this.request(`/households/${id}/categories`); }
  async createAccount(id: string, data: { name: string; type: string; bankName?: string; initialBalance: number }): Promise<Account> { return this.request(`/households/${id}/accounts`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateAccount(id: string, accountId: string, data: { name: string; type: string; bankName?: string; initialBalance: number }): Promise<Account> { return this.request(`/households/${id}/accounts/${accountId}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async setAccountStatus(id: string, accountId: string, isActive: boolean): Promise<Account> { return this.request(`/households/${id}/accounts/${accountId}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }); }
  async createCategory(id: string, data: { name: string; type: TransactionType; color: string; icon: string }): Promise<Category> { return this.request(`/households/${id}/categories`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateCategory(id: string, categoryId: string, data: { name: string; color: string; icon: string }): Promise<Category> { return this.request(`/households/${id}/categories/${categoryId}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async setCategoryStatus(id: string, categoryId: string, isActive: boolean): Promise<Category> { return this.request(`/households/${id}/categories/${categoryId}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }); }
  async createSubcategory(id: string, categoryId: string, data: { name: string }): Promise<Subcategory> { return this.request(`/households/${id}/categories/${categoryId}/subcategories`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateSubcategory(id: string, subcategoryId: string, data: { name: string }): Promise<Subcategory> { return this.request(`/households/${id}/subcategories/${subcategoryId}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async setSubcategoryStatus(id: string, subcategoryId: string, isActive: boolean): Promise<Subcategory> { return this.request(`/households/${id}/subcategories/${subcategoryId}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }); }
  async transactions(id: string, filters: TransactionFilters = {}): Promise<TransactionPage> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value !== undefined && value !== '') query.set(key, String(value));
    const suffix = query.size ? `?${query.toString()}` : '';
    return this.request(`/households/${id}/transactions${suffix}`);
  }
  async createTransaction(id: string, data: { accountId: string; subcategoryId: string; type: TransactionType; amount: number; description: string; occurredOn: string; notes?: string }): Promise<Transaction> { return this.request(`/households/${id}/transactions`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateTransaction(id: string, transactionId: string, data: { accountId: string; subcategoryId: string; type: TransactionType; amount: number; description: string; occurredOn: string; notes?: string }): Promise<Transaction> { return this.request(`/households/${id}/transactions/${transactionId}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async deleteTransaction(id: string, transactionId: string): Promise<void> { await this.request(`/households/${id}/transactions/${transactionId}`, { method: 'DELETE' }); }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = init.body === undefined ? {} : { 'Content-Type': 'application/json' };
    const response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers: { ...headers, ...init.headers } });
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => ({}));
      const message = typeof body === 'object' && body && 'message' in body ? String(body.message) : 'Não foi possível concluir a operação.';
      throw new Error(`HTTP ${response.status}: ${message}`);
    }
    return response.json() as Promise<T>;
  }
}
