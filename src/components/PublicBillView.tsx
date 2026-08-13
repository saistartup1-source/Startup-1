import React, { useState } from 'react';
import { Invoice, ShopSettings } from '../types';
import { InvoicePreviewThermal } from './InvoicePreviewThermal';
import { downloadInvoicePDF } from '../utils/pdfGenerator';
import { Download } from 'lucide-react';

interface Props {
  invoice: Invoice;
  shop: ShopSettings;
  onGoToApp?: () => void;
}

export const PublicBillView: React.FC<Props> = ({ invoice, shop }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    const elementId = 'public-invoice-thermal';
    const fileName = `Sai_Clothes_Invoice_${invoice.invoiceNumber}.pdf`;
    await downloadInvoicePDF(elementId, fileName);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 my-2">
        {/* Download PDF Button Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 print:hidden shadow-xl flex justify-center sm:justify-start">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 text-xs sm:text-sm shadow-lg shadow-emerald-950 transition cursor-pointer border border-emerald-400/40 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>{isGenerating ? 'Generating PDF...' : 'DOWNLOAD PDF RECEIPT'}</span>
          </button>
        </div>

        {/* Invoice Container for Thermal Slip */}
        <div className="flex justify-center my-4 overflow-x-auto pb-6">
          <div id="public-invoice-thermal" className="shadow-2xl rounded-sm">
            <InvoicePreviewThermal invoice={invoice} shop={shop} />
          </div>
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

