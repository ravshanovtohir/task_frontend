export type RoleKey = "ADMIN" | "PAYMENT" | "REPORTS";
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
  meta?: { totalItems: number; currentPage: number; totalSize: number };
};
export type UserRole =
  | RoleKey
  | { key: RoleKey; id?: number; title?: { uz?: string } }
  | { role: { key: RoleKey; id: number; title?: { uz?: string } } };
export type User = {
  id: number;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  roles: UserRole[];
};
export type Role = { id: number; key: RoleKey; title?: { uz?: string } };
export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
export type Transaction = {
  id: number;
  reference: string;
  payerEmail: string;
  amount: number;
  status: TransactionStatus;
  statusLabel: string;
  provider: string;
  createdAt: string;
};
export type Report = {
  summary: {
    totalTransactions: number;
    totalAmount: number;
    successCount: number;
    pendingCount: number;
    failedCount: number;
    refundedCount: number;
    successfulAmount: number;
  };
  daily: { date: string; count: number; amount: number }[];
};
