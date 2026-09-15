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
    const list = await api.getProducts();
    setProducts(list);
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-100 tracking-tight">প্রোডাক্ট ও স্টক ম্যানেজমেন্ট</h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            স্টক সংখ্যা পরিবর্তন করুন এবং মেসেঞ্জার বটের জন্য নতুন প্রোডাক্ট যুক্ত করুন
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          নতুন প্রোডাক্ট যুক্ত করুন
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((prod) => {
          const isLowStock = prod.stock <= 5;

          return (
            <div
              key={prod.id}
              className={`bg-neutral-900 border rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between transition-all hover:border-neutral-700 ${
                isLowStock ? 'border-amber-500/30' : 'border-neutral-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-neutral-100 text-base leading-snug">
                      {prod.title}
                    </h3>
                    <p className="font-mono font-bold text-emerald-400 text-lg mt-1">
                      {formatBDTEn(prod.basePrice)}
                    </p>
                  </div>
                  {isLowStock && (
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0">
                      <AlertCircle className="w-3 h-3" />
                      লো স্টক
                    </span>
                  )}
                </div>

                {/* Variants Preview */}
                {prod.variants && prod.variants.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-neutral-500" />
                      ভ্যারিয়েন্ট / সাইজ:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {prod.variants.map((v) => (
                        <span
                          key={v.id}
                          className="px-2 py-0.5 bg-neutral-800 border border-neutral-700/60 rounded text-xs text-neutral-300 font-medium"
                        >
                          {v.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fast Stock Control Footer */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-neutral-500 uppercase font-semibold">বর্তমান স্টক</p>
                  <p
                    className={`text-xl font-bold font-mono ${
                      prod.stock === 0
                        ? 'text-rose-500'
                        : isLowStock
                        ? 'text-amber-400'
                        : 'text-neutral-100'
                    }`}
                  >
                    {prod.stock} টি
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-neutral-800/80 p-1 rounded-xl border border-neutral-700/50">
                  <button
                    onClick={() => handleStockAdjust(prod.id, -1)}
                    disabled={prod.stock <= 0}
                    className="p-1.5 bg-neutral-700/60 hover:bg-neutral-600 disabled:opacity-30 text-neutral-200 rounded-lg transition-all"
                    title="১ টি কমান"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-sm text-neutral-300">
                    {prod.stock}
                  </span>
                  <button
                    onClick={() => handleStockAdjust(prod.id, 1)}
                    className="p-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <h3 className="font-bold text-neutral-100 text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                নতুন প্রোডাক্ট যোগ করুন
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  প্রোডাক্টের নাম *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: প্রিমিয়াম লিলেন কুর্তি"
                  required
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    মূল্য (টাকা) *
                  </label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="850"
                    required
                    className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    স্টক সংখ্যা *
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="25"
                    required
                    className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  সাইজ বা ভ্যারিয়েন্ট (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={newVariants}
                  onChange={(e) => setNewVariants(e.target.value)}
                  placeholder="Size: M (38), Size: L (40), Size: XL (42)"
                  className="w-full bg-neutral-800/80 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-sm font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md"
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
