import api from './client';
import type { Sale, PaginatedResponse } from '@/types';
import type { PaymentMethod } from '@/types';

export interface CreateSalePayload {
  customerId?: string;
  items: { productId: string; quantity: number; price?: number }[];
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  note?: string;
}

export const salesApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/sales', { params }) as Promise<PaginatedResponse<Sale>>,
  getOne: (id: string) => api.get(`/sales/${id}`) as Promise<Sale>,
  create: (data: CreateSalePayload) => api.post('/sales', data) as Promise<Sale>,
  getDailyStats: () => api.get('/sales/daily-stats') as Promise<any>,
};
