import React from 'react';
import { Invoice, ShopSettings } from '../types';
import { formatCurrency, generateUpiUrl, generateQrCodeUrl } from '../utils/calculator';

interface Props {
  invoice: Invoice;
  shop: ShopSettings;
}

export const InvoicePreviewThermal: React.FC<Props> = ({ invoice, shop }) => {
  const upiUrl = generateUpiUrl(
    shop.upiId,
    shop.upiName || shop.shopName,
    invoice.dueAmount > 0 ? invoice.dueAmount : invoice.grandTotal,
    invoice.invoiceNumber
  );
  const qrCodeUrl = generateQrCodeUrl(upiUrl);

  const totalDiscount = invoice.itemDiscountTotal + invoice.additionalDiscount;

  return (
    <div
      id="printable-invoice-thermal"
      className="w-[80mm] mx-auto bg-white text-black p-4 shadow-md border border-slate-300 font-mono text-[11px] leading-tight print:shadow-none print:border-none print:p-0 print:m-0 print:w-[80mm]"
    >
      {/* Shop Header */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <h2 className="text-base font-black uppercase tracking-wider">
          {shop.shopName}
        </h2>
        <p className="text-[10px] italic">{shop.tagline}</p>
        <p className="text-[10px] mt-1">{shop.addressLine1}</p>
        <p className="text-[10px]">{shop.cityStatePincode}</p>
        <p className="text-[10px] font-bold mt-0.5">Ph: {shop.phonePrimary}</p>
        {shop.gstin && <p className="text-[10px]">GSTIN: {shop.gstin}</p>}
      </div>

      {/* Bill Meta */}
      <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
        <div className="flex justify-between">
          <span>Bill No: <strong>{invoice.invoiceNumber}</strong></span>
          <span>{invoice.date}</span>
        </div>
        <div className="flex justify-between">
          <span>Cust: {invoice.customer.name || 'Walk-in'}</span>
          <span>{invoice.time}</span>
        </div>
        {invoice.customer.phone && <div>Ph: +91 {invoice.customer.phone}</div>}
        <div className="flex justify-between font-bold pt-1">
          <span>Pay Mode: {invoice.paymentMode}</span>
          <span>Status: PAID</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-2 border-b border-dashed border-black">
        <div className="flex justify-between font-bold border-b border-black pb-1 mb-1">
          <span className="w-1/2">ITEM</span>
          <span className="w-1/6 text-center">QTY</span>
          <span className="w-1/3 text-right">AMT</span>
        </div>

        {invoice.items.map((item, idx) => {
          const itemSavings = (item.mrp - item.sellingPrice) * item.quantity;
          return (
            <div key={item.id || idx} className="py-1">
              <div className="font-bold uppercase text-[10.5px]">
                {item.name} {item.size ? `(${item.size})` : ''}
              </div>
              <div className="flex justify-between text-[10px] text-slate-700">
                <span>
                  MRP ₹{item.mrp} → Rate ₹{item.sellingPrice}
                </span>
                <span className="font-bold">x {item.quantity}</span>
                <span className="font-bold text-black">{formatCurrency(item.total)}</span>
              </div>
              {itemSavings > 0 && (
                <div className="text-[9px] text-slate-600 italic">
                  Saved ₹{itemSavings} ({item.discountPercent}% OFF)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="py-2 border-b border-dashed border-black space-y-1">
        <div className="flex justify-between text-slate-600">
          <span>Total MRP:</span>
          <span>{formatCurrency(invoice.subtotalMRP)}</span>
        </div>

        {totalDiscount > 0 && (
          <div className="flex justify-between font-bold">
            <span>You Saved:</span>
            <span>- {formatCurrency(totalDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-800">
          <span>Subtotal:</span>
          <span>{formatCurrency(invoice.subtotalSP)}</span>
        </div>

        {invoice.isGstInvoice && invoice.gstAmount > 0 && (
          <div className="flex justify-between text-[10px]">
            <span>GST ({invoice.gstRate}%):</span>
            <span>{formatCurrency(invoice.gstAmount)}</span>
          </div>
        )}

        <div className="flex justify-between font-black text-sm border-t border-black pt-1">
          <span>TOTAL:</span>
          <span>{formatCurrency(invoice.grandTotal)}</span>
        </div>

        <div className="flex justify-between text-[10px] pt-1 font-bold">
          <span>Amount Paid ({invoice.paymentMode}):</span>
          <span>{formatCurrency(invoice.grandTotal)}</span>
        </div>
      </div>

      {/* QR Code */}
      {shop.upiId && (
        <div className="text-center py-2 border-b border-dashed border-black flex flex-col items-center">
          <p className="text-[9px] font-bold mb-1">SCAN & PAY VIA UPI</p>
          <img src={qrCodeUrl} alt="UPI QR" className="w-24 h-24 border border-black p-0.5" />
          <p className="text-[9px] font-mono mt-1">{shop.upiId}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-2 text-[9px] space-y-1">
        <p className="font-bold">*** THANK YOU ***</p>
        <p>Exchange within 7 days with bill.</p>
        <p className="italic text-[8px]">Sai Clothes Railway - Quality Guaranteed</p>
      </div>
    </div>
  );
};
