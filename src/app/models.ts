export type Theme = 'light' | 'dark';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type AccountType = 'CHECKING' | 'SALARY' | 'SAVINGS' | 'INVESTMENT' | 'CASH';

export interface Household { id: string; name: string; currency: string; timezone: string; members: { role: string }[]; }
export interface HouseholdMember { householdId: string; userId: string; role: string; user: { id: string; name: string; email: string; avatarUrl?: string }; }
export interface HouseholdInvitation { id: string; householdId: string; email: string; role: 'MEMBER' | 'VIEWER'; status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED'; expiresAt: string; household?: { id: string; name: string; currency: string }; }
export interface Account { id: string; name: string; type: AccountType; bankName?: string; initialBalance: number; balance?: number; isActive: boolean; }
export interface Subcategory { id: string; name: string; categoryId: string; isActive: boolean; }
export interface Category { id: string; name: string; type: TransactionType; color: string; icon: string; isActive: boolean; subcategories: Subcategory[]; }
export interface Transaction { id: string; description: string; amount: number; type: TransactionType; occurredOn: string; notes?: string; account: Account; category: Category; subcategory: Subcategory; }
export interface TransactionFilters { page?: number; pageSize?: number; from?: string; to?: string; accountId?: string; categoryId?: string; subcategoryId?: string; type?: TransactionType; }
export interface TransactionPage { items: Transaction[]; total: number; page: number; pageSize: number; }
export interface Overview { totalBalance: number; accounts: Account[]; recentTransactions: Transaction[]; }
