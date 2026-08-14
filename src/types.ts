export interface InvoiceItem {
  id: string;
  name: string;
  category?: string;
  size?: string;
  hsnCode?: string;
  mrp: number; // Maximum Retail Price
  sellingPrice: number; // Selling Price
  quantity: number;
  // Calculated fields
  discountAmount: number; // (mrp - sellingPrice) * quantity
  discountPercent: number; // ((mrp - sellingPrice) / mrp) * 100
  total: number; // sellingPrice * quantity
}

export type PaymentMode = 'Cash' | 'UPI' | 'Card';

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string;
  gstin?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string; // YYYY-MM-DD
  time: string;
  customer: CustomerInfo;
  items: InvoiceItem[];
  subtotalMRP: number;
  subtotalSP: number;
  itemDiscountTotal: number;
  additionalDiscount: number; // Extra flat discount
  gstRate: number; // 0, 5, 12, etc.
  gstAmount: number;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  dueAmount: number;
  paymentMode: PaymentMode;
  notes?: string;
  isGstInvoice: boolean;
  status: 'Paid';
  createdAt: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  cityStatePincode: string;
  phonePrimary: string;
  phoneSecondary: string;
  email: string;
  gstin: string;
  upiId: string;
  upiName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  terms: string[];
  authorizedSignatoryText: string;
  showMRPOnBill: boolean;
  showDiscountBadge: boolean;
  defaultGstRate: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
}

export interface QuickProduct {
  id: string;
  name: string;
  category: string;
  size: string;
  mrp: number;
  sellingPrice: number;
  hsnCode: string;
}

export interface UdharRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  invoiceNumber: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  lastPaymentDate?: string;
}
