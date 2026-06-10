'use client';

import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { Header } from '@/components/layout/Header';

export default function SettingsPage() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Sozlamalar" />
      <div className="flex-1 p-6 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
          <h2 className="font-semibold text-gray-800 mb-4">Kompaniya ma'lumotlari</h2>
          <dl className="space-y-3 text-sm">
            {[
              { label: 'Nomi', value: profile?.company?.name },
              { label: 'Telefon', value: profile?.company?.phone ?? '—' },
              { label: 'Manzil', value: profile?.company?.address ?? '—' },
            ].map((item) => (
              <div key={item.label} className="flex">
                <dt className="w-32 text-gray-500">{item.label}</dt>
                <dd className="font-medium text-gray-800">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
          <h2 className="font-semibold text-gray-800 mb-4">Foydalanuvchi</h2>
          <dl className="space-y-3 text-sm">
            {[
              { label: 'Ismi', value: `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}` },
              { label: 'Telefon', value: profile?.phone },
              { label: 'Rol', value: profile?.role },
            ].map((item) => (
              <div key={item.label} className="flex">
                <dt className="w-32 text-gray-500">{item.label}</dt>
                <dd className="font-medium text-gray-800">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
