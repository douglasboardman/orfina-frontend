export type Theme = 'light' | 'dark';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type AccountType = 'CHECKING' | 'SALARY' | 'SAVINGS' | 'INVESTMENT' | 'CASH';

export interface Household { id: string; name: string; currency: string; timezone: string; members: { role: string }[]; }
export interface HouseholdMember { householdId: string; userId: string; role: string; user: { id: string; name: string; email: string; avatarUrl?: string }; }
export interface HouseholdInvitation { id: string; householdId: string; email: string; role: 'MEMBER' | 'VIEWER'; status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED'; expiresAt: string; household?: { id: string; name: string; currency: string }; }
export interface Account { id: string; name: string; type: AccountType; bankName?: string; bankLogoUrl?: string; initialBalance: number; balance?: number; isActive: boolean; }
export interface Card { id: string; name: string; issuerName?: string; issuerLogoUrl?: string; network: import('./financial-brands').CardNetwork; lastFour?: string; creditLimit?: number; closingDay: number; dueDay: number; isActive: boolean; }
export type CardStatementStatus = 'OPEN' | 'CLOSED' | 'PAID';
export interface CardPayment { id: string; accountId: string; amount: number; paidOn: string; }
export interface CardStatement { id: string; cardId: string; cycleStart: string; cycleEnd: string; dueOn: string; totalAmount: number; status: CardStatementStatus; payments: CardPayment[]; }
export interface InstallmentPurchase { id: string; cardId: string; totalAmount: number; installmentCount: number; description: string; firstOccurredOn: string; canceledAt?: string; card: Card; transactions: { id: string; installmentNumber?: number; amount: number; statement?: { status: CardStatementStatus } }[]; }
export type RecurringRuleStatus = 'ACTIVE' | 'PAUSED' | 'ENDED';
export interface RecurringRule { id: string; accountId?: string; cardId?: string; amount: number; description: string; type: TransactionType; startOn: string; endOn?: string; status: RecurringRuleStatus; account?: Account; card?: Card; category: Category; subcategory: Subcategory; }
export interface Subcategory { id: string; name: string; categoryId: string; isActive: boolean; }
export interface Category { id: string; name: string; type: TransactionType; color: string; icon: string; isActive: boolean; subcategories: Subcategory[]; }
export interface Transaction { id: string; description: string; amount: number; type: TransactionType; occurredOn: string; notes?: string; account?: Account; card?: Card; category: Category; subcategory: Subcategory; }
export interface TransactionFilters { page?: number; pageSize?: number; from?: string; to?: string; accountId?: string; cardId?: string; statementId?: string; recurringRuleId?: string; categoryId?: string; subcategoryId?: string; type?: TransactionType; }
export interface TransactionPage { items: Transaction[]; total: number; page: number; pageSize: number; }
export interface Overview { totalBalance: number; accounts: Account[]; recentTransactions: Transaction[]; cardOpenTotal: number; upcomingStatements: (CardStatement & { card: Card })[]; recurringForecast: { id: string; amount: number; description: string; startOn: string; endOn?: string }[]; }
