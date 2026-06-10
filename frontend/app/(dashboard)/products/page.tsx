'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { Header } from '@/components/layout/Header';
import { toast } from 'sonner';
import { Plus, Search, Pencil, Trash2, AlertCircle } from 'lucide-react';
import type { Product } from '@/types';

export default function ProductsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '', sku: '', purchasePrice: '', salePrice: '', stock: '0', minStock: '5', unit: 'dona',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search, page }],
    queryFn: () => productsApi.getAll({ search, page, limit: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => productsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setShowForm(false); toast.success('Mahsulot qo\'shildi'); },
    onError: (e: any) => toast.error(e?.message ?? 'Xatolik'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: any) => productsApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setEditing(null); toast.success('Yangilandi'); },
    onError: (e: any) => toast.error(e?.message ?? 'Xatolik'),
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success("O'chirildi"); },
    onError: (e: any) => toast.error(e?.message ?? 'Xatolik'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, sku: form.sku || undefined,
      purchasePrice: Number(form.purchasePrice), salePrice: Number(form.salePrice),
      stock: Number(form.stock), minStock: Number(form.minStock), unit: form.unit,
    };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku ?? '', purchasePrice: String(p.purchasePrice), salePrice: String(p.salePrice), stock: String(p.stock), minStock: String(p.minStock), unit: p.unit });
    setShowForm(true);
  };

  const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n);

  return (
    <div className="flex flex-col h-full">
      <Header title="Mahsulotlar" />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Qidirish..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button onClick={() => { setEditing(null); setForm({ name: '', sku: '', purchasePrice: '', salePrice: '', stock: '0', minStock: '5', unit: 'dona' }); setShowForm(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Yangi mahsulot
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h3 className="font-semibold mb-4">{editing ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'name', label: 'Nomi', required: true },
                { key: 'sku', label: 'SKU' },
                { key: 'purchasePrice', label: 'Kelish narxi', required: true, type: 'number' },
                { key: 'salePrice', label: 'Sotuv narxi', required: true, type: 'number' },
                { key: 'stock', label: 'Miqdor', type: 'number' },
                { key: 'unit', label: 'Birlik' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                  <input type={f.type ?? 'text'} value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="col-span-full flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Bekor</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {editing ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Nomi', 'SKU', 'Kelish', 'Sotuv', 'Qoldiq', 'Birlik', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Yuklanmoqda...</td></tr>
              )}
              {data?.items?.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}
                    {p.stock <= p.minStock && <AlertCircle className="inline w-3 h-3 text-yellow-500 ml-1" />}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{p.sku ?? '—'}</td>
                  <td className="px-4 py-3">{fmt(p.purchasePrice)} so'm</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">{fmt(p.salePrice)} so'm</td>
                  <td className={`px-4 py-3 font-semibold ${p.stock <= p.minStock ? 'text-red-500' : 'text-green-600'}`}>{p.stock}</td>
                  <td className="px-4 py-3 text-gray-400">{p.unit}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm('O\'chirilsinmi?')) deleteMutation.mutate(p.id); }} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.totalPages > 1 && (
            <div className="p-4 flex justify-between items-center border-t">
              <span className="text-sm text-gray-500">Jami: {data.total}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Oldingi</button>
                <span className="px-3 py-1 text-sm">{page}/{data.totalPages}</span>
                <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40">Keyingi</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
