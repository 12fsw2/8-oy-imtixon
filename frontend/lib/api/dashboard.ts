import api from './client';

export const dashboardApi = {
  getOverview: () => api.get('/dashboard/overview') as Promise<any>,
  getTopProducts: (limit?: number) =>
    api.get('/dashboard/top-products', { params: { limit } }) as Promise<any[]>,
  getMonthlySales: (year?: number) =>
    api.get('/dashboard/monthly-sales', { params: { year } }) as Promise<any[]>,
  getDebtors: () => api.get('/dashboard/debtors') as Promise<any[]>,
  getProfit: () => api.get('/dashboard/profit') as Promise<any>,
};
