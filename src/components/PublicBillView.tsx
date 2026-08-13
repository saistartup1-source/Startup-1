import React, { useState } from 'react';
import { Invoice, ShopSettings } from '../types';
import { InvoicePreviewA4 } from './InvoicePreviewA4';
import { InvoicePreviewThermal } from './InvoicePreviewThermal';
import { downloadInvoicePDF } from '../utils/pdfGenerator';
import {
  Download,
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

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    const elementId = viewMode === 'a4' ? 'public-invoice-a4' : 'public-invoice-thermal';
    const fileName = `Sai_Clothes_Invoice_${invoice.invoiceNumber}.pdf`;
    await downloadInvoicePDF(elementId, fileName);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top bar with Open Billing Software if available */}
      {onGoToApp && (
        <header className="bg-slate-900 border-b border-slate-800 py-2.5 px-4 sm:px-6 print:hidden shadow-md flex justify-end">
          <button
            onClick={onGoToApp}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold px-3.5 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Billing Software</span>
          </button>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 my-2">
        {/* Banner with Download PDF & Format Toggle */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 print:hidden shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 text-xs sm:text-sm shadow-lg shadow-emerald-950 transition cursor-pointer border border-emerald-400/40 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{isGenerating ? 'Generating PDF...' : 'DOWNLOAD PDF RECEIPT'}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs justify-center">
              <button
                onClick={() => setViewMode('a4')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'a4'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Full Standard (A4)
              </button>
              <button
                onClick={() => setViewMode('thermal')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  viewMode === 'thermal'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Thermal Slip (3")
              </button>
            </div>
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
