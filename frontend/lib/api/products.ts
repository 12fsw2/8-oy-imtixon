import api from './client';
import type { Product, PaginatedResponse } from '@/types';

export interface CreateProductPayload {
  name: string;
  categoryId?: string;
  sku?: string;
  barcode?: string;
  purchasePrice: number;
  salePrice: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  description?: string;
}

export const productsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/products', { params }) as Promise<PaginatedResponse<Product>>,
  getOne: (id: string) => api.get(`/products/${id}`) as Promise<Product>,
  getByBarcode: (barcode: string) =>
    api.get(`/products/barcode/${barcode}`) as Promise<Product>,
  getLowStock: () => api.get('/products/low-stock') as Promise<Product[]>,
  create: (data: CreateProductPayload) =>
    api.post('/products', data) as Promise<Product>,
  update: (id: string, data: Partial<CreateProductPayload>) =>
    api.patch(`/products/${id}`, data) as Promise<Product>,
  delete: (id: string) => api.delete(`/products/${id}`),
};
