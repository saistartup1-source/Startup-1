import React, { useState, useEffect } from 'react';
import { Invoice, ShopSettings, QuickProduct } from './types';
import {
  defaultShopSettings,
  defaultQuickProducts,
  sampleInvoices,
} from './data/defaultData';
import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceHistory } from './components/InvoiceHistory';
import { QuickCatalogManager } from './components/QuickCatalogManager';
import { InvoiceModal } from './components/InvoiceModal';
import { PublicBillView } from './components/PublicBillView';
import { BottomNavBar } from './components/BottomNavBar';
import { parseInvoiceFromUrl } from './utils/permalink';

export default function App() {
  // LocalStorage initialization with safety
  const [shop, setShop] = useState<ShopSettings>(() => {
    try {
      const saved = localStorage.getItem('sai_clothes_shop_settings');
      return saved ? JSON.parse(saved) : defaultShopSettings;
    } catch {
      return defaultShopSettings;
    }
  });

  const [quickProducts, setQuickProducts] = useState<QuickProduct[]>(() => {
    try {
      const saved = localStorage.getItem('sai_clothes_quick_products');
      return saved ? JSON.parse(saved) : defaultQuickProducts;
    } catch {
      return defaultQuickProducts;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('sai_clothes_invoices');
      return saved ? JSON.parse(saved) : sampleInvoices;
    } catch {
      return sampleInvoices;
    }
  });

  // Mini Militia Theme Mode (Default true as requested)
  const [isMiniMilitiaTheme, setIsMiniMilitiaTheme] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sai_clothes_militia_theme');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // UI state: Only 'new' | 'history' | 'catalog'
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'catalog'>('new');

  const [activeInvoiceForModal, setActiveInvoiceForModal] = useState<{
    invoice: Invoice;
    mode: 'a4' | 'thermal';
    autoSharePdf?: boolean;
  } | null>(null);

  // Public Permalink View State
  const [publicInvoice, setPublicInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const { invoice, billNumber } = parseInvoiceFromUrl();
    if (invoice) {
      setPublicInvoice(invoice);
    } else if (billNumber) {
      const matched = invoices.find((i) => i.invoiceNumber.toLowerCase() === billNumber.toLowerCase());
      if (matched) {
        setPublicInvoice(matched);
      }
    }
  }, [invoices]);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('sai_clothes_shop_settings', JSON.stringify(shop));
    } catch (e) {
      console.error(e);
    }
  }, [shop]);

  useEffect(() => {
    try {
      localStorage.setItem('sai_clothes_quick_products', JSON.stringify(quickProducts));
    } catch (e) {
      console.error(e);
    }
  }, [quickProducts]);

  useEffect(() => {
    try {
      localStorage.setItem('sai_clothes_invoices', JSON.stringify(invoices));
    } catch (e) {
      console.error(e);
    }
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('sai_clothes_militia_theme', JSON.stringify(isMiniMilitiaTheme));
    } catch (e) {
      console.error(e);
    }
  }, [isMiniMilitiaTheme]);

  // Handler for saving/creating a new invoice
  const handleSaveInvoice = (
    invoice: Invoice,
    action: 'save' | 'printA4' | 'printThermal' | 'whatsapp'
  ) => {
    // Check if updating existing or creating new
    const exists = invoices.some((i) => i.id === invoice.id);
    let updatedInvoices: Invoice[];

    if (exists) {
      updatedInvoices = invoices.map((i) => (i.id === invoice.id ? invoice : i));
    } else {
      updatedInvoices = [invoice, ...invoices];

      // Auto increment shop next invoice number if formatted like SCR-1004
      const nextNum = shop.nextInvoiceNumber + 1;
      setShop((prev) => ({ ...prev, nextInvoiceNumber: nextNum }));
    }

    setInvoices(updatedInvoices);

    // Perform action
    if (action === 'printA4') {
      setActiveInvoiceForModal({ invoice, mode: 'a4' });
    } else if (action === 'printThermal') {
      setActiveInvoiceForModal({ invoice, mode: 'thermal' });
    } else if (action === 'whatsapp') {
      setActiveInvoiceForModal({ invoice, mode: 'a4', autoSharePdf: true });
    } else {
      alert(`Invoice ${invoice.invoiceNumber} saved successfully!`);
    }
  };

  // WhatsApp helper (Opens Modal and triggers PDF share)
  const triggerWhatsApp = (invoice: Invoice) => {
    setActiveInvoiceForModal({ invoice, mode: 'a4', autoSharePdf: true });
  };

  // Delete Invoice
  const handleDeleteInvoice = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice record?')) {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
    }
  };

  // Add/Delete Quick Products
  const handleAddQuickProduct = (p: QuickProduct) => {
    setQuickProducts((prev) => [p, ...prev]);
  };

  const handleDeleteQuickProduct = (id: string) => {
    setQuickProducts((prev) => prev.filter((p) => p.id !== id));
  };

  if (publicInvoice) {
    return (
      <PublicBillView
        invoice={publicInvoice}
        shop={shop}
        onGoToApp={() => {
          window.history.pushState({}, '', window.location.pathname);
          setPublicInvoice(null);
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors selection:bg-amber-400 selection:text-slate-950 ${
        isMiniMilitiaTheme
          ? 'military-camo-bg text-slate-100'
          : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shop={shop}
        invoices={invoices}
        onNewInvoiceClick={() => setActiveTab('new')}
        isMiniMilitiaTheme={isMiniMilitiaTheme}
        setIsMiniMilitiaTheme={setIsMiniMilitiaTheme}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 my-2 pb-28">
        {activeTab === 'new' && (
          <InvoiceForm
            shop={shop}
            quickProducts={quickProducts}
            onSaveInvoice={handleSaveInvoice}
            isMiniMilitiaTheme={isMiniMilitiaTheme}
          />
        )}

        {activeTab === 'history' && (
          <InvoiceHistory
            invoices={invoices}
            onSelectInvoice={(invoice, mode) =>
              setActiveInvoiceForModal({ invoice, mode })
            }
            onDeleteInvoice={handleDeleteInvoice}
            onShareWhatsApp={triggerWhatsApp}
            isMiniMilitiaTheme={isMiniMilitiaTheme}
          />
        )}

        {activeTab === 'catalog' && (
          <QuickCatalogManager
            products={quickProducts}
            onAddProduct={handleAddQuickProduct}
            onDeleteProduct={handleDeleteQuickProduct}
          />
        )}
      </main>

      {/* App-like Bottom Navigation Bar (Section 1: Billing / Section 2: Invoice History / Section 3: Catalog) */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        invoicesCount={invoices.length}
        isMiniMilitiaTheme={isMiniMilitiaTheme}
      />

      {/* Footer */}
      <footer
        className={`border-t text-center text-xs py-4 mb-16 print:hidden font-mono ${
          isMiniMilitiaTheme
            ? 'bg-slate-950 text-slate-400 border-emerald-900/80'
            : 'bg-slate-900 text-slate-400 border-slate-800'
        }`}
      >
        <p className="font-bold text-amber-400">
          SAI CLOTHES RAILWAY — Retail Billing Software
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Opposite Railway Station • Fast Billing, Thermal PDF & WhatsApp Link System
        </p>
      </footer>

      {/* Full Screen Invoice Print/Share Modal */}
      {activeInvoiceForModal && (
        <InvoiceModal
          invoice={activeInvoiceForModal.invoice}
          shop={shop}
          mode={activeInvoiceForModal.mode}
          autoSharePdf={activeInvoiceForModal.autoSharePdf}
          onClose={() => setActiveInvoiceForModal(null)}
        />
      )}
    </div>
  );
}
