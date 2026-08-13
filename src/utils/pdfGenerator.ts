import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

/**
 * Fallback parser for converting oklch(L C H [/ A]) to rgb()/rgba() strings.
 */
function oklchToRgbFallback(oklchStr: string): string {
  try {
    const cleanStr = oklchStr.replace(/none/gi, '0');
    const match = cleanStr.match(
      /oklch\(\s*([0-9.%+-]+)(?:deg)?\s+([0-9.%+-]+)\s+([0-9.%+-]+)(?:deg)?(?:\s*\/\s*([0-9.%+-]+))?\s*\)/i
    );
    if (!match) return 'rgb(0, 0, 0)';

    let l = parseFloat(match[1]) || 0;
    if (match[1].endsWith('%')) l /= 100;

    let c = parseFloat(match[2]) || 0;
    if (match[2].endsWith('%')) c /= 100;

    let h = parseFloat(match[3]) || 0;

    let alpha = 1;
    if (match[4] !== undefined) {
      alpha = parseFloat(match[4]);
      if (isNaN(alpha)) alpha = 1;
      else if (match[4].endsWith('%')) alpha /= 100;
    }

    const hRad = (h * Math.PI) / 180;
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    const l_ = Math.pow(l + 0.3963377774 * a + 0.2158037573 * b, 3);
    const m_ = Math.pow(l - 0.1055613458 * a - 0.0638541728 * b, 3);
    const s_ = Math.pow(l - 0.0894841775 * a - 1.2914855480 * b, 3);

    const rL = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
    const gL = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
    const bL = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;

    const toSrgb = (val: number) => {
      if (isNaN(val)) return 0;
      const clamped = val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(Math.max(0, val), 1 / 2.4) - 0.055;
      return Math.max(0, Math.min(255, Math.round(clamped * 255)));
    };

    const r = toSrgb(rL);
    const g = toSrgb(gL);
    const bVal = toSrgb(bL);

    if (alpha < 1) {
      return `rgba(${r}, ${g}, ${bVal}, ${alpha})`;
    }
    return `rgb(${r}, ${g}, ${bVal})`;
  } catch {
    return 'rgb(0, 0, 0)';
  }
}

const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const ctx = canvas ? canvas.getContext('2d') : null;

/**
 * Converts all oklch(...) occurrences in a CSS string to rgb()/rgba() format.
 */
export const convertOklchToRgbInCss = (cssText: string): string => {
  if (!cssText || !cssText.includes('oklch')) return cssText;

  return cssText.replace(/oklch\([^)]+\)/gi, (match) => {
    if (ctx) {
      try {
        ctx.fillStyle = '#010203';
        ctx.fillStyle = match;
        const resolved = ctx.fillStyle;
        if (resolved && resolved !== '#010203' && resolved !== match) {
          return resolved;
        }
      } catch {
        // Fall back
      }
    }
    return oklchToRgbFallback(match);
  });
};

/**
 * Completely sanitizes all stylesheets, style tags, and inline styles in a Document
 * to remove oklch color references before html2canvas parses them.
 */
export const sanitizeDocumentStyles = (doc: Document) => {
  if (!doc) return;

  // 1. Convert inline style attributes on all elements
  try {
    const styledEls = Array.from(doc.querySelectorAll('[style*="oklch"]'));
    styledEls.forEach((el) => {
      const styleAttr = el.getAttribute('style');
      if (styleAttr) {
        el.setAttribute('style', convertOklchToRgbInCss(styleAttr));
      }
    });
  } catch (e) {
    console.warn('Error sanitizing inline styles:', e);
  }

  // 2. Convert all <style> elements (both text content and sheet rules)
  try {
    const styleEls = Array.from(doc.querySelectorAll('style'));
    styleEls.forEach((styleEl) => {
      let cssText = styleEl.textContent || styleEl.innerHTML || '';

      // If textContent was empty because rules were inserted dynamically into sheet.cssRules
      if (!cssText || !cssText.includes('oklch')) {
        if (styleEl.sheet) {
          try {
            const rules = Array.from(styleEl.sheet.cssRules || []);
            const extracted = rules.map((r) => r.cssText).join('\n');
            if (extracted.includes('oklch')) {
              cssText = extracted;
            }
          } catch {
            // ignore
          }
        }
      }

      if (cssText && cssText.includes('oklch')) {
        const sanitized = convertOklchToRgbInCss(cssText);
        styleEl.textContent = sanitized;
        styleEl.innerHTML = sanitized;
      }
    });
  } catch (e) {
    console.warn('Error sanitizing style tags:', e);
  }

  // 3. Process doc.styleSheets (including external and linked stylesheets)
  try {
    const sheets = Array.from(doc.styleSheets);
    sheets.forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        let hasOklch = false;
        const sanitizedRules: string[] = [];

        for (const rule of rules) {
          const ruleCss = rule.cssText;
          if (ruleCss && ruleCss.includes('oklch')) {
            hasOklch = true;
            sanitizedRules.push(convertOklchToRgbInCss(ruleCss));
          } else if (ruleCss) {
            sanitizedRules.push(ruleCss);
          }
        }

        if (hasOklch) {
          // Add a new style element with sanitized rules
          const replacement = doc.createElement('style');
          replacement.textContent = sanitizedRules.join('\n');
          doc.head.appendChild(replacement);

          // Clear or remove the old stylesheet node if possible
          if (sheet.ownerNode && sheet.ownerNode.parentNode) {
            sheet.ownerNode.parentNode.removeChild(sheet.ownerNode);
          }
        }
      } catch {
        // Cross-origin rules or security restrictions
      }
    });
  } catch (e) {
    console.warn('Error sanitizing document stylesheets:', e);
  }
};

/**
 * Creates a jsPDF instance from a DOM element.
 */
export const createInvoicePDFDoc = async (elementId: string): Promise<jsPDF | null> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for PDF export.`);
    return null;
  }

  // Sanitize the current window document before capturing
  sanitizeDocumentStyles(document);

  // Capture DOM element using html2canvas with oklch sanitize handler
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution for sharp text & barcode/QR code
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    onclone: (clonedDoc: Document) => {
      sanitizeDocumentStyles(clonedDoc);

      const win = clonedDoc.defaultView;
      if (win && win.getComputedStyle) {
        const origGetComputedStyle = win.getComputedStyle.bind(win);
        win.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
          const style = origGetComputedStyle(elt, pseudoElt);
          return new Proxy(style, {
            get(target, prop, receiver) {
              if (prop === 'getPropertyValue') {
                return function (propertyName: string) {
                  const val = target.getPropertyValue(propertyName);
                  if (val && typeof val === 'string' && val.includes('oklch')) {
                    return convertOklchToRgbInCss(val);
                  }
                  return val;
                };
              }
              const val = Reflect.get(target, prop, receiver);
              if (typeof val === 'string' && val.includes('oklch')) {
                return convertOklchToRgbInCss(val);
              }
              return val;
            },
          });
        };
      }
    },
  });

  const imgData = canvas.toDataURL('image/png');

  if (elementId.includes('thermal')) {
    // Thermal 80mm roll PDF configuration
    const mmWidth = 80;
    const mmHeight = (canvas.height * mmWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [mmWidth, Math.max(mmHeight, 100)],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight);
    return pdf;
  } else {
    // Standard A4 PDF configuration (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // Multi-page handling if invoice is unusually long
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }

    return pdf;
  }
};

/**
 * Downloads a DOM element as a high-quality PDF invoice.
 */
export const downloadInvoicePDF = async (
  elementId: string,
  fileName: string = 'Sai_Clothes_Invoice.pdf'
): Promise<boolean> => {
  try {
    const pdf = await createInvoicePDFDoc(elementId);
    if (!pdf) return false;
    pdf.save(fileName);
    return true;
  } catch (err) {
    console.error('Failed to generate invoice PDF:', err);
    return false;
  }
};

/**
 * Generates a File object containing the PDF for sharing via Web Share API or download.
 */
export const generateInvoicePDFFile = async (
  elementId: string,
  fileName: string = 'Sai_Clothes_Invoice.pdf'
): Promise<File | null> => {
  try {
    const pdf = await createInvoicePDFDoc(elementId);
    if (!pdf) return null;
    const blob = pdf.output('blob');
    return new File([blob], fileName, { type: 'application/pdf' });
  } catch (err) {
    console.error('Failed to create PDF File object:', err);
    return null;
  }
};

/**
 * Shares actual PDF File via Native Web Share API (WhatsApp/System Share)
 * or falls back to downloading the PDF file and opening WhatsApp.
 */
export const shareInvoicePDF = async ({
  elementId,
  fileName,
  title,
  text,
  phone,
}: {
  elementId: string;
  fileName: string;
  title: string;
  text: string;
  phone?: string;
}): Promise<{ sharedNative: boolean; downloaded: boolean; error?: string }> => {
  try {
    const file = await generateInvoicePDFFile(elementId, fileName);
    if (!file) {
      return { sharedNative: false, downloaded: false, error: 'Could not render PDF document.' };
    }

    // Check if browser supports sharing PDF files natively via Web Share API
    if (
      navigator.canShare &&
      navigator.canShare({ files: [file] }) &&
      navigator.share
    ) {
      try {
        await navigator.share({
          files: [file],
          title,
          text,
        });
        return { sharedNative: true, downloaded: false };
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User canceled native share dialog
          return { sharedNative: false, downloaded: false };
        }
        console.warn('Native Web Share declined or unsupported, using fallback:', err);
      }
    }

    // Fallback for browsers/devices where navigator.share for files is blocked/unsupported:
    // 1. Download the PDF file directly to device
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 2. Open WhatsApp Web / App with prefilled bill summary text
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(waUrl, '_blank');

    return { sharedNative: false, downloaded: true };
  } catch (err: any) {
    console.error('Error in shareInvoicePDF:', err);
    return { sharedNative: false, downloaded: false, error: err?.message || 'Failed to share PDF' };
  }
};

