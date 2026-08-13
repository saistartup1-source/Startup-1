import React, { useState } from 'react';
import { Invoice } from '../types';
import { formatCurrency } from '../utils/calculator';
import { BookOpen, CheckCircle2, Phone, Calendar, IndianRupee, Search } from 'lucide-react';

interface Props {
  invoices: Invoice[];
  onRecordPayment: (invoiceId: string, paymentAmount: number) => void;
}

export const UdharLedger: React.FC<Props> = ({ invoices, onRecordPayment }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentInputs, setPaymentInputs] = useState<{ [id: string]: number | '' }>({});

  // Filter invoices that have dueAmount > 0
  const udharInvoices = invoices.filter(
    (inv) =>
      inv.dueAmount > 0 &&
      (inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer.phone.includes(searchTerm) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalUdharOutstanding = udharInvoices.reduce((sum, i) => sum + i.dueAmount, 0);

  const handlePay = (invId: string, currentDue: number) => {
    const val = Number(paymentInputs[invId]);
    if (!val || val <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    if (val > currentDue) {
      alert(`Payment amount (₹${val}) cannot exceed due balance (₹${currentDue})`);
      return;
    }

    onRecordPayment(invId, val);
    setPaymentInputs((prev) => ({ ...prev, [invId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Udhar Header Card */}
      <div className="bg-gradient-to-r from-rose-900 to-slate-900 text-white rounded-xl p-5 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Customer Credit Register (Udhar Ledger)</span>
          </div>
          <h2 className="text-xl font-black">Sai Clothes Customer Credit Tracker</h2>
          <p className="text-xs text-slate-300 mt-1">
            Track pending payments and record cash or UPI installments received from regular customers.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl text-right">
          <span className="text-[10px] text-slate-300 font-medium block uppercase">
            Total Credit Due
          </span>
          <span className="text-2xl font-black font-mono text-rose-300">
            {formatCurrency(totalUdharOutstanding)}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Udhar by customer name, mobile, invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Udhar Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {udharInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <p className="font-bold text-slate-700">No Pending Udhar Balances!</p>
            <p className="text-xs text-slate-400">All customer invoices are fully paid.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer Name & Phone</th>
                  <th className="py-3 px-4 text-right">Bill Total (₹)</th>
                  <th className="py-3 px-4 text-right">Paid (₹)</th>
                  <th className="py-3 px-4 text-right">Balance Due (₹)</th>
                  <th className="py-3 px-4 text-center">Receive Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {udharInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{inv.date}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{inv.customer.name}</p>
                      <p className="font-mono text-[11px] text-slate-500">
                        +91 {inv.customer.phone}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">
                      {formatCurrency(inv.amountPaid)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-rose-600 text-sm">
                      {formatCurrency(inv.dueAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={paymentInputs[inv.id] ?? ''}
                          onChange={(e) =>
                            setPaymentInputs({
                              ...paymentInputs,
                              [inv.id]: e.target.value === '' ? '' : Number(e.target.value),
                            })
                          }
                          className="w-24 px-2 py-1 bg-slate-50 border border-slate-300 rounded font-mono text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handlePay(inv.id, inv.dueAmount)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs transition cursor-pointer"
                        >
                          Receive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
