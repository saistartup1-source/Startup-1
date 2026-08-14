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
import { downloadInvoicePDF } from '../utils/pdfGenerator';
import {
  Plus,
  Trash2,
  Printer,
  Share2,
  Sparkles,
  ShoppingBag,
  User,
  Phone,
  Calendar,
  Clock,
  FileSpreadsheet,
  Download,
  Crosshair,
  Shield,
  Zap,
  Flame,
  Tag,
  FileText,
  Send,
  Loader2,
  Banknote,
  Smartphone,
  CreditCard,
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
  const [amountPaid, setAmountPaid] = useState<number | ''>(
    existingInvoice?.amountPaid ?? ''
  );
  const [notes, setNotes] = useState(existingInvoice?.notes || '');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Calculate live item discount preview
  const liveMRP = Number(itemMRP) || 0;
  const liveSP = Number(itemSellingPrice) || 0;
  const liveQty = itemQty || 1;
  const liveDiscountInfo = calculateItemDiscount(liveMRP, liveSP, liveQty);

  // Helper to add current item row
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!itemName.trim()) {
      alert('Please enter or select item name');
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

  const actualPaid =
    amountPaid === '' ? roundedGrandTotal : Math.max(0, Number(amountPaid));
  const dueAmount = Math.max(0, roundedGrandTotal - actualPaid);

  let status: 'Paid' | 'Partial' | 'Unpaid' = 'Paid';
  if (dueAmount >= roundedGrandTotal) {
    status = 'Unpaid';
  } else if (dueAmount > 0) {
    status = 'Partial';
  }

  // Handle final submission
  const buildInvoiceObject = (): Invoice => {
    return {
      id: existingInvoice?.id || 'inv-' + Date.now(),
      invoiceNumber,
      date,
      time,
      customer,
      items,
      subtotalMRP,
      subtotalSP,
      itemDiscountTotal,
      additionalDiscount,
      gstRate: isGstInvoice ? gstRate : 0,
      gstAmount: isGstInvoice ? Math.round(gstAmount * 100) / 100 : 0,
      roundOff,
      grandTotal: roundedGrandTotal,
      amountPaid: actualPaid,
      dueAmount,
      paymentMode,
      notes,
      isGstInvoice,
      status,
      createdAt: existingInvoice?.createdAt || new Date().toISOString(),
    };
  };

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
        className={`rounded-xl shadow-md border p-5 transition-all ${
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
            {isMiniMilitiaTheme ? (
              <Crosshair className="w-5 h-5 text-amber-400" />
            ) : (
              <User className="w-5 h-5 text-amber-600" />
            )}
            <span className={isMiniMilitiaTheme ? 'text-amber-400 font-black' : ''}>
              {isMiniMilitiaTheme
                ? '[TARGET CLIENT RECON & BILL META]'
                : 'Customer & Invoice Info'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium font-mono">
              {isMiniMilitiaTheme ? 'BILL CODE:' : 'Invoice No:'}
            </span>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="font-mono font-bold text-slate-950 bg-amber-400 border border-amber-300 rounded px-2 py-1 text-xs w-28 text-center"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              className={`block text-xs font-semibold mb-1 ${
                isMiniMilitiaTheme ? 'text-emerald-300 font-mono' : 'text-slate-700'
              }`}
            >
              Client Name / Target Customer
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Ramesh Sharma"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 ${
                  isMiniMilitiaTheme
                    ? 'bg-slate-950 border border-emerald-800 text-amber-300 font-mono'
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
              Client Mobile (+91)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="10-digit mobile"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 ${
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
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 ${
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
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 ${
                  isMiniMilitiaTheme
                    ? 'bg-slate-950 border border-emerald-800 text-slate-200 font-mono'
                    : 'bg-slate-50 border border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Catalog Buttons (Mini Militia Ammo Presets) */}
      {quickProducts.length > 0 && (
        <div
          className={`rounded-xl p-4 border transition-all ${
            isMiniMilitiaTheme
              ? 'bg-slate-950 border-emerald-700/80'
              : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-bold text-xs font-mono">
              <Tag className="w-4 h-4 text-amber-400" />
              <span className={isMiniMilitiaTheme ? 'text-amber-400' : 'text-amber-900'}>
                {isMiniMilitiaTheme
                  ? '[AMMO DEPOT PRESETS • 1-TAP BILLING]'
                  : 'Quick Clothes Add (1-Tap Fast Billing)'}
              </span>
            </div>
            <span className="text-[11px] text-emerald-400/80 font-mono">
              Tap preset to load ammo item
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickProducts.map((p) => {
              const discAmount = p.mrp - p.sellingPrice;
              const discPercent = Math.round((discAmount / p.mrp) * 100);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickAdd(p)}
                  className={`border text-left shrink-0 p-2.5 rounded-xl shadow-sm transition hover:scale-[1.03] cursor-pointer group font-mono ${
                    isMiniMilitiaTheme
                      ? 'bg-slate-900 border-emerald-700 hover:border-amber-400 text-white'
                      : 'bg-white hover:bg-amber-100/60 border-amber-300 text-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs group-hover:text-amber-400 flex items-center gap-1">
                    <span>{p.name}</span>
                    <span className="text-[10px] text-amber-300">({p.size})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px]">
                    <span className="text-slate-400 line-through">₹{p.mrp}</span>
                    <span className="font-extrabold text-amber-400">₹{p.sellingPrice}</span>
                    <span className="bg-emerald-900 text-emerald-300 border border-emerald-600 text-[9px] px-1.5 py-0.2 rounded font-bold">
                      {discPercent}% OFF
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Item Entry Form Row */}
      <form
        onSubmit={handleAddItem}
        className={`rounded-xl shadow-md border p-5 transition-all ${
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
              {isMiniMilitiaTheme ? '[LOAD CLOTH ITEM / AMMO]' : 'Add Clothes Item'}
            </span>
          </div>

          {/* Live Discount Callout Badge */}
          {liveMRP > 0 && liveSP > 0 && (
            <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs px-3 py-1 rounded-full font-mono font-black flex items-center gap-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>
                DISCOUNT LAUNCHED: -{formatCurrency(liveDiscountInfo.discountAmount)} (
                {liveDiscountInfo.discountPercent}% OFF)
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Item Name */}
          <div className="md:col-span-3">
            <label
              className={`block text-xs font-semibold mb-1 ${
                isMiniMilitiaTheme ? 'text-emerald-300 font-mono' : 'text-slate-700'
              }`}
            >
              Cloth Description / Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Cotton Shirt / Designer Saree"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 ${
                isMiniMilitiaTheme
                  ? 'bg-slate-950 border border-emerald-800 text-white font-mono'
                  : 'bg-slate-50 border border-slate-300 text-slate-800'
              }`}
            />
          </div>

          {/* Category */}
          <div className="md:col-span-2">
            <label
              className={`block text-xs font-semibold mb-1 ${
                isMiniMilitiaTheme ? 'text-emerald-300 font-mono' : 'text-slate-700'
              }`}
            >
              Category
            </label>
            <select
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 ${
                isMiniMilitiaTheme
                  ? 'bg-slate-950 border border-emerald-800 text-white font-mono'
                  : 'bg-slate-50 border border-slate-300 text-slate-800'
              }`}
            >
              <option value="Shirts">Shirts</option>
              <option value="Jeans">Jeans</option>
              <option value="Sarees">Sarees</option>
              <option value="Ladies Wear">Ladies Wear</option>
              <option value="Kids Wear">Kids Wear</option>
              <option value="T-Shirts">T-Shirts</option>
              <option value="Ethnic Wear">Ethnic Wear</option>
              <option value="Trousers">Trousers</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          {/* Size */}
          <div className="md:col-span-1">
            <label
              className={`block text-xs font-semibold mb-1 ${
                isMiniMilitiaTheme ? 'text-emerald-300 font-mono' : 'text-slate-700'
              }`}
            >
              Size
            </label>
            <select
              value={itemSize}
              onChange={(e) => setItemSize(e.target.value)}
              className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 ${
                isMiniMilitiaTheme
                  ? 'bg-slate-950 border border-emerald-800 text-white font-mono'
                  : 'bg-slate-50 border border-slate-300 text-slate-800'
              }`}
            >
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="30">30</option>
              <option value="32">32</option>
              <option value="34">34</option>
              <option value="36">36</option>
              <option value="Free Size">Free Size</option>
            </select>
          </div>

          {/* MRP */}
          <div className="md:col-span-2">
            <label
              className={`block text-xs font-semibold mb-1 ${
                isMiniMilitiaTheme ? 'text-emerald-300 font-mono' : 'text-slate-700'
              }`}
            >
              MRP (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 1500"
              value={itemMRP}
              onChange={(e) => setItemMRP(e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full px-3 py-1.5 rounded-lg text-xs font-bold font-mono focus:ring-2 focus:ring-amber-500 ${
                isMiniMilitiaTheme
                  ? 'bg-slate-950 border border-emerald-800 text-amber-300'
                  : 'bg-slate-50 border border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Selling Price */}
          <div className="md:col-span-2">
            <label
              className={`block text-xs font-semibold mb-1 ${
                isMiniMilitiaTheme ? 'text-emerald-300 font-mono' : 'text-slate-700'
              }`}
            >
              Selling Price (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 999"
              value={itemSellingPrice}
              onChange={(e) =>
                setItemSellingPrice(e.target.value === '' ? '' : Number(e.target.value))
              }
              className={`w-full px-3 py-1.5 rounded-lg text-xs font-bold font-mono focus:ring-2 focus:ring-amber-500 ${
                isMiniMilitiaTheme
                  ? 'bg-slate-950 border border-emerald-800 text-emerald-400'
                  : 'bg-slate-50 border border-slate-300 text-emerald-800'
              }`}
            />
          </div>

          {/* Quantity */}
          <div className="md:col-span-1">
            <label
              className={`block text-xs font-semibold mb-1 ${
                isMiniMilitiaTheme ? 'text-emerald-300 font-mono' : 'text-slate-700'
              }`}
            >
              Qty
            </label>
            <input
              type="number"
              min="1"
              value={itemQty}
              onChange={(e) => setItemQty(Math.max(1, Number(e.target.value)))}
              className={`w-full px-2 py-1.5 rounded-lg text-xs font-mono font-black text-center ${
                isMiniMilitiaTheme
                  ? 'bg-slate-950 border border-emerald-800 text-amber-300'
                  : 'bg-slate-50 border border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Add Button */}
          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 shadow-md transition cursor-pointer font-mono"
            >
              <Plus className="w-4 h-4" />
              <span>LOAD</span>
            </button>
          </div>
        </div>
      </form>

      {/* Items Table in Current Bill */}
      <div
        className={`rounded-xl shadow-md border overflow-hidden transition-all ${
          isMiniMilitiaTheme
            ? 'bg-slate-900 border-emerald-700/80'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-emerald-800/80">
          <div className="font-bold text-sm flex items-center gap-2 font-mono">
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>
              {isMiniMilitiaTheme
                ? `[CURRENT AMMO INVOICE CARGO • ${items.length} ITEMS]`
                : `Invoice Items List (${items.length} Items)`}
            </span>
          </div>
          {itemDiscountTotal > 0 && (
            <div className="bg-emerald-900 text-emerald-300 border border-emerald-500 text-xs px-3 py-0.5 rounded-full font-mono font-bold">
              CUSTOMER SAVINGS: {formatCurrency(itemDiscountTotal)}
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto text-emerald-600" />
            <p className="font-mono font-bold text-sm text-slate-300">
              No cloth items added to bill yet.
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Use item form above or tap quick ammo presets.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-emerald-300 font-bold uppercase text-[11px] border-b border-emerald-800/80">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Cloth Description</th>
                  <th className="py-3 px-4 text-center">Size</th>
                  <th className="py-3 px-4 text-right">MRP (₹)</th>
                  <th className="py-3 px-4 text-right">Selling Price (₹)</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Discount</th>
                  <th className="py-3 px-4 text-right">Net Total (₹)</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((item, idx) => {
                  const lineSavings = (item.mrp - item.sellingPrice) * item.quantity;
                  return (
                    <tr
                      key={item.id}
                      className={
                        isMiniMilitiaTheme
                          ? 'hover:bg-slate-800/60 text-slate-200'
                          : 'hover:bg-slate-50 text-slate-800'
                      }
                    >
                      <td className="py-3 px-4 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-emerald-400/80">{item.category}</p>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-300">
                        {item.size}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 line-through">
                        {formatCurrency(item.mrp)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        {formatCurrency(item.sellingPrice)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 border border-emerald-800 rounded-lg p-0.5 bg-slate-950">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="w-5 h-5 flex items-center justify-center font-bold text-slate-400 hover:bg-slate-800 rounded"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold text-amber-300">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="w-5 h-5 flex items-center justify-center font-bold text-slate-400 hover:bg-slate-800 rounded"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                        {lineSavings > 0 ? (
                          <div>
                            <span>- {formatCurrency(lineSavings)}</span>
                            <span className="block text-[10px] text-amber-300">
                              ({item.discountPercent}% OFF)
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-amber-400 text-sm">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-900/40 rounded-lg transition"
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

      {/* Bill Totals & Payment Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Simplified Payment Mode Selection (Cash / UPI / Card) */}
        <div
          id="payment-mode-section"
          className={`md:col-span-7 rounded-2xl shadow-lg border p-5 space-y-4 ${
            isMiniMilitiaTheme
              ? 'bg-slate-900 border-emerald-700/80 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div>
            <h3 className="font-bold text-sm font-mono text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Select Payment Mode
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose Cash, UPI, or Card to complete this bill
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* CASH */}
            <button
              id="payment-mode-cash"
              type="button"
              onClick={() => {
                setPaymentMode('Cash');
                setAmountPaid(roundedGrandTotal);
              }}
              className={`p-4 rounded-xl border-2 font-mono flex flex-col items-center justify-center gap-2.5 transition cursor-pointer ${
                paymentMode === 'Cash'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/30 scale-[1.03]'
                  : 'bg-slate-950/90 border-emerald-900/80 text-slate-300 hover:border-amber-500 hover:bg-slate-900 font-bold'
              }`}
            >
              <Banknote className="w-7 h-7" />
              <span className="text-sm font-bold tracking-wide uppercase">CASH</span>
            </button>

            {/* UPI */}
            <button
              id="payment-mode-upi"
              type="button"
              onClick={() => {
                setPaymentMode('UPI');
                setAmountPaid(roundedGrandTotal);
              }}
              className={`p-4 rounded-xl border-2 font-mono flex flex-col items-center justify-center gap-2.5 transition cursor-pointer ${
                paymentMode === 'UPI'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/30 scale-[1.03]'
                  : 'bg-slate-950/90 border-emerald-900/80 text-slate-300 hover:border-emerald-500 hover:bg-slate-900 font-bold'
              }`}
            >
              <Smartphone className="w-7 h-7" />
              <span className="text-sm font-bold tracking-wide uppercase">UPI</span>
            </button>

            {/* CARD */}
            <button
              id="payment-mode-card"
              type="button"
              onClick={() => {
                setPaymentMode('Card');
                setAmountPaid(roundedGrandTotal);
              }}
              className={`p-4 rounded-xl border-2 font-mono flex flex-col items-center justify-center gap-2.5 transition cursor-pointer ${
                paymentMode === 'Card'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-lg shadow-cyan-500/30 scale-[1.03]'
                  : 'bg-slate-950/90 border-emerald-900/80 text-slate-300 hover:border-cyan-500 hover:bg-slate-900 font-bold'
              }`}
            >
              <CreditCard className="w-7 h-7" />
              <span className="text-sm font-bold tracking-wide uppercase">CARD</span>
            </button>
          </div>

          {/* Optional Bill Note / Remarks */}
          <div className="pt-2">
            <label className="block text-xs font-semibold mb-1 font-mono text-emerald-300">
              Invoice Note / Remark (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 7 days exchange policy applies"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-emerald-800 rounded-xl text-xs font-mono text-slate-200 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Right Side: Grand Total & Action Buttons */}
        <div className="md:col-span-5 bg-slate-950 text-white rounded-xl shadow-xl p-5 border-2 border-emerald-700/80 flex flex-col justify-between space-y-6">
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
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block">
                [NET GRAND TOTAL]
              </span>
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
                className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 border border-emerald-700 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Thermal Slip</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('whatsapp')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-emerald-400/40 shadow-lg shadow-emerald-900/50"
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
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold py-1.5 px-3 rounded-lg text-xs text-center border border-slate-800 transition cursor-pointer"
            >
              Save Record Only (No Print)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
