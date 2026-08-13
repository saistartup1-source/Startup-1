import React, { useState } from 'react';
import { QuickProduct } from '../types';
import { formatCurrency } from '../utils/calculator';
import { Tag, Plus, Trash2, Edit3, Check, Sparkles } from 'lucide-react';

interface Props {
  products: QuickProduct[];
  onAddProduct: (product: QuickProduct) => void;
  onDeleteProduct: (id: string) => void;
}

export const QuickCatalogManager: React.FC<Props> = ({
  products,
  onAddProduct,
  onDeleteProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Shirts');
  const [size, setSize] = useState('L');
  const [mrp, setMrp] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [hsnCode, setHsnCode] = useState('6205');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mrp || !sellingPrice) {
      alert('Please fill product name, MRP and Selling Price');
      return;
    }

    const newP: QuickProduct = {
      id: 'p-' + Date.now(),
      name: name.trim(),
      category,
      size,
      mrp: Number(mrp),
      sellingPrice: Number(sellingPrice),
      hsnCode,
    };

    onAddProduct(newP);
    setName('');
    setMrp('');
    setSellingPrice('');
  };

  return (
    <div className="space-y-6">
      {/* Add New Quick Product Form */}
      <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3 mb-4">
          <Tag className="w-5 h-5 text-amber-600" />
          <span>Add Quick Clothing Preset Item</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clothing Item Name
            </label>
            <input
              type="text"
              placeholder="e.g. Cotton Shirt / Designer Saree"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
            >
              <option value="Shirts">Shirts</option>
              <option value="Jeans">Jeans</option>
              <option value="Sarees">Sarees</option>
              <option value="Ladies Wear">Ladies Wear</option>
              <option value="Kids Wear">Kids Wear</option>
              <option value="T-Shirts">T-Shirts</option>
              <option value="Ethnic Wear">Ethnic Wear</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Size
            </label>
            <input
              type="text"
              placeholder="L"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              MRP (₹)
            </label>
            <input
              type="number"
              placeholder="1500"
              value={mrp}
              onChange={(e) => setMrp(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold font-mono text-slate-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selling Rate (₹)
            </label>
            <input
              type="number"
              placeholder="899"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold font-mono text-emerald-800"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save Preset</span>
            </button>
          </div>
        </div>
      </form>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => {
          const discountAmt = p.mrp - p.sellingPrice;
          const discountPct = Math.round((discountAmt / p.mrp) * 100);

          return (
            <div
              key={p.id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-amber-400 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                    {p.category}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {discountPct}% OFF
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mt-2">{p.name}</h4>
                <p className="text-xs text-slate-500 font-medium">Size: {p.size}</p>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 line-through font-mono">
                    {formatCurrency(p.mrp)}
                  </span>
                  <span className="text-base font-extrabold text-amber-900 font-mono">
                    {formatCurrency(p.sellingPrice)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">HSN: {p.hsnCode}</span>
                <button
                  type="button"
                  onClick={() => onDeleteProduct(p.id)}
                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                  title="Delete Preset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
