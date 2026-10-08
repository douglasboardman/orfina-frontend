import { Injectable } from '@angular/core';
import { Account, AccountTransfer, AccountTransferStatus, BudgetSummary, Card, CardStatement, Category, Household, HouseholdInvitation, HouseholdMember, ImportBatch, InstallmentPurchase, Overview, RecurringMaterializationMode, RecurringRule, RecurringRuleStatus, SavingsGoal, SavingsGoalStatus, Subcategory, Transaction, TransactionFilters, TransactionPage, TransactionStatus, TransactionType } from './models';
import { CardNetwork } from './financial-brands';
import { environment } from '../environments/environment';

export const API_URL = (globalThis as typeof globalThis & { ORFINA_API_URL?: string }).ORFINA_API_URL ?? environment.apiUrl;

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string, readonly issues: { path: string; message: string }[] = [], readonly grantId?: string) { super(`HTTP ${status}: ${message}`); }
}
export type SessionUser = { id: string; email: string; name: string; systemRole: 'USER' | 'SYSTEM_ADMIN' };

@Injectable({ providedIn: 'root' })
export class ApiService {
  async me(): Promise<SessionUser> { return this.request('/auth/me'); }
  async refreshSession(): Promise<void> { await this.request('/auth/refresh', { method: 'POST' }); }
  async logout(): Promise<void> { await this.request('/auth/logout', { method: 'POST' }); }

  async getHouseholds(): Promise<Household[]> { return this.request('/households'); }
  async createHousehold(name: string): Promise<Household> { return this.request('/households', { method: 'POST', body: JSON.stringify({ name }) }); }
  async updateHousehold(id: string, data: { name?: string; recurringMaterializationMode?: RecurringMaterializationMode; recurringMaterializationValue?: number }): Promise<Household> { return this.request(`/households/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async householdMembers(id: string): Promise<HouseholdMember[]> { return this.request(`/households/${id}/members`); }
  async householdInvitations(id: string): Promise<HouseholdInvitation[]> { return this.request(`/households/${id}/invitations`); }
  async createHouseholdInvitation(id: string, data: { email: string; role: 'MEMBER' | 'VIEWER' }): Promise<HouseholdInvitation> { return this.request(`/households/${id}/invitations`, { method: 'POST', body: JSON.stringify(data) }); }
  async revokeHouseholdInvitation(id: string, invitationId: string): Promise<HouseholdInvitation> { return this.request(`/households/${id}/invitations/${invitationId}/revoke`, { method: 'PATCH' }); }
  async myHouseholdInvitations(): Promise<HouseholdInvitation[]> { return this.request('/households/invitations/mine'); }
  async acceptHouseholdInvitation(invitationId: string): Promise<HouseholdInvitation> { return this.request(`/households/invitations/${invitationId}/accept`, { method: 'POST' }); }
  async overview(id: string, referenceMonth?: string): Promise<Overview> {
    const suffix = referenceMonth ? `?referenceMonth=${encodeURIComponent(referenceMonth)}` : '';
    return this.request(`/households/${id}/overview${suffix}`);
  }
  async version(): Promise<{ version: string; build?: string }> { return this.request('/version'); }
  async accounts(id: string): Promise<Account[]> { return this.request(`/households/${id}/accounts`); }
  async categories(id: string): Promise<Category[]> { return this.request(`/households/${id}/categories`); }
  async createAccount(id: string, data: { name: string; type: string; bankName?: string; bankLogoUrl?: string; initialBalance: number }): Promise<Account> { return this.request(`/households/${id}/accounts`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateAccount(id: string, accountId: string, data: { name: string; type: string; bankName?: string; bankLogoUrl?: string; initialBalance: number }): Promise<Account> { return this.request(`/households/${id}/accounts/${accountId}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async setAccountStatus(id: string, accountId: string, isActive: boolean): Promise<Account> { return this.request(`/households/${id}/accounts/${accountId}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }); }
  async cards(id: string): Promise<Card[]> { return this.request(`/households/${id}/cards`); }
  async createCard(id: string, data: { name: string; issuerName?: string; issuerLogoUrl?: string; network: CardNetwork; lastFour?: string; creditLimit?: number; closingDay: number; dueDay: number }): Promise<Card> { return this.request(`/households/${id}/cards`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateCard(id: string, cardId: string, data: { name?: string; issuerName?: string; issuerLogoUrl?: string; network?: CardNetwork; lastFour?: string; creditLimit?: number; closingDay?: number; dueDay?: number }): Promise<Card> { return this.request(`/households/${id}/cards/${cardId}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async setCardStatus(id: string, cardId: string, isActive: boolean): Promise<Card> { return this.request(`/households/${id}/cards/${cardId}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }); }
  async cardStatements(id: string, cardId: string): Promise<CardStatement[]> { return this.request(`/households/${id}/cards/${cardId}/statements`); }
  async closeStatement(id: string, statementId: string): Promise<CardStatement> { return this.request(`/households/${id}/statements/${statementId}/close`, { method: 'POST' }); }
  async payStatement(id: string, statementId: string, data: { accountId: string; amount: number; paidOn: string; idempotencyKey: string }): Promise<void> { await this.request(`/households/${id}/statements/${statementId}/payments`, { method: 'POST', body: JSON.stringify(data) }); }
  async createInstallmentPurchase(id: string, data: { accountId?: string; cardId?: string; subcategoryId: string; type: TransactionType; totalAmount: number; installmentCount: number; description: string; firstOccurredOn: string; notes?: string }): Promise<void> { await this.request(`/households/${id}/installment-purchases`, { method: 'POST', body: JSON.stringify(data) }); }
  async installmentPurchases(id: string): Promise<InstallmentPurchase[]> { return this.request(`/households/${id}/installment-purchases`); }
  async cancelFutureInstallments(id: string, purchaseId: string): Promise<void> { await this.request(`/households/${id}/installment-purchases/${purchaseId}/cancel-future`, { method: 'POST' }); }
  async recurringRules(id: string): Promise<RecurringRule[]> { return this.request(`/households/${id}/recurring-rules`); }
  async createRecurringRule(id: string, data: { accountId?: string; cardId?: string; subcategoryId: string; type: TransactionType; amount: number; description: string; notes?: string; startOn: string; endOn?: string }): Promise<RecurringRule> { return this.request(`/households/${id}/recurring-rules`, { method: 'POST', body: JSON.stringify(data) }); }
  async setRecurringRuleStatus(id: string, ruleId: string, status: RecurringRuleStatus): Promise<RecurringRule> { return this.request(`/households/${id}/recurring-rules/${ruleId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
  async budgetSummary(id: string, month: string): Promise<BudgetSummary> { return this.request(`/households/${id}/budgets?month=${encodeURIComponent(month)}`); }
  async upsertBudget(id: string, month: string, data: { categoryId: string; limitAmount: number; notes?: string }): Promise<void> { await this.request(`/households/${id}/budgets/${month}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteBudget(id: string, month: string, categoryId: string): Promise<void> { await this.request(`/households/${id}/budgets/${month}/${categoryId}`, { method: 'DELETE' }); }
  async copyBudgets(id: string, sourceMonth: string, targetMonth: string): Promise<void> { await this.request(`/households/${id}/budgets/copy`, { method: 'POST', body: JSON.stringify({ sourceMonth, targetMonth }) }); }
  async setBudgetMonthClosed(id: string, month: string, closed: boolean): Promise<void> { await this.request(`/households/${id}/budgets/${month}/${closed ? 'close' : 'reopen'}`, { method: 'POST' }); }
  async goals(id: string): Promise<SavingsGoal[]> { return this.request(`/households/${id}/goals`); }
  async createGoal(id: string, data: { name: string; targetAmount: number; targetDate?: string; color: string; icon?: string }): Promise<SavingsGoal> { return this.request(`/households/${id}/goals`, { method: 'POST', body: JSON.stringify(data) }); }
  async setGoalStatus(id: string, goalId: string, status: SavingsGoalStatus): Promise<SavingsGoal> { return this.request(`/households/${id}/goals/${goalId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
  async contributeToGoal(id: string, goalId: string, data: { amount: number; occurredOn: string; notes?: string; idempotencyKey: string }): Promise<void> { await this.request(`/households/${id}/goals/${goalId}/contributions`, { method: 'POST', body: JSON.stringify(data) }); }
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
  async createTransaction(id: string, data: { accountId?: string; cardId?: string; subcategoryId: string; type: TransactionType; amount: number; description: string; occurredOn: string; notes?: string }): Promise<Transaction> { return this.request(`/households/${id}/transactions`, { method: 'POST', body: JSON.stringify(data) }); }
  async updateTransaction(id: string, transactionId: string, data: { accountId?: string; cardId?: string; subcategoryId: string; type: TransactionType; amount: number; description: string; occurredOn: string; notes?: string }): Promise<Transaction> { return this.request(`/households/${id}/transactions/${transactionId}`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async updateTransactionOccurrence(id: string, transactionId: string, data: { accountId?: string; cardId?: string; subcategoryId: string; type: TransactionType; amount: number; description: string; occurredOn: string; notes?: string; scope: 'ONE' | 'FOLLOWING' }): Promise<Transaction> { return this.request(`/households/${id}/transactions/${transactionId}/occurrence`, { method: 'PATCH', body: JSON.stringify(data) }); }
  async deleteTransaction(id: string, transactionId: string): Promise<void> { await this.request(`/households/${id}/transactions/${transactionId}`, { method: 'DELETE' }); }
  async setTransactionStatus(id: string, transactionId: string, status: TransactionStatus): Promise<Transaction> { return this.request(`/households/${id}/transactions/${transactionId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
  async transfers(id: string): Promise<AccountTransfer[]> { return this.request(`/households/${id}/transfers`); }
  async createTransfer(id: string, data: { sourceAccountId: string; destinationAccountId: string; amount: number; occurredOn: string; description?: string; status?: AccountTransferStatus }): Promise<AccountTransfer> { return this.request(`/households/${id}/transfers`, { method: 'POST', body: JSON.stringify(data) }); }
  async setTransferStatus(id: string, transferId: string, status: AccountTransferStatus): Promise<AccountTransfer> { return this.request(`/households/${id}/transfers/${transferId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); }
  async importBatches(id: string): Promise<ImportBatch[]> { return this.request(`/households/${id}/imports`); }
  async previewImport(id: string, data: { fileName: string; contentBase64: string; mapping: Record<string, string>; accountId?: string }): Promise<ImportBatch> { return this.request(`/households/${id}/imports`, { method: 'POST', body: JSON.stringify(data) }); }
  async commitImport(id: string, batchId: string, createMissingCategories: boolean): Promise<ImportBatch> { return this.request(`/households/${id}/imports/${batchId}/commit`, { method: 'POST', body: JSON.stringify({ createMissingCategories }) }); }
  async cancelImport(id: string, batchId: string): Promise<ImportBatch> { return this.request(`/households/${id}/imports/${batchId}/cancel`, { method: 'POST' }); }

  async request<T>(path: string, init: RequestInit = {}, retriedAfterRefresh = false): Promise<T> {
    const headers: Record<string, string> = init.body === undefined ? {} : { 'Content-Type': 'application/json' };
    if (init.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method)) {
      const csrfCookie = document.cookie.split('; ').find((item) => item.startsWith('__Host-orfina_csrf=')) ?? document.cookie.split('; ').find((item) => item.startsWith('orfina_csrf='));
      const csrf = csrfCookie?.slice(csrfCookie.indexOf('=') + 1);
      if (csrf) headers['X-Orfina-CSRF'] = decodeURIComponent(csrf);
    }
    const response = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include', headers: { ...headers, ...init.headers } });
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => ({}));
      const message = typeof body === 'object' && body && 'message' in body ? String(body.message) : 'Não foi possível concluir a operação.';
      const detail = body as { code?: string; grantId?: string; issues?: { path: string; message: string }[] };
      if (response.status === 401 && !retriedAfterRefresh && path !== '/auth/refresh' && path !== '/auth/logout') {
        try {
          await this.request<void>('/auth/refresh', { method: 'POST' }, true);
          return this.request<T>(path, init, true);
        } catch { /* The original request reports the definitive failure below. */ }
      }
      if (response.status === 401 && path !== '/auth/me' && path !== '/auth/logout' && path !== '/auth/refresh') window.dispatchEvent(new Event('orfina-session-lost'));
      throw new ApiError(response.status, detail.code ?? 'REQUEST_FAILED', message, detail.issues, detail.grantId);
    }
    return response.json() as Promise<T>;
  }
}
