'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/customers';
import { Header } from '@/components/layout/Header';
import { toast } from 'sonner';
import { Plus, Search, Phone, MapPin } from 'lucide-react';

export default function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', address: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { search, page }],
    queryFn: () => customersApi.getAll({ search, page, limit: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setShowForm(false); setForm({ fullName: '', phone: '', address: '' }); toast.success('Mijoz qo\'shildi'); },
    onError: (e: any) => toast.error(e?.message ?? 'Xatolik'),
  });

  const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n);

  return (
    <div className="flex flex-col h-full">
      <Header title="Mijozlar" />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Qidirish..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Yangi mijoz
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h3 className="font-semibold mb-4">Yangi mijoz</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="grid grid-cols-3 gap-3">
              {[
                { key: 'fullName', label: 'To\'liq ismi', required: true },
                { key: 'phone', label: 'Telefon' },
                { key: 'address', label: 'Manzil' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="col-span-full flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Bekor</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Qo'shish</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading && <p className="text-gray-400 col-span-full">Yuklanmoqda...</p>}
          {data?.items?.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{c.fullName}</h3>
                  {c.phone && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{c.phone}</p>}
                  {c.address && <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{c.address}</p>}
                </div>
                {c.totalDebt > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Qarz</p>
                    <p className="text-sm font-bold text-red-500">{fmt(c.totalDebt)} so'm</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
