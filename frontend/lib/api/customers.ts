import api from './client';
import type { Customer, PaginatedResponse } from '@/types';

export interface CreateCustomerPayload {
  fullName: string;
  phone?: string;
  address?: string;
}

export const customersApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/customers', { params }) as Promise<PaginatedResponse<Customer>>,
  getOne: (id: string) => api.get(`/customers/${id}`) as Promise<Customer>,
  getDebtors: () => api.get('/customers/debtors') as Promise<Customer[]>,
  create: (data: CreateCustomerPayload) =>
    api.post('/customers', data) as Promise<Customer>,
  update: (id: string, data: Partial<CreateCustomerPayload>) =>
    api.patch(`/customers/${id}`, data) as Promise<Customer>,
  delete: (id: string) => api.delete(`/customers/${id}`),
};
