// Indian Numbering system to Words converter
export function numberToWordsIndian(num: number): string {
  if (isNaN(num) || num <= 0) return 'Zero Rupees Only';

  const amount = Math.floor(num);
  const paise = Math.round((num - amount) * 100);

  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertGroup(n: number): string {
    if (n < 20) return a[n];
    const tens = b[Math.floor(n / 10)];
    const ones = a[n % 10];
    return tens + (ones ? ' ' + ones : '');
  }

  function convertHundreds(n: number): string {
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      str += convertGroup(n);
    }
    return str.trim();
  }

  let words = '';

  const crore = Math.floor(amount / 10000000);
  let remainder = amount % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  if (crore > 0) {
    words += convertHundreds(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertHundreds(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertHundreds(thousand) + ' Thousand ';
  }
  if (remainder > 0) {
    words += convertHundreds(remainder);
  }

  let result = words.trim() + ' Rupees';

  if (paise > 0) {
    result += ' and ' + convertGroup(paise) + ' Paise';
  }

  return result + ' Only';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

export function generateUpiUrl(
  upiId: string,
  payeeName: string,
  amount: number,
  invoiceNo: string
): string {
  const cleanUpi = encodeURIComponent(upiId.trim());
  const cleanName = encodeURIComponent(payeeName.trim());
  const note = encodeURIComponent(`Bill ${invoiceNo} - Sai Clothes Railway`);
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${amount.toFixed(
    2
  )}&cu=INR&tn=${note}`;
}

export function generateQrCodeUrl(upiUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    upiUrl
  )}&color=0f172a&bgcolor=ffffff`;
}

export function calculateItemDiscount(mrp: number, sellingPrice: number, qty: number) {
  const safeMRP = Math.max(0, mrp || 0);
  const safeSP = Math.max(0, sellingPrice || 0);
  const safeQty = Math.max(1, qty || 1);

  const unitDiscount = Math.max(0, safeMRP - safeSP);
  const discountAmount = unitDiscount * safeQty;
  const discountPercent = safeMRP > 0 ? (unitDiscount / safeMRP) * 100 : 0;
  const total = safeSP * safeQty;

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountPercent: Math.round(discountPercent * 10) / 10,
    total: Math.round(total * 100) / 100,
  };
}
