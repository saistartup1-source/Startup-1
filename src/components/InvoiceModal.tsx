import React, { useState, useEffect } from 'react';
import { Invoice, ShopSettings } from '../types';
import { InvoicePreviewA4 } from './InvoicePreviewA4';
import { InvoicePreviewThermal } from './InvoicePreviewThermal';
import { downloadInvoicePDF } from '../utils/pdfGenerator';
import { createInvoicePermalink } from '../utils/permalink';
import { uploadInvoicePdfToStorage } from '../utils/pdfUploader';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  Loader2,
  FileText,
  ShoppingBag,
} from 'lucide-react';

interface Props {
  invoice: Invoice;
  shop: ShopSettings;
  mode?: 'a4' | 'thermal';
  autoSharePdf?: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<Props> = ({
  invoice,
  shop,
  mode = 'a4',
  autoSharePdf = false,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'a4' | 'thermal'>(mode);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Client phone for direct sharing
  const [targetPhone, setTargetPhone] = useState(invoice.customer.phone || '');
  const [shareSuccess, setShareSuccess] = useState(false);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Download Handler
  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    const elementId =
      viewMode === 'a4' ? 'printable-invoice-a4' : 'printable-invoice-thermal';
    const fileName = `Sai_Clothes_Invoice_${invoice.invoiceNumber}.pdf`;

    const success = await downloadInvoicePDF(elementId, fileName);
    setIsGeneratingPdf(false);
    if (success) {
      alert(`Invoice ${invoice.invoiceNumber} PDF downloaded successfully!`);
    } else {
      alert('Failed to generate PDF. You can also press Print and choose "Save as PDF".');
    }
  };

  // Auto-upload PDF to storage when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      const elementId = viewMode === 'a4' ? 'printable-invoice-a4' : 'printable-invoice-thermal';
      uploadInvoicePdfToStorage(invoice, elementId).catch((err) =>
        console.error('Background PDF upload error:', err)
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [invoice, viewMode]);

  // WhatsApp Share Payload Text Generator
  const generateMessageText = () => {
    const totalDiscount = invoice.itemDiscountTotal + invoice.additionalDiscount;
    const itemsList = invoice.items
      .map(
        (i) =>
          `• ${i.name}${i.size && i.size !== '—' ? ` (${i.size})` : ''} x ${i.quantity} = ₹${i.total}`
      )
      .join('\n');

    const permalink = createInvoicePermalink(invoice);

    return `*SAI CLOTHES RAILWAY*
*Thank you for buying! Visit again!* 🛍️✨

*Bill / Invoice No:* #${invoice.invoiceNumber}
*Date:* ${invoice.date}
*Customer:* ${invoice.customer.name || 'Valued Customer'}

*Items Purchased:*
${itemsList}

*Subtotal (MRP):* ₹${invoice.subtotalMRP}
*Total Savings / Discount:* -₹${totalDiscount}
*Net Bill Amount:* *₹${invoice.grandTotal}*
*Payment Mode:* ${invoice.paymentMode} (PAID)

📄 *Digital Bill & PDF Link:*
${permalink}

Thank you for shopping with us at Sai Clothes Railway!
Present this digital bill within 7 days for any exchanges.
Have a wonderful day! 🙏`;
  };

  // Direct WhatsApp Launcher (Opens WhatsApp instantly in click gesture event)
  const handleDirectWhatsAppText = (phoneNum?: string, autoDownloadPdf: boolean = true) => {
    const rawPhone = phoneNum || targetPhone;
    const cleanPhone = rawPhone.replace(/\D/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.length === 10) {
      formattedPhone = `91${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      formattedPhone = `91${cleanPhone.slice(1)}`;
    }

    const msg = generateMessageText();
    const encodedMsg = encodeURIComponent(msg);

    // Universal WhatsApp launcher link
    const url = formattedPhone
      ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMsg}`
      : `https://api.whatsapp.com/send?text=${encodedMsg}`;

    try {
      const win = window.open(url, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = url;
      }
    } catch {
      window.location.href = url;
    }

    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);

    const elementId = viewMode === 'a4' ? 'printable-invoice-a4' : 'printable-invoice-thermal';
    uploadInvoicePdfToStorage(invoice, elementId).catch((err) =>
      console.error('Background PDF storage upload error:', err)
    );

    if (autoDownloadPdf) {
      const fileName = `Sai_Clothes_Invoice_${invoice.invoiceNumber}.pdf`;
      downloadInvoicePDF(elementId, fileName).catch((err) =>
        console.error('Background PDF download error:', err)
      );
    }
  };

  // Auto-trigger direct WhatsApp share if requested from parent component
  useEffect(() => {
    if (autoSharePdf) {
      const timer = setTimeout(() => {
        handleDirectWhatsAppText(targetPhone, true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoSharePdf]);

  // Direct SMS Share
  const handleDirectSms = () => {
    const cleanPhone = targetPhone.replace(/\D/g, '');
    const msg = `Sai Clothes Railway Bill ${invoice.invoiceNumber}: Net Amount ₹${invoice.grandTotal}. Thank you!`;
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(msg)}`;
    window.open(smsUrl, '_blank');
  };

  // Copy Summary Text
  const handleCopyText = () => {
    const summary = generateMessageText();
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden font-sans border border-slate-200">
        {/* Top Header Bar */}
        <div className="bg-white text-slate-900 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-mono font-bold text-lg shadow-xs">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-mono font-black text-sm tracking-wider uppercase">
                  SAI CLOTHES RAILWAY
                </span>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  PAID INVOICE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Bill No: <strong className="text-slate-900">{invoice.invoiceNumber}</strong> • Customer:{' '}
                {invoice.customer.name || 'Walk-in Customer'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('a4')}
                className={`px-3 py-1 rounded font-bold font-mono transition cursor-pointer ${
                  viewMode === 'a4'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Standard
              </button>
              <button
                onClick={() => setViewMode('thermal')}
                className={`px-3 py-1 rounded font-bold font-mono transition cursor-pointer ${
                  viewMode === 'thermal'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                80mm Thermal
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg border border-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Action Bar with Direct WhatsApp & PDF Share */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {/* PRIMARY: DIRECT WHATSAPP CHAT */}
            <button
              onClick={() => handleDirectWhatsAppText(targetPhone, true)}
              disabled={isGeneratingPdf}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Opens WhatsApp directly for customer phone number"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              <span>
                {targetPhone.trim()
                  ? `WHATSAPP (+91 ${targetPhone.replace(/\D/g, '').slice(-10)})`
                  : 'DIRECT WHATSAPP'}
              </span>
            </button>

            {/* DIRECT DOWNLOAD PDF BUTTON */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>DOWNLOAD PDF</span>
            </button>

            {/* COPY PERMANENT PDF LINK BUTTON */}
            <button
              onClick={() => {
                const link = createInvoicePermalink(invoice);
                navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }}
              className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
              title="Copy permanent link to customer PDF bill"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Bill Link</span>
                </>
              )}
            </button>

            {/* PRINT BUTTON */}
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print</span>
            </button>

            {/* COPY SUMMARY BUTTON */}
            <button
              onClick={handleCopyText}
              className="bg-white hover:bg-slate-100 text-slate-700 font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4 text-slate-500" />
              )}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Sai Clothes Railway Retail POS</span>
          </div>
        </div>

        {/* Modal Scrollable Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/70 flex flex-col gap-4">
          <div>
            {viewMode === 'a4' ? (
              <InvoicePreviewA4 invoice={invoice} shop={shop} />
            ) : (
              <InvoicePreviewThermal invoice={invoice} shop={shop} />
            )}
          </div>

          {/* PERMANENT DIRECT WHATSAPP ACTION PANEL BELOW THE BILL */}
          <div className="bg-white border border-emerald-300 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-900 font-sans print:hidden space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-mono font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    SEND DIRECTLY TO CLIENT WHATSAPP NUMBER
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  Customer:{' '}
                  <strong className="text-slate-900 font-bold">
                    {invoice.customer.name || 'Valued Customer'}
                  </strong>{' '}
                  • Bill Total:{' '}
                  <strong className="text-slate-900 font-bold">₹{invoice.grandTotal}</strong>
                </p>
              </div>

              {/* Status Indicator */}
              <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Direct Message</span>
              </div>
            </div>

            {/* Customer Mobile Number Input & Direct Send Buttons */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 pt-1">
              <div className="flex-1 space-y-1">
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase">
                  Customer Mobile Number (10 Digits)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={targetPhone}
                    onChange={(e) => setTargetPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number e.g. 9876543210"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-3 py-2 text-sm text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Send Actions */}
              <div className="flex flex-wrap sm:flex-nowrap items-end gap-2">
                {/* PRIMARY: DIRECT WHATSAPP CHAT */}
                <button
                  type="button"
                  onClick={() => handleDirectWhatsAppText(targetPhone, true)}
                  disabled={isGeneratingPdf}
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer text-sm whitespace-nowrap disabled:opacity-50"
                  title="Opens WhatsApp directly to customer chat number"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <MessageSquare className="w-5 h-5" />
                  )}
                  <span>
                    {targetPhone.trim()
                      ? `OPEN WHATSAPP (+91 ${targetPhone.replace(/\D/g, '').slice(-10)})`
                      : 'OPEN WHATSAPP CHAT'}
                  </span>
                </button>

                {/* Direct SMS Option */}
                <button
                  type="button"
                  onClick={handleDirectSms}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-300 text-xs whitespace-nowrap"
                  title="Send SMS notification"
                >
                  <Send className="w-3.5 h-3.5 text-slate-600" />
                  <span>SMS</span>
                </button>
              </div>
            </div>

            {shareSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-mono font-bold flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>
                  WhatsApp direct chat opened for +91{' '}
                  {targetPhone.replace(/\D/g, '').slice(-10)} with bill summary and PDF download link!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
