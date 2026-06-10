'use client';

import { Fragment, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debtsApi } from '@/lib/api/debts';
import { Header } from '@/components/layout/Header';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

export default function DebtsPage() {
  const qc = useQueryClient();
  const [page] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['debts', page, filter],
    queryFn: () => debtsApi.getAll({
      page,
      limit: 100,
      ...(filter === 'unpaid' && { isPaid: false }),
      ...(filter === 'paid' && { isPaid: true }),
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ['debt-stats'],
    queryFn: debtsApi.getStats,
  });

  const payMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      debtsApi.pay(id, { amount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts'] });
      qc.invalidateQueries({ queryKey: ['debt-stats'] });
      setPayingId(null); setPayAmount('');
      toast.success('To\'lov qabul qilindi!');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Xatolik'),
  });

  const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));

  return (
    <div className="flex flex-col h-full">
      <Header title="Qarzlar" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Barchasi' },
            { key: 'unpaid', label: 'Qarzdorlar' },
            { key: 'paid', label: "To'langan" },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${filter === f.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Jami qarz', value: fmt(stats?.totalRemaining ?? 0) + ' so\'m', color: 'text-red-500' },
            { label: 'Qarzdor mijozlar', value: stats?.unpaidDebts ?? 0, color: 'text-gray-800' },
            { label: 'To\'liq to\'langan', value: stats?.paidDebts ?? 0, color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Mijoz', 'Telefon', 'Jami qarz', 'To\'langan', 'Qoldi', 'Holat', 'Sana', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="text-center py-8 text-gray-400">Yuklanmoqda...</td></tr>}
              {data?.items?.map((d) => (
                <Fragment key={d.id}>
                  <tr className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{d.customer?.fullName}</td>
                    <td className="px-4 py-3 text-gray-400">{d.customer?.phone ?? '—'}</td>
                    <td className="px-4 py-3">{fmt(d.totalAmount)} so'm</td>
                    <td className="px-4 py-3 text-green-600">{fmt(d.paidAmount)} so'm</td>
                    <td className="px-4 py-3 font-bold text-red-500">{fmt(d.remaining)} so'm</td>
                    <td className="px-4 py-3">
                      {d.isPaid
                        ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600">To'langan</span>
                        : <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-500">Qarzdor</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(d.createdAt).toLocaleDateString('uz-UZ')}</td>
                    <td className="px-4 py-3">
                      {!d.isPaid && (
                        <button onClick={() => { setPayingId(d.id); setPayAmount(String(d.remaining)); }}
                          className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">
                          <CreditCard className="w-3 h-3" /> To'lash
                        </button>
                      )}
                    </td>
                  </tr>
                  {payingId === d.id && (
                    <tr key={`pay-${d.id}`} className="bg-green-50">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">To'lov summasi:</span>
                          <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} max={d.remaining}
                            className="border border-gray-200 rounded-lg px-3 py-1 text-sm w-40" />
                          <span className="text-sm text-gray-400">so'm</span>
                          <button onClick={() => payMutation.mutate({ id: d.id, amount: Number(payAmount) })}
                            disabled={payMutation.isPending} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                            Tasdiqlash
                          </button>
                          <button onClick={() => setPayingId(null)} className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50">
                            Bekor
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
