'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      setAuth(res.user, res.accessToken, res.refreshToken);
      toast.success('Muvaffaqiyatli kirdingiz!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Login xatoligi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tizimga kirish</h1>
        <p className="text-gray-500 mb-6 text-sm">Retail ERP — Do'kon Boshqaruv Tizimi</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon raqam
            </label>
            <input
              type="text"
              placeholder="+998901234567"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parol
            </label>
            <input
              type="password"
              placeholder="••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Hisobingiz yo'qmi?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </div>
    </div>
  );
}
