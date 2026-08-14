import React, { useState } from 'react';
import { Invoice } from '../types';
import { formatCurrency } from '../utils/calculator';
import {
  Search,
  Share2,
  Trash2,
  Receipt,
  FileText,
  Download,
  Banknote,
  Smartphone,
  CreditCard,
} from 'lucide-react';

interface Props {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice, viewMode: 'a4' | 'thermal') => void;
  onDeleteInvoice: (id: string) => void;
  onShareWhatsApp: (invoice: Invoice) => void;
}

export const InvoiceHistory: React.FC<Props> = ({
  invoices,
  onSelectInvoice,
  onDeleteInvoice,
  onShareWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'ThisMonth'>('All');

  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = todayStr.substring(0, 7);

  const filteredInvoices = invoices.filter((inv) => {
    // Search
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.customer.name.toLowerCase().includes(term) ||
      inv.customer.phone.includes(term);

    // Date
    let matchesDate = true;
    if (dateFilter === 'Today') {
      matchesDate = inv.date === todayStr;
    } else if (dateFilter === 'ThisMonth') {
      matchesDate = inv.date.startsWith(thisMonthStr);
    }

    return matchesSearch && matchesDate;
  });

  // Calculate Metrics
  const totalRevenue = filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalDiscounts = filteredInvoices.reduce(
    (sum, i) => sum + i.itemDiscountTotal + i.additionalDiscount,
    0
  );
  const totalItemsSold = filteredInvoices.reduce(
    (sum, i) => sum + i.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 shadow-xs bg-white text-slate-900 font-mono">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
            Total Sales Revenue
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {formatCurrency(totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block font-bold">
            100% Fully Paid (Cash/UPI/Card)
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 shadow-xs bg-white text-slate-900 font-mono">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
            Total Discounts Given
          </span>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {formatCurrency(totalDiscounts)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Customer savings provided
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 shadow-xs bg-white text-slate-900 font-mono">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
            Total Items Sold
          </span>
          <div className="text-2xl font-black text-sky-700 font-mono mt-1">
            {totalItemsSold} Pcs
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Garments dispatched
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 shadow-xs bg-white text-slate-900 font-mono">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
            Total Bills Generated
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {filteredInvoices.length} Bills
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Sai Clothes Railway
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 shadow-xs bg-white text-slate-900 flex flex-col md:flex-row gap-3 items-center justify-between font-mono">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search bill #, customer, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setDateFilter('All')}
              className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                dateFilter === 'All'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('Today')}
              className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                dateFilter === 'Today'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('ThisMonth')}
              className={`px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                dateFilter === 'ThisMonth'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="rounded-xl shadow-xs border border-slate-200 bg-white overflow-hidden transition-all">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2 font-mono">
            <Receipt className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No invoices found</p>
            <p className="text-xs text-slate-400">
              Try clearing search filters or create a new invoice bill.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4 text-center">Payment Mode</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-right">Bill Total (₹)</th>
                  <th className="py-3 px-4 text-right">Discount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions & PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const totalSavings = inv.itemDiscountTotal + inv.additionalDiscount;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 text-slate-800">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <div>{inv.date}</div>
                        <div className="text-[10px] text-slate-400">{inv.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">
                          {inv.customer.name || 'Walk-in Customer'}
                        </p>
                        {inv.customer.phone && (
                          <p className="text-[11px] font-mono text-emerald-700">
                            +91 {inv.customer.phone}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] ${
                            inv.paymentMode === 'UPI'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : inv.paymentMode === 'Card'
                              ? 'bg-sky-50 text-sky-800 border border-sky-300'
                              : 'bg-amber-50 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {inv.paymentMode === 'UPI' && <Smartphone className="w-3 h-3" />}
                          {inv.paymentMode === 'Card' && <CreditCard className="w-3 h-3" />}
                          {inv.paymentMode === 'Cash' && <Banknote className="w-3 h-3" />}
                          {inv.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {inv.items.length} pcs
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {totalSavings > 0 ? formatCurrency(totalSavings) : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                          PAID
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* VIEW/DOWNLOAD PDF MODAL BUTTON */}
                          <button
                            onClick={() => onSelectInvoice(inv, 'a4')}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Preview & Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>

                          <button
                            onClick={() => onSelectInvoice(inv, 'thermal')}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition cursor-pointer"
                            title="View Thermal Receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onShareWhatsApp(inv)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer shadow-xs"
                            title={
                              inv.customer.phone
                                ? `Send Bill directly to +91 ${inv.customer.phone} on WhatsApp`
                                : 'Send Bill directly on WhatsApp'
                            }
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition cursor-pointer"
                            title="Delete Invoice Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
