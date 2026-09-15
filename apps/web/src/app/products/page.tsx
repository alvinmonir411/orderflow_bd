'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { formatBDTEn } from '@/lib/utils';
import {
  Boxes,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  X,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newVariants, setNewVariants] = useState('Size: M (38), Size: L (40), Size: XL (42)');

  const loadProducts = async () => {
    try {
      const list = await api.getProducts();
      setProducts(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleStockAdjust = async (productId: string, delta: number) => {
    await api.updateProductStock(productId, delta);
    toast.success('স্টক আপডেট হয়েছে!');
    loadProducts();
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newStock) {
      toast.error('দয়া করে সকল প্রয়োজনীয় তথ্য পূরণ করুন');
      return;
    }

    const variantsList = newVariants
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((name, idx) => ({
        id: `var-${Date.now()}-${idx}`,
        productId: '',
        name,
        stock: Math.floor(parseInt(newStock, 10) / 3) || 1,
        priceDiff: 0,
      }));

    await api.addProduct({
      title: newTitle,
      basePrice: parseFloat(newPrice),
      stock: parseInt(newStock, 10),
      images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=60'],
      isActive: true,
      variants: variantsList,
    });

    toast.success('নতুন প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!');
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewPrice('');
    setNewStock('');
    loadProducts();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0e1017] to-[#090b10] p-6 sm:p-7 border border-neutral-800/90 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full mb-2">
              <Boxes className="w-3.5 h-3.5 text-emerald-400" />
              <span>ইনভেন্টরি ও সাইজ ভ্যারিয়েন্ট</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
              প্রোডাক্ট ও স্টক ম্যানেজমেন্ট
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
              মেসেঞ্জার ও এআই বটের সাথে সরাসরি যুক্ত প্রোডাক্ট ক্যাটালগ ও লাইভ স্টক ব্যালেন্স।
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/25 active:scale-95 self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            নতুন প্রোডাক্ট যোগ করুন
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((prod) => {
          const isLowStock = prod.stock <= 5;

          return (
            <div
              key={prod.id}
              className={`bg-[#10131c] border rounded-3xl p-6 space-y-5 shadow-xl flex flex-col justify-between transition-all hover:border-neutral-700/80 group relative overflow-hidden ${
                isLowStock ? 'border-amber-500/35 bg-gradient-to-b from-[#181310] to-[#10131c]' : 'border-neutral-800/90'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-neutral-100 text-lg leading-snug group-hover:text-emerald-300 transition-colors">
                      {prod.title}
                    </h3>
                    <p className="font-mono font-black text-emerald-400 text-xl mt-1.5">
                      {formatBDTEn(prod.basePrice)}
                    </p>
                  </div>
                  {isLowStock && (
                    <span className="px-2.5 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-sm">
                      <AlertCircle className="w-3.5 h-3.5" />
                      লো স্টক
                    </span>
                  )}
                </div>

                {/* Variants Preview */}
                {prod.variants && prod.variants.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-neutral-800/80">
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-neutral-500" />
                      উপলব্ধ সাইজ / ভ্যারিয়েন্ট:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {prod.variants.map((v) => (
                        <span
                          key={v.id}
                          className="px-2.5 py-1 bg-[#161a26] border border-neutral-750/80 rounded-xl text-xs text-neutral-300 font-semibold"
                        >
                          {v.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fast Stock Control Footer */}
              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider">বর্তমান স্টক</p>
                  <p
                    className={`text-2xl font-black font-mono mt-0.5 ${
                      prod.stock === 0
                        ? 'text-rose-400'
                        : isLowStock
                        ? 'text-amber-400'
                        : 'text-neutral-100'
                    }`}
                  >
                    {prod.stock} <span className="text-xs font-sans text-neutral-400 font-normal">টি</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-[#090b10] p-1.5 rounded-2xl border border-neutral-750">
                  <button
                    onClick={() => handleStockAdjust(prod.id, -1)}
                    disabled={prod.stock <= 0}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-200 rounded-xl transition-all shadow-sm active:scale-95"
                    title="১ টি কমান"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-sm text-neutral-200">
                    {prod.stock}
                  </span>
                  <button
                    onClick={() => handleStockAdjust(prod.id, 1)}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                    title="১ টি বাড়ান"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#10131c] border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-[#0d0f17]">
              <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                নতুন প্রোডাক্ট যোগ করুন
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-100 rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  প্রোডাক্টের নাম *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: প্রিমিয়াম লিলেন কুর্তি"
                  required
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    মূল্য (টাকা) *
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="850"
                    required
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    স্টক সংখ্যা *
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="25"
                    required
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  সাইজ বা ভ্যারিয়েন্ট (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={newVariants}
                  onChange={(e) => setNewVariants(e.target.value)}
                  placeholder="Size: M (38), Size: L (40), Size: XL (42)"
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-2xl text-sm font-semibold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  প্রোডাক্ট সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
