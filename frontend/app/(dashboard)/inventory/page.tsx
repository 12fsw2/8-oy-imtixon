'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import api from '@/lib/api/client';
import { Header } from '@/components/layout/Header';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';

export default function InventoryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: '', type: 'IN', quantity: '1', note: '' });

  const { data: products } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => productsApi.getAll({ limit: 200 }),
  });

  const { data: movements, isLoading } = useQuery({
    queryKey: ['inventory-movements'],
    queryFn: () => api.get('/inventory/movements', { params: { limit: 50 } }) as Promise<any>,
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/inventory/movement', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory-movements'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false); setForm({ productId: '', type: 'IN', quantity: '1', note: '' });
      toast.success('Ombor harakati saqlandi');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Xatolik'),
  });

  const typeStyle = { IN: 'text-green-600 bg-green-50', OUT: 'text-red-500 bg-red-50', ADJUSTMENT: 'text-yellow-600 bg-yellow-50' };
  const typeLabel = { IN: 'Kirim', OUT: 'Chiqim', ADJUSTMENT: 'Tuzatish' };

  return (
    <div className="flex flex-col h-full">
      <Header title="Ombor" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Mahsulot qidirish..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <ArrowDown className="w-4 h-4" /> Kirim / Chiqim
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold mb-4">Ombor harakati</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...form, quantity: Number(form.quantity) }); }}
              className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Mahsulot</label>
                <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Tanlang</option>
                  {products?.items?.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.stock} qoldi)</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tur</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="IN">Kirim</option>
                  <option value="OUT">Chiqim</option>
                  <option value="ADJUSTMENT">Tuzatish</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Miqdor</label>
                <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Izoh</label>
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Ixtiyoriy"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div className="col-span-full flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Bekor</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Saqlash</button>
              </div>
            </form>
          </div>
        )}

        {/* Mahsulot zaxiralari */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-700">Mahsulot zaxiralari</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                {['Mahsulot', 'SKU', 'Birlik', 'Joriy qoldiq', 'Min. qoldiq', 'Holat'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!products?.items?.length && (
                <tr><td colSpan={6} className="text-center py-6 text-gray-400">Mahsulotlar mavjud emas</td></tr>
              )}
              {products?.items
                ?.filter((p: any) =>
                  p.name.toLowerCase().includes(search.toLowerCase()) ||
                  (p.sku ?? '').toLowerCase().includes(search.toLowerCase())
                )
                .map((p: any) => {
                  const low = p.stock <= p.minStock;
                  const out = p.stock === 0;
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-gray-400">{p.sku ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{p.unit ?? 'dona'}</td>
                      <td className={`px-4 py-3 font-bold text-lg ${out ? 'text-red-600' : low ? 'text-yellow-600' : 'text-gray-800'}`}>
                        {p.stock}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{p.minStock}</td>
                      <td className="px-4 py-3">
                        {out
                          ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">Tugagan</span>
                          : low
                          ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-600">Kam qoldi</span>
                          : <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600">Yetarli</span>
                        }
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Harakatlar tarixi */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-700">Kirim / Chiqim tarixi</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                {['Mahsulot', 'Tur', 'Miqdor', 'Oldingi qoldiq', 'Yangi qoldiq', 'Xodim', 'Izoh', 'Sana'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={8} className="text-center py-8 text-gray-400">Yuklanmoqda...</td></tr>}
              {!isLoading && !movements?.items?.length && (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">Harakatlar mavjud emas</td></tr>
              )}
              {movements?.items?.map((m: any) => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{m.product?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeStyle[m.type as keyof typeof typeStyle]}`}>
                      {m.type === 'IN' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                      {typeLabel[m.type as keyof typeof typeLabel]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{m.quantity}</td>
                  <td className="px-4 py-3 text-gray-400">{m.beforeStock}</td>
                  <td className="px-4 py-3 font-semibold">{m.afterStock}</td>
                  <td className="px-4 py-3 text-gray-500">{m.user?.firstName} {m.user?.lastName}</td>
                  <td className="px-4 py-3 text-gray-400">{m.note ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(m.createdAt).toLocaleDateString('uz-UZ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
