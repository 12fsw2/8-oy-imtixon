'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    companyName: '',
    companyAddress: '',
    phone: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register(form);
      setAuth(res.user, res.accessToken, res.refreshToken);
      toast.success('Kompaniya muvaffaqiyatli ro\'yxatdan o\'tdi!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Ro\'yxatdan o\'tishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'companyName', label: 'Kompaniya nomi', placeholder: 'Savdo Do\'koni' },
    { key: 'companyAddress', label: 'Manzil (ixtiyoriy)', placeholder: 'Toshkent, Chilonzor' },
    { key: 'firstName', label: 'Ism', placeholder: 'Ali' },
    { key: 'lastName', label: 'Familiya', placeholder: 'Valiyev' },
    { key: 'phone', label: 'Telefon', placeholder: '+998901234567' },
    { key: 'password', label: 'Parol', placeholder: '••••••', type: 'password' },
  ] as const;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ro'yxatdan o'tish</h1>
        <p className="text-gray-500 mb-6 text-sm">Kompaniyangizni tizimga kiriting</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={f.key !== 'companyAddress'}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Yaratilmoqda...' : 'Kompaniya yaratish'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Hisobingiz bormi?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
