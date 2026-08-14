import React from 'react';
import { Invoice, ShopSettings } from '../types';
import { formatCurrency, numberToWordsIndian, generateUpiUrl, generateQrCodeUrl } from '../utils/calculator';
import { QrCode, Phone, MapPin, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  invoice: Invoice;
  shop: ShopSettings;
}

export const InvoicePreviewA4: React.FC<Props> = ({ invoice, shop }) => {
  const upiUrl = generateUpiUrl(
    shop.upiId,
    shop.upiName || shop.shopName,
    invoice.dueAmount > 0 ? invoice.dueAmount : invoice.grandTotal,
    invoice.invoiceNumber
  );
  const qrCodeUrl = generateQrCodeUrl(upiUrl);

  const cgstAmount = invoice.gstAmount / 2;
  const sgstAmount = invoice.gstAmount / 2;

  const totalDiscount = invoice.itemDiscountTotal + invoice.additionalDiscount;

  return (
    <div
      id="printable-invoice-a4"
      className="w-full max-w-4xl mx-auto bg-white text-slate-800 p-6 md:p-10 shadow-xl border border-slate-200 rounded-xl print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none font-sans text-sm"
    >
      {/* Header Section */}
      <div className="border-b-2 border-amber-500 pb-5 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-bold mb-2 uppercase tracking-wide print:hidden">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              {invoice.isGstInvoice ? 'Tax Invoice' : 'Retail Bill / Receipt'}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
              {shop.shopName}
            </h1>
            <p className="text-amber-700 font-medium text-xs md:text-sm italic">
              {shop.tagline}
            </p>
          </div>

          <div className="text-left md:text-right text-xs text-slate-600 space-y-1">
            <div className="flex items-center md:justify-end gap-1.5 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{shop.addressLine1}, {shop.addressLine2}</span>
            </div>
            <p className="pl-5 md:pl-0">{shop.cityStatePincode}</p>
            <div className="flex items-center md:justify-end gap-1.5 font-medium text-slate-800">
              <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{shop.phonePrimary} {shop.phoneSecondary ? `/ ${shop.phoneSecondary}` : ''}</span>
            </div>
            {shop.gstin && (
              <p className="font-semibold text-slate-900 pt-0.5">
                GSTIN: <span className="font-mono text-amber-800">{shop.gstin}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Meta & Customer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-xs">
        <div>
          <h3 className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-2">
            Billed To (Customer Details)
          </h3>
          <p className="text-base font-bold text-slate-900">
            {invoice.customer.name || 'Walk-in Customer'}
          </p>
          {invoice.customer.phone && (
            <p className="text-slate-600 font-mono mt-0.5">
              Phone: +91 {invoice.customer.phone}
            </p>
          )}
          {invoice.customer.address && (
            <p className="text-slate-600 mt-0.5">{invoice.customer.address}</p>
          )}
          {invoice.customer.gstin && (
            <p className="text-slate-700 font-medium mt-1">
              GSTIN: <span className="font-mono">{invoice.customer.gstin}</span>
            </p>
          )}
        </div>

        <div className="md:text-right space-y-1 border-t md:border-t-0 border-slate-200 pt-3 md:pt-0">
          <div className="flex md:justify-end items-center gap-2">
            <span className="text-slate-500 font-medium">Invoice No:</span>
            <span className="font-mono font-bold text-slate-900 text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex md:justify-end items-center gap-2">
            <span className="text-slate-500">Date & Time:</span>
            <span className="font-medium text-slate-800">
              {invoice.date} {invoice.time ? `| ${invoice.time}` : ''}
            </span>
          </div>
          <div className="flex md:justify-end items-center gap-2">
            <span className="text-slate-500">Payment Mode:</span>
            <span className="font-semibold text-slate-800 bg-slate-200 px-2 py-0.5 rounded text-[11px]">
              {invoice.paymentMode}
            </span>
          </div>
          <div className="flex md:justify-end items-center gap-2 pt-1">
            <span className="text-slate-500">Payment Status:</span>
            <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300">
              PAID
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th className="py-2.5 px-3 rounded-l-md text-center w-10">#</th>
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-3 text-center">Size</th>
              {invoice.isGstInvoice && <th className="py-2.5 px-3 text-center">HSN</th>}
              <th className="py-2.5 px-3 text-right">MRP (₹)</th>
              <th className="py-2.5 px-3 text-right">Rate (₹)</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Discount</th>
              <th className="py-2.5 px-3 text-right rounded-r-md">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 border-b border-slate-200">
            {invoice.items.map((item, index) => {
              const itemTotalMRP = item.mrp * item.quantity;
              const itemTotalSP = item.sellingPrice * item.quantity;
              const itemSavings = itemTotalMRP - itemTotalSP;

              return (
                <tr key={item.id || index} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 text-center text-slate-500 font-mono">
                    {index + 1}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{item.name}</p>
                    {item.category && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                        {item.category}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 font-medium">
                    {item.size || '—'}
                  </td>
                  {invoice.isGstInvoice && (
                    <td className="py-3 px-3 text-center font-mono text-slate-600">
                      {item.hsnCode || '6204'}
                    </td>
                  )}
                  <td className="py-3 px-3 text-right font-mono text-slate-500 line-through">
                    {formatCurrency(item.mrp)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(item.sellingPrice)}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700 font-medium">
                    {itemSavings > 0 ? (
                      <div>
                        <span className="block font-bold">- {formatCurrency(itemSavings)}</span>
                        <span className="text-[10px] text-emerald-600 font-sans bg-emerald-50 px-1 py-0.2 rounded">
                          ({item.discountPercent}% OFF)
                        </span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Customer Savings Highlight Banner */}
      {totalDiscount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6 flex items-center justify-between text-emerald-900 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              YOU SAVED A TOTAL OF{' '}
              <strong className="text-emerald-700 text-sm font-extrabold font-mono">
                {formatCurrency(totalDiscount)}
              </strong>{' '}
              ON THIS PURCHASE!
            </span>
          </div>
          <span className="hidden sm:inline bg-emerald-200 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
            Sai Clothes Best Rate Guarantee
          </span>
        </div>
      )}

      {/* Calculations & Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        {/* Left Side: QR Code, Bank Details & Notes */}
        <div className="md:col-span-7 space-y-4">
          {/* Amount in Words */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium block text-[10px] uppercase">
              Amount in Words:
            </span>
            <p className="font-bold text-slate-900 italic mt-0.5">
              {numberToWordsIndian(invoice.grandTotal)}
            </p>
          </div>

          {/* UPI Scan & Pay Box */}
          {shop.upiId && (
            <div className="flex items-center gap-4 bg-amber-50/80 border border-amber-200 p-3 rounded-lg text-xs">
              <img
                src={qrCodeUrl}
                alt="UPI QR Code"
                className="w-20 h-20 bg-white p-1 rounded border border-amber-300 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-1 font-bold text-amber-900">
                  <QrCode className="w-3.5 h-3.5 text-amber-700" />
                  <span>Scan QR Code to Pay via UPI</span>
                </div>
                <p className="text-[11px] text-slate-700">
                  GPay / PhonePe / Paytm / BHIM
                </p>
                <p className="font-mono text-[11px] text-amber-900 font-semibold">
                  UPI ID: {shop.upiId}
                </p>
                <p className="text-[10px] text-slate-500">
                  Amount to Pay:{' '}
                  <strong className="text-slate-900 font-mono">
                    {formatCurrency(invoice.dueAmount > 0 ? invoice.dueAmount : invoice.grandTotal)}
                  </strong>
                </p>
              </div>
            </div>
          )}

          {/* Bank Info */}
          {shop.accountNumber && (
            <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Bank Name</span>
                <span className="font-semibold text-slate-800">{shop.bankName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Account No.</span>
                <span className="font-mono font-bold text-slate-800">{shop.accountNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">IFSC Code</span>
                <span className="font-mono text-slate-800">{shop.ifscCode}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Totals Breakdown Table */}
        <div className="md:col-span-5 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Total Value (at MRP):</span>
            <span className="font-mono text-slate-500 line-through">
              {formatCurrency(invoice.subtotalMRP)}
            </span>
          </div>

          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Item Discount Savings:</span>
            <span className="font-mono font-bold">
              - {formatCurrency(invoice.itemDiscountTotal)}
            </span>
          </div>

          <div className="flex justify-between text-slate-800 font-semibold border-t border-slate-200 pt-2">
            <span>Subtotal (Selling Price):</span>
            <span className="font-mono">{formatCurrency(invoice.subtotalSP)}</span>
          </div>

          {invoice.additionalDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Extra Special Discount:</span>
              <span className="font-mono font-bold">
                - {formatCurrency(invoice.additionalDiscount)}
              </span>
            </div>
          )}

          {invoice.isGstInvoice && invoice.gstAmount > 0 && (
            <>
              <div className="flex justify-between text-slate-600">
                <span>CGST ({invoice.gstRate / 2}%):</span>
                <span className="font-mono">{formatCurrency(cgstAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST ({invoice.gstRate / 2}%):</span>
                <span className="font-mono">{formatCurrency(sgstAmount)}</span>
              </div>
            </>
          )}

          {invoice.roundOff !== 0 && (
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Round Off:</span>
              <span className="font-mono">
                {invoice.roundOff > 0 ? `+${invoice.roundOff}` : invoice.roundOff}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-900 font-extrabold text-base border-t-2 border-slate-900 pt-2 mt-2">
            <span>GRAND TOTAL:</span>
            <span className="font-mono text-lg text-amber-900">
              {formatCurrency(invoice.grandTotal)}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-2 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-700 font-bold">
              <span>Amount Received ({invoice.paymentMode}):</span>
              <span className="font-mono text-emerald-700">
                {formatCurrency(invoice.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Terms & Authorized Signature */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 pt-5 mt-4 text-[11px] text-slate-600">
        <div>
          <h4 className="font-bold text-slate-900 uppercase text-[10px] mb-1">
            Terms & Conditions
          </h4>
          <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[10px]">
            {shop.terms.map((term, i) => (
              <li key={i}>{term}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between items-start md:items-end text-left md:text-right pt-4 md:pt-0">
          <div className="mb-8">
            <p className="font-extrabold text-slate-900 uppercase text-xs">
              {shop.authorizedSignatoryText}
            </p>
            <p className="text-[10px] text-slate-400">Sai Clothes Railway Authorized Stamp</p>
          </div>

          <div className="border-t-2 border-dashed border-slate-400 pt-1 w-48 text-center">
            <p className="font-semibold text-slate-800 text-xs italic">
              Authorized Signature
            </p>
          </div>
        </div>
      </div>

      {/* Very bottom message */}
      <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3 mt-6">
        Thank you for visiting Sai Clothes Railway! Have a wonderful day ahead!
      </div>
    </div>
  );
};
