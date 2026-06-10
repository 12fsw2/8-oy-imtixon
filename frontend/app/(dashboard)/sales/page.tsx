'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '@/lib/api/sales';
import { productsApi } from '@/lib/api/products';
import { customersApi } from '@/lib/api/customers';
import { Header } from '@/components/layout/Header';
import { toast } from 'sonner';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function SalesPage() {
  const qc = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [page] = useState(1);
  const [showNewSale, setShowNewSale] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales', page],
    queryFn: () => salesApi.getAll({ page, limit: 20 }),
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.getAll({ limit: 100 }),
  });

  const { data: searchResults } = useQuery({
    queryKey: ['products-search', searchInput],
    queryFn: () => productsApi.getAll({ search: searchInput, limit: 10 }),
    enabled: searchInput.trim().length > 0,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createMutation = useMutation({
    mutationFn: salesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      setCart([]);
      setCustomerId('');
      setPaidAmount('');
      setShowNewSale(false);
      toast.success('Sotuv muvaffaqiyatli amalga oshirildi!');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Xatolik'),
  });

  const totalAmount = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const paid = Number(paidAmount) || totalAmount;
  const debt = Math.max(0, totalAmount - paid);

  const addToCart = (product: any) => {
    const price = Number(product.salePrice);
    const existing = cart.find((c) => c.productId === product.id);
    if (existing) {
      setCart(cart.map((c) => c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { productId: product.id, name: product.name, price, quantity: 1 }]);
    }
    setSearchInput('');
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) { toast.error("Savat bo'sh"); return; }
    createMutation.mutate({
      customerId: customerId || undefined,
      items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
      paidAmount: paidAmount ? Number(paidAmount) : undefined,
    });
  };

  const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(Math.round(n));
  const statusColor: Record<string, string> = { PAID: 'text-green-600', PARTIAL: 'text-yellow-600', UNPAID: 'text-red-500' };
  const statusLabel: Record<string, string> = { PAID: "To'liq", PARTIAL: 'Qisman', UNPAID: "To'lanmagan" };

  return (
    <div className="flex flex-col h-full">
      <Header title="Sotuvlar" />
      <div className="flex-1 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm text-gray-500">Jami: {salesData?.total ?? 0} ta sotuv</h2>
          <button
            onClick={() => setShowNewSale(!showNewSale)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Yangi sotuv
          </button>
        </div>

        {showNewSale && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Yangi sotuv
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Product search */}
                <div ref={dropdownRef} className="relative">
                  <label className="text-xs text-gray-500 mb-1 block">Mahsulot qidirish</label>
                  <input
                    value={searchInput}
                    onChange={(e) => { setSearchInput(e.target.value); setShowDropdown(true); }}
                    onFocus={() => searchInput && setShowDropdown(true)}
                    placeholder="Nom yoki SKU bo'yicha qidiring..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {showDropdown && searchResults?.items && searchResults.items.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">
                      {searchResults.items.map((p: any) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addToCart(p)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm flex justify-between items-center"
                        >
                          <span>{p.name} <span className="text-gray-400 text-xs">({p.sku})</span></span>
                          <span className="text-blue-600 font-medium">{fmt(Number(p.salePrice))} so'm</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {showDropdown && searchInput && searchResults?.items?.length === 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 px-3 py-2 text-sm text-gray-400">
                      Mahsulot topilmadi
                    </div>
                  )}
                </div>

                {/* Customer select */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Mijoz</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Mijoz tanlanmagan (naqd)</option>
                    {customers?.items?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.fullName} {c.phone ? `(${c.phone})` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cart table */}
              {cart.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Mahsulot', 'Narx', 'Miqdor', 'Jami', ''].map((h) => (
                          <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.productId} className="border-t border-gray-100">
                          <td className="px-3 py-2">{item.name}</td>
                          <td className="px-3 py-2">{fmt(item.price)}</td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={item.quantity}
                              min={1}
                              onChange={(e) => setCart(cart.map((c) => c.productId === item.productId ? { ...c, quantity: Number(e.target.value) } : c))}
                              className="w-16 border border-gray-200 rounded px-2 py-1 text-sm"
                            />
                          </td>
                          <td className="px-3 py-2 font-semibold">{fmt(item.price * item.quantity)} so'm</td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => setCart(cart.filter((c) => c.productId !== item.productId))}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Jami summa</p>
                  <p className="font-bold text-lg">{fmt(totalAmount)} so'm</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">To'langan summa</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder={String(totalAmount)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Qarz</p>
                  <p className={`font-bold text-lg ${debt > 0 ? 'text-red-500' : 'text-green-600'}`}>{fmt(debt)} so'm</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewSale(false)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !cart.length}
                  className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saqlanmoqda...' : 'Sotuvni tasdiqlash'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sales list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['#', 'Mijoz', 'Jami summa', "To'langan", 'Qarz', 'Holat', 'Sana'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Yuklanmoqda...</td></tr>
              )}
              {!isLoading && !salesData?.items?.length && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Sotuvlar mavjud emas</td></tr>
              )}
              {salesData?.items?.map((s: any, i: number) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{(page - 1) * 20 + i + 1}</td>
                  <td className="px-4 py-3">{s.customer?.fullName ?? <span className="text-gray-400">Naqd</span>}</td>
                  <td className="px-4 py-3 font-semibold">{fmt(s.totalAmount)} so'm</td>
                  <td className="px-4 py-3 text-green-600">{fmt(s.paidAmount)} so'm</td>
                  <td className="px-4 py-3 text-red-500">{s.debtAmount > 0 ? `${fmt(s.debtAmount)} so'm` : '—'}</td>
                  <td className={`px-4 py-3 font-medium ${statusColor[s.status]}`}>{statusLabel[s.status]}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(s.createdAt).toLocaleDateString('uz-UZ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
