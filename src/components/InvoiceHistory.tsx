import React, { useState } from 'react';
import { Invoice } from '../types';
import { formatCurrency } from '../utils/calculator';
import {
  Search,
  Share2,
  Eye,
  Trash2,
  Receipt,
  FileText,
  Download,
  Crosshair,
} from 'lucide-react';

interface Props {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice, viewMode: 'a4' | 'thermal') => void;
  onDeleteInvoice: (id: string) => void;
  onShareWhatsApp: (invoice: Invoice) => void;
  isMiniMilitiaTheme?: boolean;
}

export const InvoiceHistory: React.FC<Props> = ({
  invoices,
  onSelectInvoice,
  onDeleteInvoice,
  onShareWhatsApp,
  isMiniMilitiaTheme = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Unpaid'>('All');
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

    // Status
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

    // Date
    let matchesDate = true;
    if (dateFilter === 'Today') {
      matchesDate = inv.date === todayStr;
    } else if (dateFilter === 'ThisMonth') {
      matchesDate = inv.date.startsWith(thisMonthStr);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate Metrics
  const totalRevenue = filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalDiscounts = filteredInvoices.reduce(
    (sum, i) => sum + i.itemDiscountTotal + i.additionalDiscount,
    0
  );
  const totalPendingDue = filteredInvoices.reduce((sum, i) => sum + i.dueAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-xl border shadow-md font-mono ${
            isMiniMilitiaTheme
              ? 'bg-slate-900 border-emerald-700/80 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            {isMiniMilitiaTheme ? '[BATTALION TOTAL SALES]' : 'Filtered Total Sales'}
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {formatCurrency(totalRevenue)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {filteredInvoices.length} bill records
          </span>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-md font-mono ${
            isMiniMilitiaTheme
              ? 'bg-slate-900 border-emerald-700/80 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            {isMiniMilitiaTheme ? '[DISCOUNT FIRED]' : 'Total Discounts Given'}
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {formatCurrency(totalDiscounts)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Saved for clients
          </span>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-md font-mono ${
            isMiniMilitiaTheme
              ? 'bg-slate-900 border-emerald-700/80 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            {isMiniMilitiaTheme ? '[PENDING UDHAR RECON]' : 'Pending Udhar Due'}
          </span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {formatCurrency(totalPendingDue)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Credit outstanding
          </span>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-md font-mono ${
            isMiniMilitiaTheme
              ? 'bg-slate-900 border-emerald-700/80 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
            {isMiniMilitiaTheme ? '[WAR ARCHIVE CARGO]' : 'Total Bills Count'}
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {filteredInvoices.length} Bills
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Sai Clothes Railway
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between font-mono ${
          isMiniMilitiaTheme
            ? 'bg-slate-900 border-emerald-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search bill #, customer, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 ${
              isMiniMilitiaTheme
                ? 'bg-slate-950 border border-emerald-800 text-amber-300'
                : 'bg-slate-50 border border-slate-300 text-slate-800'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-emerald-800">
            <button
              onClick={() => setDateFilter('All')}
              className={`px-3 py-1 rounded font-bold transition cursor-pointer ${
                dateFilter === 'All'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('Today')}
              className={`px-3 py-1 rounded font-bold transition cursor-pointer ${
                dateFilter === 'Today'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('ThisMonth')}
              className={`px-3 py-1 rounded font-bold transition cursor-pointer ${
                dateFilter === 'ThisMonth'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-emerald-800">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1 rounded font-bold transition cursor-pointer ${
                statusFilter === 'All'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter('Paid')}
              className={`px-3 py-1 rounded font-bold transition cursor-pointer ${
                statusFilter === 'Paid'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setStatusFilter('Partial')}
              className={`px-3 py-1 rounded font-bold transition cursor-pointer ${
                statusFilter === 'Partial'
                  ? 'bg-amber-600 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Udhar
            </button>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div
        className={`rounded-xl shadow-md border overflow-hidden transition-all ${
          isMiniMilitiaTheme
            ? 'bg-slate-900 border-emerald-700/80'
            : 'bg-white border-slate-200'
        }`}
      >
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2 font-mono">
            <Receipt className="w-10 h-10 mx-auto text-emerald-600" />
            <p className="font-bold text-slate-200">No invoices found in archive</p>
            <p className="text-xs text-slate-400">
              Try clearing search filters or create a new invoice bill.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-emerald-300 font-bold uppercase text-[11px] border-b border-emerald-800">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-right">Bill Total (₹)</th>
                  <th className="py-3 px-4 text-right">Discount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions & PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredInvoices.map((inv) => {
                  const totalSavings = inv.itemDiscountTotal + inv.additionalDiscount;

                  return (
                    <tr
                      key={inv.id}
                      className={
                        isMiniMilitiaTheme
                          ? 'hover:bg-slate-800/60 text-slate-200'
                          : 'hover:bg-slate-50 text-slate-800'
                      }
                    >
                      <td className="py-3 px-4 font-mono font-bold text-amber-300">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <div>{inv.date}</div>
                        <div className="text-[10px] text-slate-500">{inv.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-white">
                          {inv.customer.name || 'Walk-in Customer'}
                        </p>
                        {inv.customer.phone && (
                          <p className="text-[11px] font-mono text-emerald-400">
                            +91 {inv.customer.phone}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-300">
                        {inv.items.length} pcs
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-amber-400 text-sm">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {totalSavings > 0 ? formatCurrency(totalSavings) : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                              : inv.status === 'Partial'
                              ? 'bg-amber-950 text-amber-300 border border-amber-600'
                              : 'bg-rose-950 text-rose-300 border border-rose-600'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* VIEW/DOWNLOAD PDF MODAL BUTTON */}
                          <button
                            onClick={() => onSelectInvoice(inv, 'a4')}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 shadow transition cursor-pointer"
                            title="Preview & Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>

                          <button
                            onClick={() => onSelectInvoice(inv, 'thermal')}
                            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-amber-300 rounded-lg border border-slate-700 transition cursor-pointer"
                            title="View Thermal Receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onShareWhatsApp(inv)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg border border-emerald-400/40 shadow transition cursor-pointer"
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
                            className="p-1.5 hover:bg-rose-900/50 text-rose-400 rounded-lg transition cursor-pointer"
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
