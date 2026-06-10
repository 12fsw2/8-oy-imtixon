import api from './client';
import type { Debt, PaginatedResponse } from '@/types';
import type { PaymentMethod } from '@/types';

export const debtsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/debts', { params }) as Promise<PaginatedResponse<Debt>>,
  getOne: (id: string) => api.get(`/debts/${id}`) as Promise<Debt>,
  getStats: () => api.get('/debts/stats') as Promise<any>,
  pay: (id: string, data: { amount: number; method?: PaymentMethod; note?: string }) =>
    api.post(`/debts/${id}/pay`, data) as Promise<Debt>,
};
