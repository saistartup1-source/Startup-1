import React, { useState, useEffect } from 'react';
import { Invoice, ShopSettings } from '../types';
import { InvoicePreviewA4 } from './InvoicePreviewA4';
import { InvoicePreviewThermal } from './InvoicePreviewThermal';
import { downloadInvoicePDF, shareInvoicePDF, generateInvoicePDFFile } from '../utils/pdfGenerator';
import { createInvoicePermalink, getInvoicePdfStorageUrl } from '../utils/permalink';
import { uploadInvoicePdfToStorage } from '../utils/pdfUploader';
import {
  X,
  Printer,
  Share2,
  Download,
  Copy,
  Check,
  PhoneCall,
  Send,
  MessageSquare,
  Crosshair,
  Sparkles,
  Loader2,
  FileText,
} from 'lucide-react';

interface Props {
  invoice: Invoice;
  shop: ShopSettings;
  initialMode?: 'a4' | 'thermal';
  autoSharePdf?: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<Props> = ({
  invoice,
  shop,
  initialMode = 'a4',
  autoSharePdf = false,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'a4' | 'thermal'>(initialMode);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showDirectShareModal, setShowDirectShareModal] = useState(false);

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
  const generateMessageText = (pdfBlobUrl?: string) => {
    const totalDiscount = invoice.itemDiscountTotal + invoice.additionalDiscount;
    const itemsList = invoice.items
      .map(
        (i) =>
          `• ${i.name} (${i.size || 'Size'}) x ${i.quantity} = ₹${i.total}`
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

  // Share PDF & Invoice directly to WhatsApp chat
  const handleSharePDF = (phoneNum?: string) => {
    handleDirectWhatsAppText(phoneNum, true);
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

    // Launch WhatsApp immediately within the user gesture loop to prevent popup blocking
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

    // Background PDF upload and download if requested
    const elementId = viewMode === 'a4' ? 'printable-invoice-a4' : 'printable-invoice-thermal';
    uploadInvoicePdfToStorage(invoice, elementId).catch((err) => console.error('Background PDF storage upload error:', err));

    if (autoDownloadPdf) {
      const fileName = `Sai_Clothes_Invoice_${invoice.invoiceNumber}.pdf`;
      downloadInvoicePDF(elementId, fileName).catch((err) => console.error('Background PDF download error:', err));
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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-emerald-800/80 rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Top Mini Militia Tactical Header Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 text-white p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/60 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700/80 border border-emerald-500/80 flex items-center justify-center text-amber-300 font-mono font-black text-lg shadow-inner">
              <Crosshair className="w-5 h-5 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono font-black text-sm tracking-wider uppercase">
                  [MINI MILITIA SQUAD HQ]
                </span>
                <span className="bg-emerald-900/90 text-emerald-300 border border-emerald-600 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  TACTICAL BILL
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Invoice No:{' '}
                <strong className="text-amber-300">{invoice.invoiceNumber}</strong> • Client:{' '}
                {invoice.customer.name || 'Target Client'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="bg-slate-950 p-1 rounded-lg border border-emerald-900/60 flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('a4')}
                className={`px-3 py-1 rounded font-bold font-mono transition cursor-pointer ${
                  viewMode === 'a4'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                A4 Standard
              </button>
              <button
                onClick={() => setViewMode('thermal')}
                className={`px-3 py-1 rounded font-bold font-mono transition cursor-pointer ${
                  viewMode === 'thermal'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                80mm Thermal
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Action Bar with Direct WhatsApp & PDF Share */}
        <div className="bg-slate-900/95 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {/* PRIMARY: DIRECT WHATSAPP CHAT (BYPASSES OS SHARE PICKER) */}
            <button
              onClick={() => handleDirectWhatsAppText(targetPhone, true)}
              disabled={isGeneratingPdf}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/50 transition cursor-pointer border border-emerald-300/40 disabled:opacity-50"
              title="Opens WhatsApp directly for customer phone number"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <MessageSquare className="w-4 h-4 text-amber-300" />
              )}
              <span>
                {targetPhone.trim()
                  ? `DIRECT WHATSAPP (+91 ${targetPhone.replace(/\D/g, '').slice(-10)})`
                  : 'DIRECT WHATSAPP CHAT'}
              </span>
            </button>

            {/* SECONDARY: SHARE PDF VIA SYSTEM SHARE SHEET */}
            <button
              onClick={() => handleSharePDF(targetPhone)}
              disabled={isGeneratingPdf}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-emerald-500/50 disabled:opacity-50"
              title="Share PDF file using Android/iOS system share dialog"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Attach PDF (OS Share)</span>
            </button>

            {/* DIRECT DOWNLOAD PDF BUTTON */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
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
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-amber-500/40"
              title="Copy permanent link to customer PDF bill"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Copy Perm Link</span>
                </>
              )}
            </button>

            {/* PRINT BUTTON */}
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print</span>
            </button>

            {/* COPY SUMMARY BUTTON */}
            <button
              onClick={handleCopyText}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="text-emerald-400/80 font-mono text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Direct WhatsApp Integration • Sai Clothes Railway</span>
          </div>
        </div>

        {/* Modal Scrollable Content Container (Invoice Preview & Direct WhatsApp Bar) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950/60 flex flex-col gap-4">
          <div>
            {viewMode === 'a4' ? (
              <InvoicePreviewA4 invoice={invoice} shop={shop} />
            ) : (
              <InvoicePreviewThermal invoice={invoice} shop={shop} />
            )}
          </div>

          {/* PERMANENT DIRECT WHATSAPP ACTION PANEL BELOW THE BILL */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/80 to-slate-900 border-2 border-emerald-500/80 rounded-2xl p-4 sm:p-5 shadow-2xl text-white font-sans print:hidden space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="font-mono font-black text-amber-300 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    SEND DIRECTLY TO CLIENT WHATSAPP NUMBER
                  </h3>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Customer:{' '}
                  <strong className="text-white font-bold">
                    {invoice.customer.name || 'Valued Customer'}
                  </strong>{' '}
                  • Bill Total:{' '}
                  <strong className="text-amber-400 font-bold">₹{invoice.grandTotal}</strong>
                </p>
              </div>

              {/* Status Indicator */}
              <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/90 border border-emerald-600/80 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Bypasses System Share Sheet</span>
              </div>
            </div>

            {/* Customer Mobile Number Input & Direct Send Buttons */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 pt-1">
              <div className="flex-1 space-y-1">
                <label className="block text-[11px] font-mono font-bold text-emerald-300 uppercase">
                  Customer Mobile Number (10 Digits)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono font-black text-emerald-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={targetPhone}
                    onChange={(e) => setTargetPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number e.g. 9876543210"
                    className="w-full bg-slate-950 border-2 border-emerald-600 rounded-xl pl-12 pr-3 py-2 text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>
              </div>

              {/* Send Actions */}
              <div className="flex flex-wrap sm:flex-nowrap items-end gap-2">
                {/* PRIMARY: DIRECT WHATSAPP CHAT (BYPASSES OS SHARE SHEET) */}
                <button
                  type="button"
                  onClick={() => handleDirectWhatsAppText(targetPhone, true)}
                  disabled={isGeneratingPdf}
                  className="flex-1 sm:flex-initial bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950 transition cursor-pointer border border-emerald-300/40 text-sm whitespace-nowrap disabled:opacity-50"
                  title="Opens WhatsApp directly to customer chat number"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-amber-300" />
                  )}
                  <span>
                    {targetPhone.trim()
                      ? `OPEN DIRECT WHATSAPP (+91 ${targetPhone.replace(/\D/g, '').slice(-10)})`
                      : 'OPEN DIRECT WHATSAPP CHAT'}
                  </span>
                </button>

                {/* SECONDARY: ATTACH PDF VIA OS SHARE SHEET */}
                <button
                  type="button"
                  onClick={() => handleSharePDF(targetPhone)}
                  disabled={isGeneratingPdf}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer border border-emerald-600/60 text-xs whitespace-nowrap disabled:opacity-50"
                  title="Share actual PDF file using Android/iOS system share picker"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Attach PDF File (OS Picker)</span>
                </button>

                {/* Direct SMS Option */}
                <button
                  type="button"
                  onClick={handleDirectSms}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3 py-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-amber-500/40 text-xs whitespace-nowrap"
                  title="Send SMS notification"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>SMS</span>
                </button>
              </div>
            </div>

            {shareSuccess && (
              <div className="p-2.5 bg-emerald-950 border border-emerald-500 rounded-xl text-xs text-emerald-300 font-mono font-bold flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>
                  WhatsApp direct chat opened for +91{' '}
                  {targetPhone.replace(/\D/g, '').slice(-10)} with "Thank you for buying! Visit again!" message!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

