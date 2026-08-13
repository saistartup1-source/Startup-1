import { Invoice } from '../types';
import { generateInvoicePDFFile } from './pdfGenerator';

export interface UploadResult {
  success: boolean;
  pdfUrl?: string;
  billWebUrl?: string;
  filename?: string;
  error?: string;
}

/**
 * 1. Generates invoice_123.pdf from DOM printable element
 * 2. Uploads PDF and JSON to server storage (/api/bills/upload)
 * 3. Returns the hosted PDF link and public bill URL
 */
export async function uploadInvoicePdfToStorage(
  invoice: Invoice,
  elementId: string = 'printable-invoice-a4'
): Promise<UploadResult> {
  try {
    const fileName = `invoice_${invoice.invoiceNumber}.pdf`;
    const file = await generateInvoicePDFFile(elementId, fileName);

    let pdfBase64 = '';
    if (file) {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      pdfBase64 = 'data:application/pdf;base64,' + btoa(binary);
    }

    const response = await fetch('/api/bills/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceNumber: invoice.invoiceNumber,
        pdfBase64,
        invoiceData: invoice,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Upload failed: ${errText}` };
    }

    const data = await response.json();
    return {
      success: true,
      pdfUrl: data.pdfUrl,
      billWebUrl: data.billWebUrl,
      filename: data.filename,
    };
  } catch (err: any) {
    console.error('Error in uploadInvoicePdfToStorage:', err);
    return { success: false, error: err?.message || 'Failed to upload PDF' };
  }
}
