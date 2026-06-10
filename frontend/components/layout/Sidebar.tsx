'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  Warehouse,
  BarChart2,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Mahsulotlar', icon: Package },
  { href: '/customers', label: 'Mijozlar', icon: Users },
  { href: '/sales', label: 'Sotuvlar', icon: ShoppingCart },
  { href: '/debts', label: 'Qarzlar', icon: CreditCard },
  { href: '/inventory', label: 'Ombor', icon: Warehouse },
  { href: '/reports', label: 'Hisobotlar', icon: BarChart2 },
  { href: '/settings', label: 'Sozlamalar', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-400" />
          <div>
            <p className="font-semibold text-sm leading-tight">
              {user?.company?.name ?? 'Retail ERP'}
            </p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-3">
          {user?.firstName} {user?.lastName}
          <br />
          {user?.phone}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </button>
      </div>
    </aside>
  );
}
