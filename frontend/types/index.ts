export type Role = 'OWNER' | 'MANAGER' | 'SELLER';
export type SaleStatus = 'PAID' | 'PARTIAL' | 'UNPAID';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  companyId: string;
  company?: Company;
}

export interface Company {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  categoryId?: string;
  category?: Category;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone?: string;
  address?: string;
  totalDebt: number;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  product?: Pick<Product, 'id' | 'name' | 'unit'>;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  customer?: Pick<Customer, 'id' | 'fullName' | 'phone'>;
  userId: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  status: SaleStatus;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  note?: string;
  items?: SaleItem[];
  createdAt: string;
}

export interface Payment {
  id: string;
  saleId?: string;
  debtId?: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  customerId: string;
  customer?: Pick<Customer, 'id' | 'fullName' | 'phone'>;
  saleId?: string;
  totalAmount: number;
  paidAmount: number;
  remaining: number;
  dueDate?: string;
  isPaid: boolean;
  createdAt: string;
  payments?: Payment[];
}

export interface InventoryMovement {
  id: string;
  productId: string;
  product?: Pick<Product, 'id' | 'name' | 'unit'>;
  userId: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  type: MovementType;
  quantity: number;
  beforeStock: number;
  afterStock: number;
  note?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
