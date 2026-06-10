import api from './client';

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  companyName: string;
  companyAddress?: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
}

export const authApi = {
  login: (data: LoginPayload) => api.post('/auth/login', data) as Promise<any>,
  register: (data: RegisterPayload) => api.post('/auth/register', data) as Promise<any>,
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile') as Promise<any>,
  refresh: () => api.post('/auth/refresh'),
};
