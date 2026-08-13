import React, { useState } from 'react';
import { Invoice, ShopSettings } from '../types';
import { InvoicePreviewA4 } from './InvoicePreviewA4';
import { InvoicePreviewThermal } from './InvoicePreviewThermal';
import { downloadInvoicePDF, shareInvoicePDF } from '../utils/pdfGenerator';
import { createInvoicePermalink } from '../utils/permalink';
import {
  Download,
  Printer,
  Share2,
  CheckCircle,
  Copy,
  Check,
  FileText,
  MessageSquare,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface Props {
  invoice: Invoice;
  shop: ShopSettings;
  onGoToApp?: () => void;
}

export const PublicBillView: React.FC<Props> = ({ invoice, shop, onGoToApp }) => {
  const [viewMode, setViewMode] = useState<'a4' | 'thermal'>('a4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const permalink = createInvoicePermalink(invoice);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    const elementId = viewMode === 'a4' ? 'public-invoice-a4' : 'public-invoice-thermal';
    const fileName = `Sai_Clothes_Invoice_${invoice.invoiceNumber}.pdf`;
    await downloadInvoicePDF(elementId, fileName);
    setIsGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(permalink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const rawPhone = invoice.customer.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.length === 10) {
      formattedPhone = `91${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      formattedPhone = `91${cleanPhone.slice(1)}`;
    }

    const msgText = `*SAI CLOTHES RAILWAY*
*Official Digital Invoice & PDF Receipt* 🛍️✨

*Bill No:* #${invoice.invoiceNumber}
*Date:* ${invoice.date}
*Customer:* ${invoice.customer.name || 'Valued Customer'}
*Net Total:* ₹${invoice.grandTotal}
*Payment Mode:* ${invoice.paymentMode}

Thank you for shopping with us! 🙏`;

    const url = formattedPhone
      ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(msgText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msgText)}`;

    try {
      const win = window.open(url, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = url;
      }
    } catch {
      window.location.href = url;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-3 px-4 sm:px-6 sticky top-0 z-40 print:hidden shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-amber-400">
                  {shop.shopName || 'SAI CLOTHES RAILWAY'}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Official Digital Bill
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Invoice #{invoice.invoiceNumber} • {invoice.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onGoToApp && (
              <button
                onClick={onGoToApp}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Billing Software</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 my-2">
        {/* Banner with Action Buttons */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 print:hidden shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Digital PDF Receipt Available
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                This is a permanent digital copy of your invoice from {shop.shopName || 'Sai Clothes Railway'}.
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-stretch sm:self-auto justify-center">
              <button
                onClick={() => setViewMode('a4')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  viewMode === 'a4'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Full Standard (A4)
              </button>
              <button
                onClick={() => setViewMode('thermal')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  viewMode === 'thermal'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Thermal Slip (3")
              </button>
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800/80">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs sm:text-sm shadow-lg shadow-emerald-950 transition cursor-pointer border border-emerald-400/40 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{isGenerating ? 'Generating PDF...' : 'DOWNLOAD PDF RECEIPT'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-xs transition border border-slate-700 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Bill</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsApp}
              disabled={isGenerating}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-xs transition border border-emerald-500/40 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Share on WhatsApp</span>
            </button>

            {/* Copy Permanent Link */}
            <button
              onClick={handleCopyLink}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-xs transition border border-amber-500/30 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Copy Permanent Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Invoice Container for Print/PDF */}
        <div className="flex justify-center my-4 overflow-x-auto pb-6">
          {viewMode === 'a4' ? (
            <div id="public-invoice-a4" className="shadow-2xl rounded-sm">
              <InvoicePreviewA4 invoice={invoice} shop={shop} />
            </div>
          ) : (
            <div id="public-invoice-thermal" className="shadow-2xl rounded-sm">
              <InvoicePreviewThermal invoice={invoice} shop={shop} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-400 print:hidden font-mono mt-auto">
        <p className="font-bold text-amber-400">
          {shop.shopName || 'SAI CLOTHES RAILWAY'} — Digital Billing & Receipt System
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {shop.addressLine1} {shop.addressLine2} {shop.cityStatePincode} • Phone: {shop.phonePrimary}
        </p>
      </footer>
    </div>
  );
};
