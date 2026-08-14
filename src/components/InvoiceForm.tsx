import React, { useState } from 'react';
import {
  Invoice,
  InvoiceItem,
  ShopSettings,
  QuickProduct,
  PaymentMode,
  CustomerInfo,
} from '../types';
import { calculateItemDiscount, formatCurrency } from '../utils/calculator';
import {
  Plus,
  Trash2,
  Printer,
  Share2,
  ShoppingBag,
  User,
  Phone,
  Calendar,
  Clock,
  Tag,
  FileText,
  Banknote,
  Smartphone,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  Receipt,
} from 'lucide-react';

interface Props {
  shop: ShopSettings;
  quickProducts: QuickProduct[];
  onSaveInvoice: (
    invoice: Invoice,
    action: 'save' | 'printA4' | 'printThermal' | 'whatsapp'
  ) => void;
  existingInvoice?: Invoice | null;
}

export const InvoiceForm: React.FC<Props> = ({
  shop,
  quickProducts,
  onSaveInvoice,
  existingInvoice,
}) => {
  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState(
    existingInvoice?.invoiceNumber || `${shop.invoicePrefix}${shop.nextInvoiceNumber}`
  );
  const [date, setDate] = useState(
    existingInvoice?.date || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(
    existingInvoice?.time ||
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const [customer, setCustomer] = useState<CustomerInfo>(
    existingInvoice?.customer || {
      name: '',
      phone: '',
      address: '',
      gstin: '',
    }
  );

  const [items, setItems] = useState<InvoiceItem[]>(existingInvoice?.items || []);

  // Current row input state
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Shirts');
  const [itemSize, setItemSize] = useState('');
  const [itemHsn, setItemHsn] = useState('6205');
  const [itemMRP, setItemMRP] = useState<number | ''>('');
  const [itemSellingPrice, setItemSellingPrice] = useState<number | ''>('');
  const [itemQty, setItemQty] = useState<number>(1);

  // Billing options
  const [additionalDiscount, setAdditionalDiscount] = useState<number>(
    existingInvoice?.additionalDiscount || 0
  );
  const [isGstInvoice, setIsGstInvoice] = useState<boolean>(
    existingInvoice?.isGstInvoice ?? false
  );
  const [gstRate, setGstRate] = useState<number>(
    existingInvoice?.gstRate ?? shop.defaultGstRate
  );
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    existingInvoice?.paymentMode || 'Cash'
  );
  const [notes, setNotes] = useState(existingInvoice?.notes || '');
  const [resetFeedback, setResetFeedback] = useState(false);

  // Calculate live item discount preview
  const liveSP = Number(itemSellingPrice) || 0;
  // If MRP is not provided, default to Selling Price (so 0% item-level discount)
  const liveMRP = itemMRP !== '' && Number(itemMRP) > 0 ? Number(itemMRP) : liveSP;
  const liveQty = itemQty || 1;
  const liveDiscountInfo = calculateItemDiscount(liveMRP, liveSP, liveQty);

  // Helper to add current item row (Name and Size are purely OPTIONAL)
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (liveSP <= 0) {
      alert('Please enter a valid Selling Price / Rate (₹)');
      return;
    }

    // Name is optional: default to garment category or 'Garment Item'
    const finalItemName = itemName.trim() || `${itemCategory || 'Garment'} Item`;
    // Size is optional: default to empty string or '—'
    const finalItemSize = itemSize.trim() || '—';
    // MRP defaults to selling price if not provided
    const finalMRP = liveMRP > 0 ? liveMRP : liveSP;

    const discountInfo = calculateItemDiscount(finalMRP, liveSP, liveQty);

    const newItem: InvoiceItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: finalItemName,
      category: itemCategory,
      size: finalItemSize,
      hsnCode: itemHsn,
      mrp: finalMRP,
      sellingPrice: liveSP,
      quantity: liveQty,
      discountAmount: discountInfo.discountAmount,
      discountPercent: discountInfo.discountPercent,
      total: discountInfo.total,
    };

    setItems((prev) => [...prev, newItem]);

    // Reset row inputs
    setItemName('');
    setItemMRP('');
    setItemSellingPrice('');
    setItemSize('');
    setItemQty(1);
  };

  // Helper to add from quick product pill
  const handleQuickAdd = (p: QuickProduct) => {
    const disc = calculateItemDiscount(p.mrp, p.sellingPrice, 1);
    const newItem: InvoiceItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: p.name || `${p.category} Item`,
      category: p.category,
      size: p.size || '—',
      hsnCode: p.hsnCode,
      mrp: p.mrp,
      sellingPrice: p.sellingPrice,
      quantity: 1,
      discountAmount: disc.discountAmount,
      discountPercent: disc.discountPercent,
      total: disc.total,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Adjust item quantity
  const handleUpdateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          const disc = calculateItemDiscount(item.mrp, item.sellingPrice, newQty);
          return {
            ...item,
            quantity: newQty,
            discountAmount: disc.discountAmount,
            discountPercent: disc.discountPercent,
            total: disc.total,
          };
        }
        return item;
      })
    );
  };

  // Total Calculations
  const subtotalMRP = items.reduce((sum, i) => sum + i.mrp * i.quantity, 0);
  const subtotalSP = items.reduce((sum, i) => sum + i.total, 0);
  const itemDiscountTotal = subtotalMRP - subtotalSP;

  const netSubtotal = Math.max(0, subtotalSP - additionalDiscount);

  let gstAmount = 0;
  if (isGstInvoice && gstRate > 0) {
    gstAmount = (netSubtotal * gstRate) / 100;
  }

  const rawGrandTotal = netSubtotal + gstAmount;
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = Math.round((roundedGrandTotal - rawGrandTotal) * 100) / 100;

  // Handle circular Reset for a New Customer
  const handleNewCustomerReset = () => {
    // Generate next invoice number based on current prefix and number
    let nextNumStr = `${shop.invoicePrefix}${shop.nextInvoiceNumber}`;
    try {
      const match = invoiceNumber.match(/^([A-Za-z_-]+)(\d+)$/);
      if (match) {
        const prefix = match[1];
        const num = parseInt(match[2], 10) + 1;
        nextNumStr = `${prefix}${num}`;
      }
    } catch {
      nextNumStr = `${shop.invoicePrefix}${Date.now().toString().slice(-4)}`;
    }

    setInvoiceNumber(nextNumStr);
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setCustomer({ name: '', phone: '', address: '', gstin: '' });
    setItems([]);
    setItemName('');
    setItemMRP('');
    setItemSellingPrice('');
    setItemSize('');
    setItemQty(1);
    setAdditionalDiscount(0);
    setPaymentMode('Cash');
    setNotes('');

    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 2500);
  };

  // Handle final invoice object compilation - ALWAYS fully PAID
  const buildInvoiceObject = (): Invoice => {
    const finalCustomerName = customer.name.trim() || 'Walk-in Customer';
    return {
      id: existingInvoice?.id || 'inv-' + Date.now(),
      invoiceNumber,
      date,
      time,
      customer: {
        ...customer,
        name: finalCustomerName,
      },
      items,
      subtotalMRP,
      subtotalSP,
      itemDiscountTotal,
      additionalDiscount,
      gstRate: isGstInvoice ? gstRate : 0,
      gstAmount: isGstInvoice ? Math.round(gstAmount * 100) / 100 : 0,
      roundOff,
      grandTotal: roundedGrandTotal,
      amountPaid: roundedGrandTotal,
      dueAmount: 0,
      paymentMode,
      notes,
      isGstInvoice,
      status: 'Paid',
      createdAt: existingInvoice?.createdAt || new Date().toISOString(),
    };
  };

  // Perform action WITHOUT clearing the form
  const handleAction = (
    action: 'save' | 'printA4' | 'printThermal' | 'whatsapp'
  ) => {
    if (items.length === 0) {
      alert('Please add at least one item to the bill!');
      return;
    }
    const inv = buildInvoiceObject();
    onSaveInvoice(inv, action);
  };

  return (
    <div className="space-y-6">
      {/* Customer & Invoice Header Details Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all relative">
        {/* Top Header with Circular New Customer Reset Button */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-3">
          <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-800">
            <User className="w-5 h-5 text-amber-600" />
            <span className="font-bold">Customer & Invoice Details</span>
          </div>

          {/* Right Corner: Bill Number & Circular New Customer Refresh Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium font-mono hidden sm:inline">
                Bill #:
              </span>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="font-mono font-bold text-slate-900 bg-amber-100 border border-amber-300 rounded-lg px-2.5 py-1 text-xs w-28 text-center shadow-xs"
              />
            </div>

            {/* CIRCULAR REFRESH BUTTON FOR NEW CUSTOMER */}
            <div className="relative group">
              <button
                id="btn-new-customer-refresh"
                type="button"
                onClick={handleNewCustomerReset}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black shadow-md shadow-amber-500/20 flex items-center justify-center transition-all duration-300 active:scale-90 border-2 border-amber-300 cursor-pointer"
                title="New Customer: Refresh page & clear form for next customer"
              >
                <RotateCcw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
              </button>

              {/* Tooltip / Label */}
              <span className="absolute -bottom-8 right-0 bg-slate-900 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-md">
                New Customer (Clear Form)
              </span>
            </div>
          </div>
        </div>

        {/* Reset Feedback Notification */}
        {resetFeedback && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Form refreshed! Ready for new customer bill.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 flex items-center justify-between">
              <span>Customer Name</span>
              <span className="text-[10px] text-slate-400 font-normal italic">(Optional)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Ramesh Sharma (Optional)"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 flex items-center justify-between">
              <span>Customer Mobile (+91)</span>
              <span className="text-[10px] text-slate-400 font-normal italic">(For WhatsApp)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="10-digit mobile number"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700">
              Billing Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700">
              Billing Time
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Presets Pills */}
      {quickProducts.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs transition-all">
          <div className="flex items-center gap-2 mb-3 font-mono text-xs font-bold text-slate-700">
            <Tag className="w-4 h-4 text-amber-600" />
            <span>⚡ QUICK GARMENT PRESETS (TAP TO ADD TO BILL)</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickProducts.map((p) => {
              const discPercent =
                p.mrp > p.sellingPrice
                  ? Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100)
                  : 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickAdd(p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer border border-slate-200 bg-slate-50 hover:bg-amber-50 text-slate-800 hover:border-amber-400 shadow-xs hover:scale-105 active:scale-95"
                >
                  <span className="text-slate-900">+{p.name}</span>
                  {p.size && <span className="text-slate-500 text-[10px]">({p.size})</span>}
                  <span className="text-emerald-700 font-extrabold">₹{p.sellingPrice}</span>
                  {discPercent > 0 && (
                    <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] px-1.5 py-0.2 rounded font-black">
                      {discPercent}% OFF
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Items Form Row */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-800">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <span>Add Garment Items</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {items.length} item(s) in list
          </span>
        </div>

        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
            {/* Item Name - OPTIONAL */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold mb-1 text-slate-700 flex items-center justify-between">
                <span>Garment Name</span>
                <span className="text-[10px] text-slate-400 font-normal italic">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cotton Shirt (Optional)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Category */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1 text-slate-700">
                Category
              </label>
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="Shirts">Shirts</option>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Jeans">Jeans</option>
                <option value="Trousers">Trousers</option>
                <option value="Sarees">Sarees</option>
                <option value="Ladies Wear">Ladies Wear</option>
                <option value="Kids Wear">Kids Wear</option>
                <option value="Ethnic Wear">Ethnic Wear</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            {/* Size - OPTIONAL */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold mb-1 text-slate-700 flex items-center justify-between">
                <span>Size</span>
                <span className="text-[9px] text-slate-400 font-normal italic">(Opt)</span>
              </label>
              <input
                type="text"
                placeholder="L / 32"
                value={itemSize}
                onChange={(e) => setItemSize(e.target.value)}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-center text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* MRP - OPTIONAL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1 text-slate-700 flex items-center justify-between">
                <span>MRP (₹)</span>
                <span className="text-[9px] text-slate-400 font-normal italic">(Optional)</span>
              </label>
              <input
                type="number"
                placeholder="Original MRP"
                value={itemMRP}
                onChange={(e) =>
                  setItemMRP(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Selling Price - REQUIRED */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-1 text-amber-700 font-mono">
                Selling Rate (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 799"
                value={itemSellingPrice}
                onChange={(e) =>
                  setItemSellingPrice(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                className="w-full px-3 py-2 bg-amber-50/60 border-2 border-amber-500 rounded-xl text-xs font-mono font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Quantity */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold mb-1 text-slate-700">
                Qty
              </label>
              <input
                type="number"
                min="1"
                value={itemQty}
                onChange={(e) => setItemQty(Math.max(1, Number(e.target.value)))}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-center text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Live Discount Calculator Preview & Add Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {liveSP > 0 ? (
              <div className="flex items-center gap-3 text-xs font-mono bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <span className="text-slate-600">
                  Item Total: <strong className="text-slate-900">₹{liveDiscountInfo.total}</strong>
                </span>
                {liveDiscountInfo.discountAmount > 0 && (
                  <>
                    <span className="text-emerald-700 font-bold">
                      Customer Saves: ₹{liveDiscountInfo.discountAmount}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                      {liveDiscountInfo.discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-500 italic">
                * Enter Selling Rate and tap 'Add to Bill'
              </div>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black font-mono text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ADD TO BILL</span>
            </button>
          </div>
        </form>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Garment</th>
                  <th className="py-2.5 px-3 text-center">Size</th>
                  <th className="py-2.5 px-3 text-right">MRP</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Discount</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const savings = (item.mrp - item.sellingPrice) * item.quantity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 text-slate-800">
                      <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {item.name}
                        {item.category && (
                          <span className="ml-2 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.category}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700 font-bold">
                        {item.size || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 line-through">
                        ₹{item.mrp}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{item.sellingPrice}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="px-2 py-0.5 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="px-2 py-0.5 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                        {savings > 0 ? `₹${savings} (${item.discountPercent}%)` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 text-sm">
                        ₹{item.total}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded transition cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom Row: Payment Mode Selector & Totals Breakdown Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Dedicated Payment Mode Selector */}
        <div className="md:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-mono text-sm font-bold text-slate-800 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-amber-600" />
              <span>PAYMENT MODE</span>
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              STATUS: 100% PAID
            </span>
          </div>

          {/* Three Dedicated Payment Mode Buttons: Cash / UPI / Card */}
          <div className="grid grid-cols-3 gap-3">
            {/* CASH */}
            <button
              id="payment-mode-cash"
              type="button"
              onClick={() => setPaymentMode('Cash')}
              className={`p-4 rounded-xl border-2 font-mono flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                paymentMode === 'Cash'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50/50 font-bold'
              }`}
            >
              <Banknote className="w-7 h-7" />
              <span className="text-sm font-black tracking-wide uppercase">CASH</span>
              {paymentMode === 'Cash' && (
                <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  ✓ SELECTED
                </span>
              )}
            </button>

            {/* UPI */}
            <button
              id="payment-mode-upi"
              type="button"
              onClick={() => setPaymentMode('UPI')}
              className={`p-4 rounded-xl border-2 font-mono flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                paymentMode === 'UPI'
                  ? 'bg-emerald-600 text-white border-emerald-500 font-black shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 font-bold'
              }`}
            >
              <Smartphone className="w-7 h-7" />
              <span className="text-sm font-black tracking-wide uppercase">UPI</span>
              {paymentMode === 'UPI' && (
                <span className="text-[10px] bg-white text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  ✓ SELECTED
                </span>
              )}
            </button>

            {/* CARD */}
            <button
              id="payment-mode-card"
              type="button"
              onClick={() => setPaymentMode('Card')}
              className={`p-4 rounded-xl border-2 font-mono flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                paymentMode === 'Card'
                  ? 'bg-sky-600 text-white border-sky-500 font-black shadow-md shadow-sky-600/20 scale-[1.02]'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-sky-500 hover:bg-sky-50/50 font-bold'
              }`}
            >
              <CreditCard className="w-7 h-7" />
              <span className="text-sm font-black tracking-wide uppercase">CARD</span>
              {paymentMode === 'Card' && (
                <span className="text-[10px] bg-white text-sky-800 px-2 py-0.5 rounded-full font-bold">
                  ✓ SELECTED
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Grand Total & Direct Action Buttons */}
        <div className="md:col-span-5 bg-white text-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 flex flex-col justify-between space-y-6">
          <div className="space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
              <span>Total MRP Value:</span>
              <span className="line-through text-slate-400">
                {formatCurrency(subtotalMRP)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-700 border-b border-slate-100 pb-2 font-bold">
              <span>Total Discount Savings:</span>
              <span className="text-emerald-700">
                - {formatCurrency(itemDiscountTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Selling Subtotal:</span>
              <span className="font-bold text-slate-800">{formatCurrency(netSubtotal)}</span>
            </div>

            <div className="pt-3 border-t-2 border-slate-200 bg-amber-50/50 p-3 rounded-xl border">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 text-xs font-black uppercase tracking-wider block">
                  NET GRAND TOTAL
                </span>
                <span className="text-xs bg-white text-slate-800 border border-slate-300 px-2 py-0.5 rounded-full font-mono font-bold shadow-xs">
                  {paymentMode} (Paid)
                </span>
              </div>
              <div className="text-3xl font-black text-slate-950 font-mono mt-1">
                {formatCurrency(roundedGrandTotal)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100 font-mono">
            <button
              type="button"
              onClick={() => handleAction('printA4')}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT A4 INVOICE (PDF)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAction('printThermal')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Thermal Slip</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('whatsapp')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                title="Send bill directly to customer's WhatsApp"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleAction('save')}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-2 px-3 rounded-xl text-xs text-center border border-slate-200 transition cursor-pointer"
            >
              Save Record Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
