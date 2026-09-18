'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  SlidersHorizontal,
  Edit3,
  Trash2,
  Tag,
  ArrowUpDown,
  Filter,
  Check,
  Package,
  DollarSign,
  AlertTriangle,
  LayoutGrid,
  List,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'STOCK_DESC' | 'STOCK_ASC'>('NEWEST');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form State (for both Add and Edit)
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('কুর্তি');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formVariants, setFormVariants] = useState('Size: M (38), Size: L (40), Size: XL (42)');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const defaultCategories = ['কুর্তি', 'থ্রি-পিস', 'গাউন', 'শাড়ি', 'বোরকা ও হিজাব', 'অন্যান্য'];

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const list = await api.getProducts();
      setProducts(list);
    } catch (e) {
      console.error(e);
      toast.error('প্রোডাক্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Compute unique categories from current products
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    defaultCategories.forEach((c) => cats.add(c));
    products.forEach((p) => {
      if (p.category && p.category.trim()) cats.add(p.category.trim());
    });
    return Array.from(cats);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Search Filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = prod.title.toLowerCase().includes(query);
          const matchCategory = (prod.category || '').toLowerCase().includes(query);
          const matchDesc = (prod.description || '').toLowerCase().includes(query);
          const matchVariants = (prod.variants || []).some((v) => v.name.toLowerCase().includes(query));
          if (!matchTitle && !matchCategory && !matchDesc && !matchVariants) return false;
        }

        // Category Filter
        if (selectedCategory !== 'ALL') {
          if ((prod.category || 'সাধারণ') !== selectedCategory) return false;
        }

        // Stock Status Filter
        if (stockFilter === 'IN_STOCK' && prod.stock <= 5) return false;
        if (stockFilter === 'LOW_STOCK' && (prod.stock > 5 || prod.stock === 0)) return false;
        if (stockFilter === 'OUT_OF_STOCK' && prod.stock > 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') return Number(a.basePrice) - Number(b.basePrice);
        if (sortBy === 'PRICE_DESC') return Number(b.basePrice) - Number(a.basePrice);
        if (sortBy === 'STOCK_ASC') return Number(a.stock) - Number(b.stock);
        if (sortBy === 'STOCK_DESC') return Number(b.stock) - Number(a.stock);
        // Default: NEWEST
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy]);

  // Inventory Statistics
  const totalStockCount = useMemo(() => products.reduce((sum, p) => sum + (p.stock || 0), 0), [products]);
  const lowStockCount = useMemo(() => products.filter((p) => p.stock > 0 && p.stock <= 5).length, [products]);
  const outOfStockCount = useMemo(() => products.filter((p) => p.stock === 0).length, [products]);
  const totalValuation = useMemo(
    () => products.reduce((sum, p) => sum + (p.stock || 0) * Number(p.basePrice || 0), 0),
    [products],
  );

  // Cloudinary Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Cloudinary এ ইমেজ আপলোড হচ্ছে...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setFormImageUrl(data.url);
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

  const handleStockAdjust = async (productId: string, delta: number) => {
    await api.updateProductStock(productId, delta);
    toast.success('স্টক আপডেট হয়েছে!');
    loadProducts();
  };

  const openAddModal = () => {
    setFormTitle('');
    setFormCategory('কুর্তি');
    setFormCustomCategory('');
    setFormPrice('');
    setFormStock('20');
    setFormVariants('Size: M (38), Size: L (40), Size: XL (42)');
    setFormDescription('');
    setFormImageUrl('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormTitle(prod.title);
    if (defaultCategories.includes(prod.category || '')) {
      setFormCategory(prod.category || 'কুর্তি');
      setFormCustomCategory('');
    } else {
      setFormCategory('CUSTOM');
      setFormCustomCategory(prod.category || '');
    }
    setFormPrice(String(prod.basePrice));
    setFormStock(String(prod.stock));
    setFormDescription(prod.description || '');
    setFormVariants(
      prod.variants && prod.variants.length > 0
        ? prod.variants.map((v) => v.name).join(', ')
        : 'Free Size',
    );
    setFormImageUrl(prod.images?.[0] || '');
  };

  const handleSaveAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice || !formStock) {
      toast.error('দয়া করে সকল প্রয়োজনীয় তথ্য পূরণ করুন');
      return;
    }

    const finalCategory = formCategory === 'CUSTOM' ? formCustomCategory.trim() || 'সাধারণ' : formCategory;

    const variantsList = formVariants
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((name, idx) => ({
        id: `var-${Date.now()}-${idx}`,
        productId: '',
        name,
        stock: Math.floor(parseInt(formStock, 10) / 3) || 1,
        priceDiff: 0,
      }));

    const finalImage =
      formImageUrl.trim() ||
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80';

    await api.addProduct({
      title: formTitle,
      category: finalCategory,
      description: formDescription,
      basePrice: parseFloat(formPrice),
      stock: parseInt(formStock, 10),
      images: [finalImage],
      isActive: true,
      variants: variantsList,
    });

    toast.success('নতুন প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!');
    setIsAddModalOpen(false);
    loadProducts();
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const finalCategory = formCategory === 'CUSTOM' ? formCustomCategory.trim() || 'সাধারণ' : formCategory;

    const variantsList = formVariants
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((name, idx) => ({
        id: `var-${Date.now()}-${idx}`,
        productId: editingProduct.id,
        name,
        stock: Math.floor(parseInt(formStock, 10) / 3) || 1,
        priceDiff: 0,
      }));

    const finalImage = formImageUrl.trim() || editingProduct.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80';

    await api.updateProduct({
      id: editingProduct.id,
      title: formTitle,
      category: finalCategory,
      description: formDescription,
      basePrice: parseFloat(formPrice),
      stock: parseInt(formStock, 10),
      images: [finalImage],
      variants: variantsList,
    });

    toast.success('প্রোডাক্ট সফলভাবে আপডেট হয়েছে!');
    setEditingProduct(null);
    loadProducts();
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await api.deleteProduct(deletingProduct.id);
      toast.success(`'${deletingProduct.title}' প্রোডাক্টটি মুছে ফেলা হয়েছে`);
      setDeletingProduct(null);
      loadProducts();
    } catch (err) {
      toast.error('প্রোডাক্ট মুছতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Metrics Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0e1017] to-[#090b10] p-6 sm:p-7 border border-neutral-800/90 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full mb-2">
              <Boxes className="w-3.5 h-3.5 text-emerald-400" />
              <span>প্রোডাক্ট ও ক্যাটাগরি ম্যানেজমেন্ট</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
              প্রোডাক্ট ও ইনভেন্টরি কন্ট্রোল
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
              Cloudinary ইমেজ সিডিএন এবং ফেসবুক এআই বটের সাথে লাইভ যুক্ত সম্পূর্ণ ক্যাটালগ।
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0a0c12]/80 backdrop-blur-md p-3 rounded-2xl border border-neutral-800">
            <div className="px-3 py-1.5 border-r border-neutral-800/80">
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">মোট প্রোডাক্ট</p>
              <p className="text-lg font-black font-mono text-neutral-100">{products.length}</p>
            </div>
            <div className="px-3 py-1.5 border-r border-neutral-800/80">
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">মোট স্টক</p>
              <p className="text-lg font-black font-mono text-emerald-400">{totalStockCount} <span className="text-[10px] font-normal text-neutral-400">টি</span></p>
            </div>
            <div className="px-3 py-1.5 border-r border-neutral-800/80">
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">লো স্টক</p>
              <p className={`text-lg font-black font-mono ${lowStockCount > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>{lowStockCount}</p>
            </div>
            <div className="px-3 py-1.5">
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">স্টক ভ্যালু</p>
              <p className="text-lg font-black font-mono text-cyan-400">{formatBDTEn(totalValuation)}</p>
            </div>
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
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/25 active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              নতুন প্রোডাক্ট যোগ করুন
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-[#10131c] text-neutral-300 border border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <span>সব ক্যাটাগরি</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/30 font-mono">
              {products.length}
            </span>
          </button>

          {allCategories.map((cat) => {
            const count = products.filter((p) => (p.category || 'সাধারণ') === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-[#10131c] text-neutral-300 border border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <Tag className="w-3 h-3 opacity-70" />
                <span>{cat}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#10131c] border border-neutral-800 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="প্রোডাক্ট নাম, সাইজ বা ক্যাটাগরি খুঁজুন..."
              className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl pl-10 pr-9 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Stock Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#0a0c12] border border-neutral-750 px-3 py-1.5 rounded-2xl">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={stockFilter}
                onChange={(e: any) => setStockFilter(e.target.value)}
                className="bg-transparent text-xs text-neutral-200 focus:outline-none cursor-pointer font-medium"
              >
                <option value="ALL" className="bg-[#10131c]">সকল স্টক স্ট্যাটাস</option>
                <option value="IN_STOCK" className="bg-[#10131c]">ইন স্টক (&gt; 5)</option>
                <option value="LOW_STOCK" className="bg-[#10131c]">লো স্টক (১-৫)</option>
                <option value="OUT_OF_STOCK" className="bg-[#10131c]">স্টক আউট (০)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#0a0c12] border border-neutral-750 px-3 py-1.5 rounded-2xl">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-neutral-200 focus:outline-none cursor-pointer font-medium"
              >
                <option value="NEWEST" className="bg-[#10131c]">নতুন প্রথমে</option>
                <option value="PRICE_ASC" className="bg-[#10131c]">মূল্য: কম থেকে বেশি</option>
                <option value="PRICE_DESC" className="bg-[#10131c]">মূল্য: বেশি থেকে কম</option>
                <option value="STOCK_DESC" className="bg-[#10131c]">স্টক: বেশি থেকে কম</option>
                <option value="STOCK_ASC" className="bg-[#10131c]">স্টক: কম থেকে বেশি</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-[#0a0c12] border border-neutral-750 p-1 rounded-2xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="গ্রিড ভিউ"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="টেবিল ভিউ"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product List Content */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#10131c] border border-neutral-800 rounded-3xl p-12 text-center space-y-3">
          <Boxes className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-neutral-200">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            আপনার ফিল্টার অথবা সার্চ কিউয়ারির সাথে কোনো প্রোডাক্ট মেলেনি। ফিল্টার রিসেট করে দেখুন।
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setStockFilter('ALL');
            }}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> ফিল্টার রিসেট
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => {
            const isLowStock = prod.stock > 0 && prod.stock <= 5;
            const isOutOfStock = prod.stock === 0;
            const displayImage =
              prod.images && prod.images.length > 0 && prod.images[0] && prod.images[0].startsWith('http')
                ? prod.images[0]
                : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80';

            return (
              <div
                key={prod.id}
                className={`bg-[#10131c] border rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between transition-all hover:border-neutral-700/80 group relative overflow-hidden ${
                  isOutOfStock
                    ? 'border-rose-500/35 bg-gradient-to-b from-[#181010] to-[#10131c]'
                    : isLowStock
                    ? 'border-amber-500/35 bg-gradient-to-b from-[#181310] to-[#10131c]'
                    : 'border-neutral-800/90'
                }`}
              >
                {/* Product Image & Category Badge */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/80 group-hover:border-emerald-500/30 transition-colors">
                  <img
                    src={displayImage}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Category Pill */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md border border-neutral-700/80 text-neutral-200 rounded-xl text-[10px] font-bold shadow-lg flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5 text-emerald-400" />
                      {prod.category || 'সাধারণ'}
                    </span>
                  </div>

                  {/* Stock Status Pill */}
                  <div className="absolute top-2.5 right-2.5">
                    {isOutOfStock ? (
                      <span className="px-2.5 py-1 bg-rose-500/90 backdrop-blur-md text-white rounded-xl text-[10px] font-black flex items-center gap-1 shadow-lg">
                        <AlertCircle className="w-3 h-3" />
                        স্টক আউট
                      </span>
                    ) : isLowStock ? (
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
                      স্টক: <strong className={isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-neutral-200'}>{prod.stock}টি</strong>
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

                {/* Stock Control & Actions Footer */}
                <div className="pt-3 border-t border-neutral-800/80 space-y-2">
                  <div className="flex items-center gap-1.5 bg-[#0a0c12] border border-neutral-800 rounded-2xl p-1 w-full justify-between">
                    <span className="text-[11px] text-neutral-400 font-bold px-2">স্টক:</span>
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

                  {/* Edit and Delete Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-750 transition-colors active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      এডিট
                    </button>
                    <button
                      onClick={() => setDeletingProduct(prod)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition-colors active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      মুছুন
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#10131c] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0c12] text-neutral-400 uppercase font-bold border-b border-neutral-800">
                <tr>
                  <th className="p-4">প্রোডাক্ট</th>
                  <th className="p-4">ক্যাটাগরি</th>
                  <th className="p-4">মূল্য</th>
                  <th className="p-4">স্টক সংখ্যা</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredProducts.map((prod) => {
                  const isLowStock = prod.stock > 0 && prod.stock <= 5;
                  const isOutOfStock = prod.stock === 0;
                  const displayImage =
                    prod.images && prod.images.length > 0 && prod.images[0] && prod.images[0].startsWith('http')
                      ? prod.images[0]
                      : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80';

                  return (
                    <tr key={prod.id} className="hover:bg-neutral-850/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={displayImage}
                            alt={prod.title}
                            className="w-12 h-12 rounded-xl object-cover bg-neutral-900 border border-neutral-800 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-neutral-100">{prod.title}</p>
                            <p className="text-[10px] text-neutral-400 line-clamp-1">{prod.description || 'কোনো বর্ণনা নেই'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-neutral-800 text-neutral-200 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 border border-neutral-700">
                          <Tag className="w-2.5 h-2.5 text-emerald-400" />
                          {prod.category || 'সাধারণ'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-black text-emerald-400 text-sm">
                        {formatBDTEn(prod.basePrice)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-neutral-100'}`}>
                            {prod.stock}টি
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStockAdjust(prod.id, -1)}
                              disabled={prod.stock <= 0}
                              className="p-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 rounded-lg text-neutral-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleStockAdjust(prod.id, 1)}
                              className="p-1 bg-emerald-600/30 hover:bg-emerald-600/50 rounded-lg text-emerald-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-bold">
                            স্টক আউট
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold">
                            লো স্টক
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold">
                            ইন স্টক
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-blue-400 rounded-xl transition-colors"
                            title="এডিট"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(prod)}
                            className="p-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 rounded-xl transition-colors"
                            title="মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#10131c] border border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-[#0d0f17]">
              <div>
                <h3 className="font-extrabold text-neutral-100 text-base sm:text-lg flex items-center gap-2">
                  {editingProduct ? (
                    <>
                      <Edit3 className="w-5 h-5 text-blue-400" />
                      প্রোডাক্ট এডিট করুন
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 text-emerald-400" />
                      নতুন প্রোডাক্ট যোগ করুন
                    </>
                  )}
                </h3>
                <span className="text-[11px] text-neutral-400">Cloudinary সিঙ্ক সক্রিয়</span>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-2 text-neutral-400 hover:text-neutral-100 rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingProduct ? handleSaveEditProduct : handleSaveAddProduct}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  প্রোডাক্টের নাম *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="যেমন: প্রিমিয়াম লিলেন কাশ্মীরি কুর্তি"
                  required
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  ক্যাটাগরি *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner cursor-pointer"
                  >
                    {defaultCategories.map((c) => (
                      <option key={c} value={c} className="bg-[#10131c]">
                        {c}
                      </option>
                    ))}
                    <option value="CUSTOM" className="bg-[#10131c]">
                      + নতুন ক্যাটাগরি লিখুন
                    </option>
                  </select>

                  {formCategory === 'CUSTOM' && (
                    <input
                      type="text"
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      placeholder="নতুন ক্যাটাগরির নাম"
                      required
                      className="w-full bg-[#0a0c12] border border-emerald-500/50 rounded-2xl px-4 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner"
                    />
                  )}
                </div>
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
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="অথবা ইমেজের সরাসরি URL দিন (https://...)"
                    className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500 shadow-inner font-mono"
                  />

                  {formImageUrl && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-emerald-500/40">
                      <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
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
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
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
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
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
                  value={formVariants}
                  onChange={(e) => setFormVariants(e.target.value)}
                  placeholder="Size: M (38), Size: L (40), Size: XL (42)"
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  প্রোডাক্টের বিবরণ (Description)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="যেমন: ১০০% পিওর সুতি, আরামদায়ক ও গ্যারান্টিযুক্ত কালার..."
                  className="w-full bg-[#0a0c12] border border-neutral-750 rounded-2xl px-4 py-2 text-xs text-neutral-100 focus:outline-none focus:border-emerald-500 shadow-inner resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-2xl text-sm font-semibold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {editingProduct ? 'আপডেট সেভ করুন' : 'প্রোডাক্ট সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#10131c] border border-rose-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-neutral-100 text-lg">প্রোডাক্ট মুছে ফেলতে চান?</h3>
              <p className="text-xs text-neutral-400">
                আপনি কি নিশ্চিত যে <strong className="text-neutral-200">'{deletingProduct.title}'</strong> প্রোডাক্টটি চিরতরে মুছে ফেলতে চান? এই অ্যাকশনটি ফিরিয়ে আনা যাবে না।
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-2xl text-xs font-bold transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
