import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ApiService } from './api.service';
import { Account, AccountType, Category, Household, HouseholdInvitation, HouseholdMember, Overview, Theme, Transaction, TransactionFilters, TransactionType } from './models';
import { EmptyStateComponent } from './ui/empty-state.component';
import { FeedbackBannerComponent } from './ui/feedback-banner.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, RouterOutlet, EmptyStateComponent, FeedbackBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  theme: Theme = (localStorage.getItem('orfina.theme') as Theme) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  households: Household[] = [];
  householdMembers: HouseholdMember[] = [];
  householdInvitations: HouseholdInvitation[] = [];
  myHouseholdInvitations: HouseholdInvitation[] = [];
  activeHousehold?: Household;
  overview?: Overview;
  accounts: Account[] = [];
  categories: Category[] = [];
  transactions: Transaction[] = [];
  transactionTotal = 0;
  transactionPage = 1;
  readonly transactionPageSize = 20;
  currentUser?: { id: string; email: string; name: string };
  error = '';
  loading = false;
  sidebarOpen = false;
  userMenuOpen = false;
  householdManagementOpen = false;
  activeView: 'overview' | 'accounts' | 'categories' | 'transactions' = 'overview';
  householdName = '';
  readonly categoryIcons = ['🏷️', '🛒', '🍽️', '🏠', '🚗', '🩺', '📚', '🎓', '🎮', '✈️', '💼', '💰', '📈', '🎁'];
  invitationForm: { email: string; role: 'MEMBER' | 'VIEWER' } = { email: '', role: 'MEMBER' };
  accountForm: { name: string; type: AccountType; bankName: string; initialBalance: number } = { name: '', type: 'CHECKING', bankName: '', initialBalance: 0 };
  categoryForm: { name: string; type: TransactionType; color: string; icon: string } = { name: '', type: 'EXPENSE', color: '#5B5BD6', icon: '🏷️' };
  subcategoryForm: { categoryId: string; name: string } = { categoryId: '', name: '' };
  editingAccountId?: string;
  editingCategoryId?: string;
  editingSubcategoryId?: string;
  editingTransactionId?: string;
  transactionForm: { accountId: string; subcategoryId: string; type: TransactionType; amount: number; description: string; occurredOn: string; notes: string } = { accountId: '', subcategoryId: '', type: 'EXPENSE', amount: 0, description: '', occurredOn: new Date().toISOString().slice(0, 10), notes: '' };
  transactionFilters: Omit<TransactionFilters, 'page' | 'pageSize'> = { from: '', to: '', accountId: '', categoryId: '', subcategoryId: '', type: undefined };

  constructor(private readonly api: ApiService, private readonly changeDetector: ChangeDetectorRef, private readonly router: Router) {}

  ngOnInit() {
    document.documentElement.dataset['theme'] = this.theme;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.syncViewFromUrl(event.urlAfterRedirects);
    });
    this.syncViewFromUrl(this.router.url);
    void this.initialize();
  }

  get authenticated() { return Boolean(this.currentUser); }
  get canManageActiveHousehold() {
    const role = this.activeHousehold?.members[0]?.role;
    return role === 'OWNER' || role === 'ADMIN';
  }
  get currency() { return this.activeHousehold?.currency ?? 'BRL'; }
  get filteredSubcategories() {
    return this.categories
      .filter((category) => category.isActive && category.type === this.transactionForm.type)
      .flatMap((category) => category.subcategories
        .filter((subcategory) => subcategory.isActive)
        .map((subcategory) => ({ ...subcategory, category })));
  }
  get expenseCategories() { return this.categories.filter((category) => category.type === 'EXPENSE'); }
  get incomeCategories() { return this.categories.filter((category) => category.type === 'INCOME'); }
  get displayedTransactions() { return this.activeView === 'transactions' ? this.transactions : this.overview?.recentTransactions ?? []; }
  get transactionPageCount() { return Math.max(1, Math.ceil(this.transactionTotal / this.transactionPageSize)); }
  get filterSubcategories() {
    const category = this.categories.find((item) => item.id === this.transactionFilters.categoryId);
    return category?.subcategories.filter((subcategory) => subcategory.isActive) ?? [];
  }
  get displayedAccounts() { return this.activeView === 'accounts' ? this.accounts : this.overview?.accounts ?? []; }
  get viewTitle() {
    if (this.activeView === 'accounts') return 'Contas';
    if (this.activeView === 'categories') return 'Categorias';
    if (this.activeView === 'transactions') return 'Lançamentos';
    return `Olá, família ${this.activeHousehold?.name ?? ''}`;
  }
  get viewEyebrow() { return this.activeView === 'overview' ? 'VISÃO GERAL' : this.activeView.toUpperCase(); }
  get userName() {
    return this.currentUser?.name || 'Minha conta';
  }
  get userInitial() { return this.userName.slice(0, 1).toUpperCase(); }

  switchTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('orfina.theme', this.theme);
    document.documentElement.dataset['theme'] = this.theme;
    this.render();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.render();
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    this.render();
  }

  selectView(view: 'overview' | 'accounts' | 'categories' | 'transactions') {
    this.activeView = view;
    this.sidebarOpen = false;
    this.userMenuOpen = false;
    void this.router.navigateByUrl({ overview: '/visao-geral', accounts: '/contas', categories: '/categorias', transactions: '/lancamentos' }[view]);
    this.render();
  }

  signIn() { location.assign('http://localhost:3000/api/auth/google'); }
  async signOut() {
    this.loading = true;
    this.error = '';

    try {
      await this.api.logout();
      localStorage.removeItem('orfina.active-household');
      this.currentUser = undefined;
      this.households = [];
      this.activeHousehold = undefined;
      this.overview = undefined;
      this.accounts = [];
      this.categories = [];
      this.transactions = [];
      this.transactionTotal = 0;
      this.householdMembers = [];
      this.householdInvitations = [];
      this.myHouseholdInvitations = [];
      this.userMenuOpen = false;
      this.householdManagementOpen = false;
      this.sidebarOpen = false;
      this.activeView = 'overview';
      await this.router.navigateByUrl('/visao-geral');
    } catch (error: unknown) {
      this.error = error instanceof Error
        ? `Não foi possível encerrar a sessão (${error.message})`
        : 'Não foi possível encerrar a sessão. Tente novamente.';
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async initialize() {
    try {
      this.currentUser = await this.api.me();
      this.changeDetector.detectChanges();
    } catch (error: unknown) {
      this.currentUser = undefined;
      this.error = error instanceof Error ? `Não foi possível restaurar a sessão (${error.message})` : 'Não foi possível restaurar a sessão.';
      return;
    }
    await this.run(async () => {
      this.households = await this.api.getHouseholds();
      this.myHouseholdInvitations = await this.api.myHouseholdInvitations();
      const saved = localStorage.getItem('orfina.active-household');
      this.activeHousehold = this.households.find((item) => item.id === saved) ?? this.households[0];
      if (this.activeHousehold) await this.loadDashboard();
    });
  }

  async selectHousehold(id: string) {
    this.activeHousehold = this.households.find((item) => item.id === id);
    if (this.activeHousehold) {
      localStorage.setItem('orfina.active-household', id);
      this.householdManagementOpen = false;
      this.householdMembers = [];
      this.householdInvitations = [];
      await this.run(() => this.loadDashboard());
    }
  }

  async createHousehold() {
    if (!this.householdName.trim()) return;
    await this.run(async () => {
      const household = await this.api.createHousehold(this.householdName);
      this.households = [...this.households, household];
      this.householdName = '';
      await this.selectHousehold(household.id);
    });
  }

  async toggleHouseholdManagement() {
    if (!this.canManageActiveHousehold) return;
    this.householdManagementOpen = !this.householdManagementOpen;
    if (this.householdManagementOpen) await this.run(() => this.loadHouseholdManagement());
    else this.render();
  }

  async createHouseholdInvitation() {
    if (!this.activeHousehold || !this.invitationForm.email.trim()) return;
    await this.run(async () => {
      await this.api.createHouseholdInvitation(this.activeHousehold!.id, this.invitationForm);
      this.invitationForm = { email: '', role: 'MEMBER' };
      await this.loadHouseholdManagement();
    });
  }

  async revokeHouseholdInvitation(invitation: HouseholdInvitation) {
    if (!this.activeHousehold || !confirm(`Revogar o convite para ${invitation.email}?`)) return;
    await this.run(async () => {
      await this.api.revokeHouseholdInvitation(this.activeHousehold!.id, invitation.id);
      await this.loadHouseholdManagement();
    });
  }

  async acceptHouseholdInvitation(invitation: HouseholdInvitation) {
    await this.run(async () => {
      await this.api.acceptHouseholdInvitation(invitation.id);
      this.myHouseholdInvitations = await this.api.myHouseholdInvitations();
      this.households = await this.api.getHouseholds();
      this.activeHousehold = this.households.find((item) => item.id === invitation.householdId) ?? this.activeHousehold;
      if (this.activeHousehold) {
        localStorage.setItem('orfina.active-household', this.activeHousehold.id);
        await this.loadDashboard();
      }
    });
  }

  async saveAccount() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      const data = { ...this.accountForm, bankName: this.accountForm.bankName || undefined, initialBalance: Math.round(this.accountForm.initialBalance * 100) };
      if (this.editingAccountId) await this.api.updateAccount(this.activeHousehold!.id, this.editingAccountId, data);
      else await this.api.createAccount(this.activeHousehold!.id, data);
      this.cancelAccountEdit();
      await this.loadDashboard();
    });
  }

  editAccount(account: Account) {
    this.editingAccountId = account.id;
    this.accountForm = { name: account.name, type: account.type, bankName: account.bankName ?? '', initialBalance: account.initialBalance / 100 };
    this.render();
  }

  async viewAccountTransactions(account: Account) {
    this.transactionFilters = { from: '', to: '', accountId: account.id, categoryId: '', subcategoryId: '', type: undefined };
    this.selectView('transactions');
    await this.applyTransactionFilters();
  }

  cancelAccountEdit() {
    this.editingAccountId = undefined;
    this.accountForm = { name: '', type: 'CHECKING', bankName: '', initialBalance: 0 };
  }

  async setAccountStatus(account: Account, isActive: boolean) {
    if (!this.activeHousehold || !confirm(`${isActive ? 'Reativar' : 'Arquivar'} a conta ${account.name}?`)) return;
    await this.run(async () => {
      await this.api.setAccountStatus(this.activeHousehold!.id, account.id, isActive);
      await this.loadDashboard();
    });
  }

  async saveCategory() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      if (this.editingCategoryId) {
        const { name, color, icon } = this.categoryForm;
        await this.api.updateCategory(this.activeHousehold!.id, this.editingCategoryId, { name, color, icon });
      } else await this.api.createCategory(this.activeHousehold!.id, this.categoryForm);
      this.cancelCategoryEdit();
      this.categories = await this.api.categories(this.activeHousehold!.id);
    });
  }

  editCategory(category: Category) {
    this.editingCategoryId = category.id;
    this.categoryForm = { name: category.name, type: category.type, color: category.color, icon: category.icon };
    this.render();
  }

  cancelCategoryEdit() {
    this.editingCategoryId = undefined;
    this.categoryForm = { name: '', type: 'EXPENSE', color: '#5B5BD6', icon: '🏷️' };
  }

  async setCategoryStatus(category: Category, isActive: boolean) {
    if (!this.activeHousehold || !confirm(`${isActive ? 'Reativar' : 'Arquivar'} a categoria ${category.name}?`)) return;
    await this.run(async () => {
      await this.api.setCategoryStatus(this.activeHousehold!.id, category.id, isActive);
      this.categories = await this.api.categories(this.activeHousehold!.id);
    });
  }

  async saveSubcategory() {
    if (!this.activeHousehold || !this.subcategoryForm.categoryId) return;
    await this.run(async () => {
      if (this.editingSubcategoryId) await this.api.updateSubcategory(this.activeHousehold!.id, this.editingSubcategoryId, { name: this.subcategoryForm.name });
      else await this.api.createSubcategory(this.activeHousehold!.id, this.subcategoryForm.categoryId, { name: this.subcategoryForm.name });
      this.cancelSubcategoryEdit();
      this.categories = await this.api.categories(this.activeHousehold!.id);
    });
  }

  editSubcategory(category: Category, subcategory: Category['subcategories'][number]) {
    this.editingSubcategoryId = subcategory.id;
    this.subcategoryForm = { categoryId: category.id, name: subcategory.name };
    this.render();
  }

  cancelSubcategoryEdit() {
    this.editingSubcategoryId = undefined;
    this.subcategoryForm = { categoryId: '', name: '' };
  }

  async setSubcategoryStatus(category: Category, subcategory: Category['subcategories'][number], isActive: boolean) {
    if (!this.activeHousehold || !confirm(`${isActive ? 'Reativar' : 'Arquivar'} a subcategoria ${subcategory.name}?`)) return;
    await this.run(async () => {
      await this.api.setSubcategoryStatus(this.activeHousehold!.id, subcategory.id, isActive);
      this.categories = await this.api.categories(this.activeHousehold!.id);
    });
  }

  onTransactionTypeChange() { this.transactionForm.subcategoryId = ''; }

  async applyTransactionFilters(page = 1) {
    if (!this.activeHousehold) return;
    this.transactionPage = page;
    await this.run(() => this.loadTransactions());
  }

  clearTransactionFilters() {
    this.transactionFilters = { from: '', to: '', accountId: '', categoryId: '', subcategoryId: '', type: undefined };
    void this.applyTransactionFilters();
  }

  onFilterCategoryChange() {
    this.transactionFilters.subcategoryId = '';
    void this.applyTransactionFilters();
  }

  async saveTransaction() {
    if (!this.activeHousehold) return;
    await this.run(async () => {
      const data = { ...this.transactionForm, notes: this.transactionForm.notes || undefined, amount: Math.round(this.transactionForm.amount * 100) };
      if (this.editingTransactionId) await this.api.updateTransaction(this.activeHousehold!.id, this.editingTransactionId, data);
      else await this.api.createTransaction(this.activeHousehold!.id, data);
      this.cancelTransactionEdit();
      await this.loadDashboard();
    });
  }

  editTransaction(transaction: Transaction) {
    this.editingTransactionId = transaction.id;
    this.transactionForm = {
      accountId: transaction.account.id,
      subcategoryId: transaction.subcategory.id,
      type: transaction.type,
      amount: transaction.amount / 100,
      description: transaction.description,
      occurredOn: transaction.occurredOn.slice(0, 10),
      notes: transaction.notes ?? '',
    };
    this.render();
  }

  cancelTransactionEdit() {
    this.editingTransactionId = undefined;
    this.transactionForm = { accountId: this.overview?.accounts[0]?.id ?? '', subcategoryId: '', type: 'EXPENSE', amount: 0, description: '', occurredOn: new Date().toISOString().slice(0, 10), notes: '' };
  }

  async deleteTransaction(transactionId: string) {
    if (!this.activeHousehold || !confirm('Excluir este lançamento? Esta ação não pode ser desfeita.')) return;
    await this.run(async () => {
      await this.api.deleteTransaction(this.activeHousehold!.id, transactionId);
      await this.loadDashboard();
    });
  }

  private async loadDashboard() {
    if (!this.activeHousehold) return;
    const [overview, accounts, categories] = await Promise.all([this.api.overview(this.activeHousehold.id), this.api.accounts(this.activeHousehold.id), this.api.categories(this.activeHousehold.id)]);
    this.overview = overview;
    this.accounts = accounts;
    this.categories = categories;
    await this.loadTransactions();
    if (!this.transactionForm.accountId) this.transactionForm.accountId = this.overview.accounts[0]?.id ?? '';
  }

  private async loadTransactions() {
    if (!this.activeHousehold) return;
    const page = await this.api.transactions(this.activeHousehold.id, { ...this.transactionFilters, page: this.transactionPage, pageSize: this.transactionPageSize });
    this.transactions = page.items;
    this.transactionTotal = page.total;
    this.transactionPage = page.page;
  }

  private async loadHouseholdManagement() {
    if (!this.activeHousehold) return;
    [this.householdMembers, this.householdInvitations] = await Promise.all([
      this.api.householdMembers(this.activeHousehold.id),
      this.api.householdInvitations(this.activeHousehold.id),
    ]);
  }

  private async run(action: () => Promise<void>) {
    this.loading = true;
    this.error = '';
    try { await action(); } catch (error: unknown) { this.error = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'; } finally {
      this.loading = false;
      this.render();
    }
  }

  private render() {
    queueMicrotask(() => this.changeDetector.detectChanges());
  }

  private syncViewFromUrl(url: string) {
    const path = url.split('?')[0];
    const view = path === '/contas' ? 'accounts'
      : path === '/categorias' ? 'categories'
        : path === '/lancamentos' ? 'transactions'
          : 'overview';
    this.activeView = view;
    this.render();
  }
}
