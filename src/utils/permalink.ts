import { Invoice } from '../types';

/**
 * Ensures protocol is strictly https:// and converts dev server URLs to public preview URLs
 * so mobile users on WhatsApp never encounter 403 Forbidden or HTTP security warnings.
 */
function getPublicOrigin(): string {
  let origin = window.location.origin;
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  }
  if (origin.startsWith('http://')) {
    origin = origin.replace('http://', 'https://');
  } else if (!origin.startsWith('https://')) {
    origin = `https://${origin}`;
  }
  return origin;
}

/**
 * Encodes data into URL-Safe Base64 (replaces + with -, / with _, and trims trailing =).
 * Prevents URL parameter truncation in WhatsApp messages.
 */
function toUrlSafeBase64(str: string): string {
  try {
    const base64 = btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return encodeURIComponent(str);
  }
}

/**
 * Decodes URL-Safe Base64 string back to original UTF-8 string.
 */
function fromUrlSafeBase64(str: string): string {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(base64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return decodeURIComponent(str);
  }
}

/**
 * Compresses an invoice into a minified, high-density JSON array
 * to keep WhatsApp permalink URLs short (< 150 characters).
 */
function compressInvoice(invoice: Invoice): string {
  const compactArray = [
    invoice.invoiceNumber,
    invoice.date,
    invoice.time || '',
    [invoice.customer.name || '', invoice.customer.phone || '', invoice.customer.address || ''],
    invoice.items.map((it) => [
      it.name,
      it.size || '',
      it.sellingPrice,
      it.quantity,
      it.mrp || it.sellingPrice,
      it.category || '',
    ]),
    [
      invoice.subtotalMRP || 0,
      invoice.subtotalSP || 0,
      invoice.itemDiscountTotal || 0,
      invoice.additionalDiscount || 0,
      invoice.gstAmount || 0,
      invoice.roundOff || 0,
      invoice.grandTotal || 0,
      invoice.dueAmount || 0,
      invoice.amountPaid || 0,
    ],
    invoice.paymentMode || 'Cash',
    invoice.isGstInvoice ? 1 : 0,
    invoice.notes || '',
  ];
  return JSON.stringify(compactArray);
}

/**
 * Reconstructs a full Invoice object from compact array format or legacy full JSON format.
 */
function decompressInvoice(data: any): Invoice {
  if (data && typeof data === 'object' && !Array.isArray(data) && data.invoiceNumber) {
    return data as Invoice;
  }

  if (Array.isArray(data)) {
    const [invNum, date, time, cust, itemsArr, totals, paymentMode, isGst, notes] = data;
    const items = (itemsArr || []).map((it: any, index: number) => {
      const name = it[0] || 'Item';
      const size = it[1] || '';
      const sellingPrice = Number(it[2]) || 0;
      const quantity = Number(it[3]) || 1;
      const mrp = Number(it[4]) || sellingPrice;
      const category = it[5] || '';
      const total = sellingPrice * quantity;
      const discountAmount = Math.max(0, (mrp - sellingPrice) * quantity);
      const discountPercent = mrp > 0 ? ((mrp - sellingPrice) / mrp) * 100 : 0;

      return {
        id: `item-${index}`,
        name,
        size,
        sellingPrice,
        quantity,
        mrp,
        category,
        total,
        discountAmount,
        discountPercent,
      };
    });

    const [
      subtotalMRP,
      subtotalSP,
      itemDiscountTotal,
      additionalDiscount,
      gstAmount,
      roundOff,
      grandTotal,
      dueAmount,
      amountPaid,
    ] = totals || [];

    return {
      id: `inv-${invNum}`,
      invoiceNumber: invNum,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '',
      customer: {
        name: cust?.[0] || 'Valued Customer',
        phone: cust?.[1] || '',
        address: cust?.[2] || '',
      },
      items,
      subtotalMRP: Number(subtotalMRP) || 0,
      subtotalSP: Number(subtotalSP) || 0,
      itemDiscountTotal: Number(itemDiscountTotal) || 0,
      additionalDiscount: Number(additionalDiscount) || 0,
      gstRate: 0,
      gstAmount: Number(gstAmount) || 0,
      roundOff: Number(roundOff) || 0,
      grandTotal: Number(grandTotal) || 0,
      dueAmount: Number(dueAmount) || 0,
      amountPaid: Number(amountPaid) || 0,
      paymentMode: paymentMode || 'Cash',
      isGstInvoice: Boolean(isGst),
      status: Number(dueAmount) > 0 ? (Number(amountPaid) > 0 ? 'Partial' : 'Unpaid') : 'Paid',
      createdAt: new Date().toISOString(),
      notes: notes || '',
    };
  }

  throw new Error('Invalid compressed invoice structure');
}

/**
 * Creates a permanent, ultra-compact public link for an invoice.
 */
export function createInvoicePermalink(invoice: Invoice): string {
  try {
    const compressedStr = compressInvoice(invoice);
    const encoded = toUrlSafeBase64(compressedStr);
    const origin = getPublicOrigin();
    return `${origin}/?bill=${encodeURIComponent(invoice.invoiceNumber)}&inv=${encoded}`;
  } catch (e) {
    console.error('Error generating compact permalink:', e);
    const origin = getPublicOrigin();
    return `${origin}/?bill=${encodeURIComponent(invoice.invoiceNumber)}`;
  }
}

/**
 * Parses the permanent link parameters from the current URL location.
 */
export function parseInvoiceFromUrl(): { invoice: Invoice | null; billNumber: string | null } {
  try {
    const params = new URLSearchParams(window.location.search);
    const billNumber = params.get('bill');
    const invData = params.get('inv');

    if (invData) {
      const jsonStr = fromUrlSafeBase64(invData);
      const rawData = JSON.parse(jsonStr);
      const invoice = decompressInvoice(rawData);
      return { invoice, billNumber: billNumber || invoice.invoiceNumber };
    }

    return { invoice: null, billNumber };
  } catch (e) {
    console.error('Error parsing permalink:', e);
    const params = new URLSearchParams(window.location.search);
    return { invoice: null, billNumber: params.get('bill') };
  }
}

