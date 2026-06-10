'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { Header } from '@/components/layout/Header';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Package,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
  });
  const { data: monthly } = useQuery({
    queryKey: ['dashboard-monthly'],
    queryFn: () => dashboardApi.getMonthlySales(),
  });
  const { data: debtors } = useQuery({
    queryKey: ['dashboard-debtors'],
    queryFn: dashboardApi.getDebtors,
  });
  const { data: topProducts } = useQuery({
    queryKey: ['dashboard-top-products'],
    queryFn: () => dashboardApi.getTopProducts(5),
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat('uz-UZ').format(Math.round(n));

  const chartData = monthly?.map((m: any) => ({
    name: MONTH_NAMES[m.month - 1],
    revenue: m.revenue,
    paid: m.paid,
  }));

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" />
      <div className="flex-1 p-6 space-y-6">
        {isLoading ? (
          <div className="text-gray-400">Yuklanmoqda...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Bugungi tushum"
                value={`${fmt(overview?.today?.revenue ?? 0)} so'm`}
                sub={`${overview?.today?.sales ?? 0} ta sotuv`}
                icon={TrendingUp}
                color="bg-blue-500"
              />
              <StatCard
                title="Oylik tushum"
                value={`${fmt(overview?.month?.revenue ?? 0)} so'm`}
                sub={`${overview?.month?.sales ?? 0} ta sotuv`}
                icon={TrendingUp}
                color="bg-green-500"
              />
              <StatCard
                title="Faol qarzlar"
                value={`${fmt(overview?.totals?.totalRemainingDebt ?? 0)} so'm`}
                sub={`${overview?.totals?.activeDebts ?? 0} ta mijoz`}
                icon={CreditCard}
                color="bg-red-500"
              />
              <StatCard
                title="Kam qolgan"
                value={`${overview?.totals?.lowStockCount ?? 0} ta`}
                sub="mahsulot"
                icon={AlertTriangle}
                color="bg-yellow-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Oylik sotuvlar</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(v: any) => `${fmt(v)} so'm`} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Jami" />
                    <Bar dataKey="paid" fill="#22c55e" radius={[4, 4, 0, 0]} name="To'langan" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Top qarzdorlar</h2>
                <div className="space-y-3">
                  {debtors?.map((d: any, i: number) => (
                    <div key={d.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{d.fullName}</p>
                          <p className="text-xs text-gray-400">{d.phone}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-red-500">
                        {fmt(d.totalDebt)} so'm
                      </span>
                    </div>
                  ))}
                  {!debtors?.length && (
                    <p className="text-sm text-gray-400">Qarzdor mijozlar yo'q</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Eng ko'p sotiladigan mahsulotlar</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">#</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Mahsulot</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Miqdor</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Tushum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts?.map((p: any, i: number) => (
                      <tr key={p.product?.id} className="border-b border-gray-50">
                        <td className="py-2 text-gray-400">{i + 1}</td>
                        <td className="py-2 font-medium">{p.product?.name}</td>
                        <td className="py-2 text-right">{p.totalQuantity} {p.product?.unit}</td>
                        <td className="py-2 text-right font-semibold">{fmt(p.totalRevenue)} so'm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
