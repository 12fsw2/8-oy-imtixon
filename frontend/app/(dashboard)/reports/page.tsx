'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import api from '@/lib/api/client';
import { Header } from '@/components/layout/Header';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

export default function ReportsPage() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const todayStr = today.toISOString().slice(0, 10);

  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(todayStr);

  const { data: monthlySales } = useQuery({
    queryKey: ['monthly-sales', today.getFullYear()],
    queryFn: () => dashboardApi.getMonthlySales(today.getFullYear()),
  });

  const { data: topProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => dashboardApi.getTopProducts(10),
  });

  const { data: salesData } = useQuery({
    queryKey: ['all-sales-report'],
    queryFn: () => api.get('/sales', { params: { limit: 1000 } }) as Promise<any>,
  });

  const { data: profit } = useQuery({
    queryKey: ['profit'],
    queryFn: dashboardApi.getProfit,
  });

  const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));

  const filtered = useMemo(() => {
    if (!salesData?.items) return [];
    const f = new Date(from);
    const t = new Date(to);
    t.setHours(23, 59, 59, 999);
    return salesData.items.filter((s: any) => {
      const d = new Date(s.createdAt);
      return d >= f && d <= t;
    });
  }, [salesData, from, to]);

  const stats = useMemo(() => {
    const totalRevenue = filtered.reduce((s: number, i: any) => s + Number(i.totalAmount), 0);
    const totalPaid = filtered.reduce((s: number, i: any) => s + Number(i.paidAmount), 0);
    const totalDebt = filtered.reduce((s: number, i: any) => s + Number(i.debtAmount), 0);
    return { totalRevenue, totalPaid, totalDebt, count: filtered.length };
  }, [filtered]);

  const chartData = (monthlySales ?? []).map((m: any) => ({
    name: MONTHS[m.month - 1],
    Tushum: m.revenue,
    Sotuvlar: m.sales,
  }));

  const exportCSV = () => {
    const headers = ['#', 'Sana', 'Mijoz', 'Jami', "To'langan", 'Qarz', 'Holat'];
    const statusLabel: Record<string, string> = { PAID: "To'liq", PARTIAL: 'Qisman', UNPAID: "To'lanmagan" };
    const rows = filtered.map((s: any, i: number) => [
      i + 1,
      new Date(s.createdAt).toLocaleDateString('uz-UZ'),
      s.customer?.fullName ?? 'Naqd',
      s.totalAmount,
      s.paidAmount,
      s.debtAmount,
      statusLabel[s.status] ?? s.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `hisobot_${from}_${to}.csv`;
    a.click();
  };

  const statusColor: Record<string, string> = { PAID: 'text-green-600', PARTIAL: 'text-yellow-600', UNPAID: 'text-red-500' };
  const statusLabel: Record<string, string> = { PAID: "To'liq", PARTIAL: 'Qisman', UNPAID: "To'lanmagan" };

  return (
    <div className="flex flex-col h-full">
      <Header title="Hisobotlar" />
      <div className="flex-1 p-6 space-y-5 overflow-auto">

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Dan</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Gacha</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            {[
              { label: 'Bugun', f: todayStr, t: todayStr },
              { label: 'Bu oy', f: firstOfMonth, t: todayStr },
              { label: 'Bu yil', f: `${today.getFullYear()}-01-01`, t: todayStr },
            ].map((q) => (
              <button key={q.label} onClick={() => { setFrom(q.f); setTo(q.t); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                {q.label}
              </button>
            ))}
          </div>
          <button onClick={exportCSV}
            className="ml-auto flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
            <Download className="w-4 h-4" /> Excel eksport
          </button>
        </div>

        {/* Foyda/Zarar banner */}
        {profit && (() => {
          const isProfit = (profit.grossProfit ?? 0) >= 0;
          return (
            <div className={`rounded-xl border p-5 flex items-center justify-between ${isProfit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${isProfit ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isProfit
                    ? <TrendingUp className="w-7 h-7 text-green-600" />
                    : <TrendingDown className="w-7 h-7 text-red-500" />}
                </div>
                <div>
                  <p className={`text-lg font-bold ${isProfit ? 'text-green-700' : 'text-red-600'}`}>
                    {isProfit ? '✓ Foydadasiz' : '✗ Zarardasiz'}
                  </p>
                  <p className="text-sm text-gray-500">Umumiy savdo natijasi (barcha vaqt)</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Jami tushum</p>
                  <p className="font-bold text-gray-800">{fmt(profit.totalRevenue ?? 0)} so'm</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Jami tannarx</p>
                  <p className="font-bold text-gray-800">{fmt(profit.totalCost ?? 0)} so'm</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Yalpi foyda</p>
                  <p className={`font-bold text-xl ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
                    {isProfit ? '+' : ''}{fmt(profit.grossProfit ?? 0)} so'm
                  </p>
                  <p className={`text-xs font-medium ${isProfit ? 'text-green-500' : 'text-red-400'}`}>
                    {(profit.profitMargin ?? 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Sotuvlar soni', value: stats.count + ' ta', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Jami tushum', value: fmt(stats.totalRevenue) + " so'm", icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
            { label: "To'langan", value: fmt(stats.totalPaid) + " so'm", icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Qarz', value: fmt(stats.totalDebt) + " so'm", icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Monthly chart */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-gray-700 mb-4">{today.getFullYear()} yil oylik tushum</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <Tooltip formatter={(v: number) => fmt(v) + " so'm"} />
                <Bar dataKey="Tushum" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top products */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Top mahsulotlar</h3>
            <div className="space-y-3">
              {(topProducts ?? []).slice(0, 6).map((p: any, i: number) => (
                <div key={p.product.id} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.product.name}</p>
                    <p className="text-xs text-gray-400">{p.totalQuantity} {p.product.unit}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 whitespace-nowrap">{fmt(p.totalRevenue)} so'm</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-sm text-gray-700">Sotuvlar ({filtered.length} ta)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  {['#', 'Sana', 'Mijoz', 'Jami', "To'langan", 'Qarz', 'Holat'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!filtered.length && (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Tanlangan davr uchun sotuvlar mavjud emas</td></tr>
                )}
                {filtered.map((s: any, i: number) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString('uz-UZ')}</td>
                    <td className="px-4 py-3">{s.customer?.fullName ?? <span className="text-gray-400">Naqd</span>}</td>
                    <td className="px-4 py-3 font-semibold">{fmt(Number(s.totalAmount))} so'm</td>
                    <td className="px-4 py-3 text-green-600">{fmt(Number(s.paidAmount))} so'm</td>
                    <td className="px-4 py-3 text-red-500">{Number(s.debtAmount) > 0 ? fmt(Number(s.debtAmount)) + " so'm" : '—'}</td>
                    <td className={`px-4 py-3 font-medium ${statusColor[s.status]}`}>{statusLabel[s.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
