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
  UploadCloud,
  Image as ImageIcon,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newVariants, setNewVariants] = useState('Size: M (38), Size: L (40), Size: XL (42)');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const list = await api.getProducts();
      setProducts(list);
    } catch (e) {
      console.error(e);
      toast.error('প্রোডাক্ট লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('ক্লাউডিনারি (dgaiqqh7k) এ ইমেজ আপলোড হচ্ছে...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        toast.success('ইমেজ সফলভাবে আপলোড হয়েছে!', { id: toastId });
      } else {
        toast.error('ইমেজ আপলোড ব্যর্থ হয়েছে', { id: toastId });
      }
    } catch (err) {
      console.error('Upload Error:', err);
      toast.error('আপলোডে সমস্যা হয়েছে', { id: toastId });
    } finally {
      setIsUploading(false);
    }
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

    const finalImage =
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80';

    await api.addProduct({
      title: newTitle,
      basePrice: parseFloat(newPrice),
      stock: parseInt(newStock, 10),
      images: [finalImage],
      isActive: true,
      variants: variantsList,
    });

    toast.success('নতুন প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!');
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewPrice('');
    setNewStock('');
    setImageUrl('');
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
              <span>ইনভেন্টরি ও ক্লাউডিনারি সিঙ্ক ({products.length}টি প্রোডাক্ট)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
              প্রোডাক্ট ও স্টক ম্যানেজমেন্ট
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
              Cloudinary (dgaiqqh7k) ইমেজ সিডিএন এবং ফেসবুক এআই বটের সাথে লাইভ যুক্ত প্রোডাক্ট ক্যাটালগ।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadProducts}
              disabled={isLoading}
              className="p-3 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 rounded-2xl border border-neutral-750 transition-all active:scale-95"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/25 active:scale-95 self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              নতুন প্রোডাক্ট যোগ করুন
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((prod) => {
          const isLowStock = prod.stock <= 5;
          const displayImage =
            prod.images && prod.images.length > 0 && prod.images[0] && prod.images[0].startsWith('http')
              ? prod.images[0]
              : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80';

          return (
            <div
              key={prod.id}
              className={`bg-[#10131c] border rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between transition-all hover:border-neutral-700/80 group relative overflow-hidden ${
                isLowStock ? 'border-amber-500/35 bg-gradient-to-b from-[#181310] to-[#10131c]' : 'border-neutral-800/90'
              }`}
            >
              {/* Product Image Preview */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/80 group-hover:border-emerald-500/30 transition-colors">
                <img
                  src={displayImage}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2.5 right-2.5">
                  {isLowStock ? (
                    <span className="px-2.5 py-1 bg-amber-500/90 backdrop-blur-md text-amber-950 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-lg">
                      <AlertCircle className="w-3 h-3" />
                      লো স্টক
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-500/80 backdrop-blur-md text-white rounded-xl text-[10px] font-black shadow-lg">
                      ইন স্টক ({prod.stock})
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-neutral-100 text-base leading-snug group-hover:text-emerald-300 transition-colors line-clamp-2 min-h-[44px]">
                  {prod.title}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="font-mono font-black text-emerald-400 text-lg">
                    {formatBDTEn(prod.basePrice)}
                  </p>
                  <span className="text-[11px] text-neutral-400 font-medium">
                    স্টক: <strong className="text-neutral-200">{prod.stock}টি</strong>
                  </span>
                </div>

                {/* Variants Preview */}
                {prod.variants && prod.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {prod.variants.slice(0, 3).map((v) => (
                      <span
                        key={v.id}
                        className="px-2 py-0.5 bg-[#161a26] border border-neutral-800 rounded-lg text-[10px] text-neutral-300 font-semibold"
                      >
                        {v.name}
                      </span>
                    ))}
                    {prod.variants.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-neutral-400 font-bold">
                        +{prod.variants.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Fast Stock Control Footer */}
              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 bg-[#0a0c12] border border-neutral-800 rounded-2xl p-1 w-full justify-between">
                  <span className="text-[11px] text-neutral-400 font-bold px-2">স্টক সমন্বয়:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStockAdjust(prod.id, -1)}
                      disabled={prod.stock <= 0}
                      className="p-1.5 bg-neutral-850 hover:bg-neutral-750 disabled:opacity-30 text-neutral-300 rounded-xl transition-colors active:scale-95"
                      title="১টি কমান"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleStockAdjust(prod.id, 1)}
                      className="p-1.5 bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-xl transition-colors active:scale-95"
                      title="১টি বাড়ান"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal with Cloudinary Upload */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#10131c] border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-[#0d0f17]">
              <div>
                <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-400" />
                  নতুন প্রোডাক্ট যোগ করুন
                </h3>
                <span className="text-[11px] text-neutral-400">Cloudinary (dgaiqqh7k) সিঙ্ক সক্রিয়</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-100 rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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

              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>প্রোডাক্ট ইমেজ (Cloudinary)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Env: dgaiqqh7k</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0a0c12] border border-dashed border-neutral-700 hover:border-emerald-500/60 rounded-2xl cursor-pointer transition-colors text-xs text-neutral-300 font-semibold">
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      <span>{isUploading ? 'আপলোড হচ্ছে...' : 'ছবি নির্বাচন বা ড্রপ করুন'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="অথবা ইমেজের সরাসরি URL দিন (https://...)"
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500 shadow-inner font-mono"
                  />

                  {imageUrl && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-emerald-500/40">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
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
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
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
