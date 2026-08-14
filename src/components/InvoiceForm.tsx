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
  Crosshair,
  Sparkles,
  Tag,
  FileText,
  Banknote,
  Smartphone,
  CreditCard,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  shop: ShopSettings;
  quickProducts: QuickProduct[];
  onSaveInvoice: (
    invoice: Invoice,
    action: 'save' | 'printA4' | 'printThermal' | 'whatsapp'
  ) => void;
  existingInvoice?: Invoice | null;
  isMiniMilitiaTheme?: boolean;
}

export const InvoiceForm: React.FC<Props> = ({
  shop,
  quickProducts,
  onSaveInvoice,
  existingInvoice,
  isMiniMilitiaTheme = true,
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
  const [itemSize, setItemSize] = useState('L');
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
  const liveMRP = Number(itemMRP) || 0;
  const liveSP = Number(itemSellingPrice) || 0;
  const liveQty = itemQty || 1;
  const liveDiscountInfo = calculateItemDiscount(liveMRP, liveSP, liveQty);

  // Helper to add current item row
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!itemName.trim()) {
      alert('Please enter or select garment item name');
      return;
    }
    if (liveMRP <= 0 || liveSP <= 0) {
      alert('Please enter valid MRP and Selling Price');
      return;
    }

    const newItem: InvoiceItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: itemName.trim(),
      category: itemCategory,
      size: itemSize,
      hsnCode: itemHsn,
      mrp: liveMRP,
      sellingPrice: liveSP,
      quantity: liveQty,
      discountAmount: liveDiscountInfo.discountAmount,
      discountPercent: liveDiscountInfo.discountPercent,
      total: liveDiscountInfo.total,
    };

    setItems((prev) => [...prev, newItem]);

    // Reset row inputs
    setItemName('');
    setItemMRP('');
    setItemSellingPrice('');
    setItemQty(1);
  };

  // Helper to add from quick product pill
  const handleQuickAdd = (p: QuickProduct) => {
    const disc = calculateItemDiscount(p.mrp, p.sellingPrice, 1);
    const newItem: InvoiceItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: p.name,
      category: p.category,
      size: p.size,
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
    setItemQty(1);
    setAdditionalDiscount(0);
    setPaymentMode('Cash');
    setNotes('');

    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 2000);
  };

  // Handle final invoice object compilation - ALWAYS fully PAID and preserves exact paymentMode
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

  // Perform action WITHOUT clearing the form (All customer details remain until user taps the circular reset button)
  const handleAction = (
    action: 'save' | 'printA4' | 'printThermal' | 'whatsapp'
  ) => {
    if (items.length === 0) {
      alert('Please add at least one cloth item to the bill!');
      return;
    }
    const inv = buildInvoiceObject();
    onSaveInvoice(inv, action);
  };

  return (
    <div className="space-y-6">
      {/* Customer & Invoice Header Details Card */}
      <div
        className={`rounded-2xl shadow-xl border p-5 transition-all relative ${
          isMiniMilitiaTheme
            ? 'bg-slate-900 border-emerald-700/80 text-white camo-card-border'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header with Circular New Customer Reset Button */}
        <div
          className={`flex items-center justify-between border-b pb-3 mb-4 gap-3 ${
            isMiniMilitiaTheme ? 'border-emerald-800/80' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2 font-mono font-bold text-sm">
            {isMiniMilitiaTheme ? (
              <Crosshair className="w-5 h-5 text-amber-400" />
            ) : (
              <User className="w-5 h-5 text-amber-600" />
            )}
            <span className={isMiniMilitiaTheme ? 'text-amber-400 font-black tracking-wide' : 'font-bold'}>
              {isMiniMilitiaTheme
                ? '[BILL DESK & CUSTOMER INFO]'
                : 'Customer & Invoice Details'}
            </span>
          </div>

          {/* Right Corner: Bill Number & Circular New Customer Refresh Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium font-mono hidden sm:inline">
                {isMiniMilitiaTheme ? 'BILL CODE:' : 'Bill #:'}
              </span>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="font-mono font-bold text-slate-950 bg-amber-400 border border-amber-300 rounded-lg px-2.5 py-1 text-xs w-28 text-center shadow-inner"
              />
            </div>

            {/* CIRCULAR REFRESH BUTTON FOR NEW CUSTOMER */}
            <div className="relative group">
              <button
                id="btn-new-customer-refresh"
                type="button"
                onClick={handleNewCustomerReset}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-black shadow-lg shadow-amber-500/40 flex items-center justify-center transition-all duration-300 active:scale-90 border-2 border-amber-200 cursor-pointer"
                title="New Customer: Refresh page & clear form for next customer"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-180 duration-500" />
              </button>

              {/* Tooltip / Label */}
              <span className="absolute -bottom-8 right-0 bg-slate-950 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/60 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-md">
                New Customer (Reset Form)
              </span>
            </div>
          </div>
        </div>

        {/* Reset Feedback Notification */}
        {resetFeedback && (
          <div className="mb-4 bg-emerald-950/90 border border-emerald-500 text-emerald-300 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Form refreshed! Ready for new customer bill.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              className={`block text-xs font-semibold mb-1 flex items-center justify-between ${
                isMiniMilitiaTheme ? 'text-emerald-300 font-mono' : 'text-slate-700'
              }`}
            >
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
                className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 ${
                  isMiniMilitiaTheme
                    ? 'bg-slate-950 border border-emerald-800 text-amber-300 font-mono'
                    : 'bg-slate-50 border border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-xs font-semibold mb-1 flex items-center justify-between ${
                isMiniMilitiaTheme ? 'text-emerald-300 font-mono' : 'text-slate-700'
              }`}
            >
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
                className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 ${
                  isMiniMilitiaTheme
                    ? 'bg-slate-950 border border-emerald-800 text-amber-300'
                    : 'bg-slate-50 border border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-xs font-semibold mb-1 ${
                isMiniMilitiaTheme ? 'text-emerald-300 font-mono' : 'text-slate-700'
              }`}
            >
              Billing Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 ${
                  isMiniMilitiaTheme
                    ? 'bg-slate-950 border border-emerald-800 text-slate-200 font-mono'
                    : 'bg-slate-50 border border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-xs font-semibold mb-1 ${
                isMiniMilitiaTheme ? 'text-emerald-300 font-mono' : 'text-slate-700'
              }`}
            >
              Billing Time
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 ${
                  isMiniMilitiaTheme
                    ? 'bg-slate-950 border border-emerald-800 text-slate-200 font-mono'
                    : 'bg-slate-50 border border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Presets Pills */}
      {quickProducts.length > 0 && (
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isMiniMilitiaTheme
              ? 'bg-slate-900/90 border-emerald-800/80 text-white'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3 font-mono text-xs font-bold text-emerald-400">
            <Tag className="w-4 h-4" />
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer border shadow-sm hover:scale-105 active:scale-95 ${
                    isMiniMilitiaTheme
                      ? 'bg-slate-950 hover:bg-emerald-950 border-emerald-700/60 text-slate-200 hover:border-emerald-400'
                      : 'bg-slate-50 hover:bg-amber-50 border-slate-300 text-slate-800 hover:border-amber-400'
                  }`}
                >
                  <span className="text-amber-400">+{p.name}</span>
                  <span className="text-slate-400 text-[10px]">({p.size})</span>
                  <span className="text-emerald-400">₹{p.sellingPrice}</span>
                  {discPercent > 0 && (
                    <span className="bg-amber-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-black">
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
      <div
        className={`rounded-2xl shadow-xl border p-5 transition-all ${
          isMiniMilitiaTheme
            ? 'bg-slate-900 border-emerald-700/80 text-white camo-card-border'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div
          className={`flex items-center justify-between border-b pb-3 mb-4 ${
            isMiniMilitiaTheme ? 'border-emerald-800/80' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-2 font-mono font-bold text-sm">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className={isMiniMilitiaTheme ? 'text-amber-400 font-black' : ''}>
              {isMiniMilitiaTheme
                ? '[DISPATCH GARMENT ITEMS TO BILL]'
                : 'Add Garment Items'}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {items.length} item(s) added
          </span>
        </div>

        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
            {/* Item Name */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold mb-1 font-mono text-emerald-300">
                Item / Garment Name
              </label>
              <input
                type="text"
                placeholder="e.g. Cotton Shirt, Denim Jeans"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 ${
                  isMiniMilitiaTheme
                    ? 'bg-slate-950 border border-emerald-800 text-amber-300 font-mono'
                    : 'bg-slate-50 border border-slate-300 text-slate-800'
                }`}
              />
            </div>

            {/* Category */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1 font-mono text-emerald-300">
                Category
              </label>
              <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                className={`w-full px-2.5 py-2 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 ${
                  isMiniMilitiaTheme
                    ? 'bg-slate-950 border border-emerald-800 text-slate-200'
                    : 'bg-slate-50 border border-slate-300 text-slate-800'
                }`}
              >
                <option value="Shirts">Shirts</option>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Jeans">Jeans</option>
                <option value="Trousers">Trousers</option>
                <option value="Sarees">Sarees</option>
                <option value="Ladies Wear">Ladies Wear</option>
                <option value="Kids Wear">Kids Wear</option>
                <option value="Ethic Wear">Ethnic Wear</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            {/* Size */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold mb-1 font-mono text-emerald-300">
                Size
              </label>
              <input
                type="text"
                placeholder="L / 32"
                value={itemSize}
                onChange={(e) => setItemSize(e.target.value)}
                className={`w-full px-2 py-2 rounded-xl text-xs font-mono font-bold text-center focus:ring-2 focus:ring-amber-500 ${
                  isMiniMilitiaTheme
                    ? 'bg-slate-950 border border-emerald-800 text-amber-300'
                    : 'bg-slate-50 border border-slate-300 text-slate-800'
                }`}
              />
            </div>

            {/* MRP */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1 font-mono text-emerald-300">
                Original MRP (₹)
              </label>
              <input
                type="number"
                placeholder="1499"
                value={itemMRP}
                onChange={(e) =>
                  setItemMRP(e.target.value === '' ? '' : Number(e.target.value))
                }
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 ${
                  isMiniMilitiaTheme
                    ? 'bg-slate-950 border border-emerald-800 text-slate-300'
                    : 'bg-slate-50 border border-slate-300 text-slate-800'
                }`}
              />
            </div>

            {/* Selling Price */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1 font-mono text-amber-400 font-bold">
                Selling Rate (₹)
              </label>
              <input
                type="number"
                placeholder="899"
                value={itemSellingPrice}
                onChange={(e) =>
                  setItemSellingPrice(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-black focus:ring-2 focus:ring-amber-500 ${
                  isMiniMilitiaTheme
                    ? 'bg-slate-950 border-2 border-amber-400 text-amber-300'
                    : 'bg-amber-50 border-2 border-amber-500 text-slate-900'
                }`}
              />
            </div>

            {/* Quantity */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold mb-1 font-mono text-emerald-300">
                Qty
              </label>
              <input
                type="number"
                min="1"
                value={itemQty}
                onChange={(e) => setItemQty(Math.max(1, Number(e.target.value)))}
                className={`w-full px-2 py-2 rounded-xl text-xs font-mono font-bold text-center focus:ring-2 focus:ring-amber-500 ${
                  isMiniMilitiaTheme
                    ? 'bg-slate-950 border border-emerald-800 text-amber-300'
                    : 'bg-slate-50 border border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Live Discount Calculator Preview & Add Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {liveMRP > 0 && liveSP > 0 ? (
              <div className="flex items-center gap-3 text-xs font-mono bg-slate-950/80 px-3 py-2 rounded-xl border border-emerald-800">
                <span className="text-slate-400">
                  Item Total: <strong className="text-white">₹{liveDiscountInfo.total}</strong>
                </span>
                <span className="text-emerald-400 font-bold">
                  Customer Saves: ₹{liveDiscountInfo.discountAmount}
                </span>
                <span className="bg-emerald-600 text-white font-black px-2 py-0.5 rounded text-[10px]">
                  {liveDiscountInfo.discountPercent}% OFF
                </span>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-500 italic">
                * Automatic discount calculation applies instantly
              </div>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black font-mono text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ADD TO INVOICE</span>
            </button>
          </div>
        </form>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-emerald-300 font-bold uppercase text-[11px] border-b border-emerald-800">
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
              <tbody className="divide-y divide-slate-800">
                {items.map((item, idx) => {
                  const savings = (item.mrp - item.sellingPrice) * item.quantity;
                  return (
                    <tr
                      key={item.id}
                      className={
                        isMiniMilitiaTheme
                          ? 'hover:bg-slate-800/50 text-slate-200'
                          : 'hover:bg-slate-50 text-slate-800'
                      }
                    >
                      <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        {item.name}
                        {item.category && (
                          <span className="ml-2 text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.category}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center text-amber-300 font-bold">
                        {item.size || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 line-through">
                        ₹{item.mrp}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                        ₹{item.sellingPrice}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-950">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="px-2 py-0.5 hover:bg-slate-800 text-amber-400 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="px-2 py-0.5 hover:bg-slate-800 text-amber-400 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        ₹{savings} ({item.discountPercent}%)
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-white text-sm">
                        ₹{item.total}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 hover:bg-rose-950 text-rose-400 rounded transition"
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
        <div
          className={`md:col-span-7 rounded-2xl shadow-xl border p-5 transition-all space-y-4 ${
            isMiniMilitiaTheme
              ? 'bg-slate-900 border-emerald-700/80 text-white camo-card-border'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
            <span className="font-mono text-sm font-black text-amber-400 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-amber-400" />
              <span>PAYMENT MODE</span>
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600">
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
                  ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/40 ring-2 ring-amber-400 scale-[1.03]'
                  : 'bg-slate-950/90 border-emerald-900/80 text-slate-300 hover:border-amber-500 hover:bg-slate-900 font-bold'
              }`}
            >
              <Banknote className="w-7 h-7" />
              <span className="text-sm font-black tracking-wide uppercase">CASH</span>
              {paymentMode === 'Cash' && (
                <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  ✓ ACTIVE
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
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-400 scale-[1.03]'
                  : 'bg-slate-950/90 border-emerald-900/80 text-slate-300 hover:border-emerald-500 hover:bg-slate-900 font-bold'
              }`}
            >
              <Smartphone className="w-7 h-7" />
              <span className="text-sm font-black tracking-wide uppercase">UPI</span>
              {paymentMode === 'UPI' && (
                <span className="text-[10px] bg-slate-950 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  ✓ ACTIVE
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
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400 scale-[1.03]'
                  : 'bg-slate-950/90 border-emerald-900/80 text-slate-300 hover:border-cyan-500 hover:bg-slate-900 font-bold'
              }`}
            >
              <CreditCard className="w-7 h-7" />
              <span className="text-sm font-black tracking-wide uppercase">CARD</span>
              {paymentMode === 'Card' && (
                <span className="text-[10px] bg-slate-950 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                  ✓ ACTIVE
                </span>
              )}
            </button>
          </div>

          {/* Optional Extra Discount & GST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold mb-1 font-mono text-emerald-300">
                Extra Flat Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={additionalDiscount || ''}
                placeholder="0"
                onChange={(e) => setAdditionalDiscount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-emerald-800 rounded-xl text-xs font-mono text-amber-400 font-bold focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 font-mono text-emerald-300">
                Tax Type
              </label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsGstInvoice(!isGstInvoice)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                    isGstInvoice
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {isGstInvoice ? 'GST Tax Invoice (5%)' : 'Standard Retail Bill'}
                </button>
              </div>
            </div>
          </div>

          {/* Optional Bill Note / Remarks */}
          <div className="pt-2">
            <label className="block text-xs font-semibold mb-1 font-mono text-emerald-300">
              Invoice Note / Remark (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 7 days exchange policy with original bill"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-emerald-800 rounded-xl text-xs font-mono text-slate-200 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Right Side: Grand Total & Direct Action Buttons */}
        <div className="md:col-span-5 bg-slate-950 text-white rounded-2xl shadow-2xl p-5 border-2 border-emerald-700/80 flex flex-col justify-between space-y-6">
          <div className="space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-emerald-900/60 pb-2">
              <span>Total MRP Value:</span>
              <span className="line-through text-slate-500">
                {formatCurrency(subtotalMRP)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-400 border-b border-emerald-900/60 pb-2 font-bold">
              <span>Total Discount Savings:</span>
              <span className="text-amber-400">
                - {formatCurrency(itemDiscountTotal + additionalDiscount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Selling Subtotal:</span>
              <span className="font-bold">{formatCurrency(netSubtotal)}</span>
            </div>

            {isGstInvoice && (
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>GST Tax ({gstRate}%):</span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
            )}

            <div className="pt-2 border-t-2 border-emerald-700">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block">
                  [NET GRAND TOTAL]
                </span>
                <span className="text-xs bg-slate-900 text-amber-300 border border-emerald-600 px-2 py-0.5 rounded-full font-mono font-bold">
                  Paid via {paymentMode}
                </span>
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono mt-1">
                {formatCurrency(roundedGrandTotal)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-emerald-900/80 font-mono">
            <button
              type="button"
              onClick={() => handleAction('printA4')}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>FIRE & PRINT A4 INVOICE</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAction('printThermal')}
                className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-700 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Thermal Slip</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('whatsapp')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-emerald-400/40 shadow-lg shadow-emerald-900/50"
                title="Send bill directly to customer's WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>
                  {customer.phone?.trim()
                    ? `WhatsApp (+91 ${customer.phone.replace(/\D/g, '').slice(-10)})`
                    : 'WhatsApp Direct'}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleAction('save')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold py-1.5 px-3 rounded-xl text-xs text-center border border-slate-800 transition cursor-pointer"
            >
              Save Record Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
