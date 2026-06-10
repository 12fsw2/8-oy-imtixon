'use client';

import { useAuthStore } from '@/lib/stores/auth.store';
import { Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell className="w-5 h-5" />
        </button>
        <div className="text-sm text-gray-600">
          {user?.firstName} {user?.lastName}
        </div>
      </div>
    </header>
  );
}
