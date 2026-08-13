import React from 'react';
import { ShopSettings, Invoice } from '../types';
import { formatCurrency } from '../utils/calculator';
import {
  FileText,
  History,
  BookOpen,
  Settings,
  PlusCircle,
  Tag,
  Crosshair,
  Shield,
  Zap,
  Flame,
  Award,
} from 'lucide-react';

interface Props {
  activeTab: 'new' | 'history' | 'catalog' | 'udhar' | 'settings';
  setActiveTab: (tab: 'new' | 'history' | 'catalog' | 'udhar' | 'settings') => void;
  shop: ShopSettings;
  invoices: Invoice[];
  onNewInvoiceClick: () => void;
  isMiniMilitiaTheme: boolean;
  setIsMiniMilitiaTheme: (val: boolean) => void;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  shop,
  invoices,
  onNewInvoiceClick,
  isMiniMilitiaTheme,
  setIsMiniMilitiaTheme,
}) => {
  // Calculate today's metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayInvoices = invoices.filter((inv) => inv.date === todayStr);
  const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const todayDiscounts = todayInvoices.reduce(
    (sum, inv) => sum + inv.itemDiscountTotal + inv.additionalDiscount,
    0
  );

  return (
    <header
      className={`sticky top-0 z-30 shadow-2xl transition-all print:hidden ${
        isMiniMilitiaTheme
          ? 'bg-slate-950 border-b-2 border-emerald-700/80 military-camo-bg text-white'
          : 'bg-slate-900 text-white border-b border-slate-800'
      }`}
    >
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Shop Branding & Mini Militia Commander Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl shadow-lg transition-transform hover:scale-105 ${
                isMiniMilitiaTheme
                  ? 'bg-gradient-to-br from-emerald-600 via-amber-600 to-emerald-950 text-amber-300 border-2 border-amber-400 shadow-emerald-900/50'
                  : 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {isMiniMilitiaTheme ? (
                <Crosshair className="w-7 h-7 text-amber-300 animate-pulse" />
              ) : (
                'S'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase font-mono">
                  {shop.shopName}
                </h1>

                {isMiniMilitiaTheme ? (
                  <span className="bg-emerald-900/90 text-amber-300 border border-emerald-500/80 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Shield className="w-3 h-3 text-amber-400" />
                    MILITIA HQ v3.0
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    POS v2.4
                  </span>
                )}
              </div>

              <p className="text-xs text-emerald-300/80 font-mono flex items-center gap-2 mt-0.5">
                <span>{shop.addressLine1} • Ph: {shop.phonePrimary}</span>
                {isMiniMilitiaTheme && (
                  <span className="text-amber-400 font-bold hidden sm:inline">
                    [COMMANDER: SAI CLOTHES RAILWAY]
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Today's Sales Snapshot & Theme Toggle */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div
              className={`flex items-center gap-3 p-2 rounded-xl text-xs ${
                isMiniMilitiaTheme
                  ? 'bg-slate-900/90 border-2 border-emerald-700/80 shadow-lg'
                  : 'bg-slate-800/80 border border-slate-700/60'
              }`}
            >
              <div className="px-2">
                <span className="text-slate-400 text-[10px] block uppercase font-mono font-bold">
                  {isMiniMilitiaTheme ? 'BATTALION REVENUE' : "Today's Sales"}
                </span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {formatCurrency(todaySales)}
                </span>
              </div>

              <div className="h-6 w-px bg-slate-700" />

              <div className="px-2">
                <span className="text-slate-400 text-[10px] block uppercase font-mono font-bold">
                  {isMiniMilitiaTheme ? 'DISCOUNT FIRED' : 'Discounts Given'}
                </span>
                <span className="font-mono font-black text-amber-400 text-sm">
                  {formatCurrency(todayDiscounts)}
                </span>
              </div>

              <div className="h-6 w-px bg-slate-700" />

              <div className="px-2">
                <span className="text-slate-400 text-[10px] block uppercase font-mono font-bold">
                  {isMiniMilitiaTheme ? 'AMMO / BILLS' : 'Bills Issued'}
                </span>
                <span className="font-mono font-black text-white text-sm">
                  {todayInvoices.length} Bills
                </span>
              </div>

              <button
                onClick={onNewInvoiceClick}
                className="ml-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Bill</span>
              </button>
            </div>

            {/* MINI MILITIA THEME TOGGLE BUTTON */}
            <button
              onClick={() => setIsMiniMilitiaTheme(!isMiniMilitiaTheme)}
              title="Toggle Mini Militia Combat Army Aesthetic Mode"
              className={`px-3 py-2 rounded-xl border text-xs font-mono font-black flex items-center gap-1.5 transition cursor-pointer shadow-md ${
                isMiniMilitiaTheme
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/30 animate-pulse'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-700 hover:bg-emerald-900'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>
                {isMiniMilitiaTheme ? 'MILITIA MODE: ON 🎖️' : 'MINI MILITIA THEME'}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-3 pt-2.5 border-t border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xs transition cursor-pointer whitespace-nowrap ${
              activeTab === 'new'
                ? isMiniMilitiaTheme
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>{isMiniMilitiaTheme ? 'CREATE INVOICE [FIRE]' : 'Create Invoice'}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xs transition cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? isMiniMilitiaTheme
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>
              {isMiniMilitiaTheme
                ? `WAR ARCHIVE (${invoices.length})`
                : `Invoice History (${invoices.length})`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xs transition cursor-pointer whitespace-nowrap ${
              activeTab === 'catalog'
                ? isMiniMilitiaTheme
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>{isMiniMilitiaTheme ? 'AMMO DEPOT (CATALOG)' : 'Quick Clothing Catalog'}</span>
          </button>

          <button
            onClick={() => setActiveTab('udhar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xs transition cursor-pointer whitespace-nowrap ${
              activeTab === 'udhar'
                ? isMiniMilitiaTheme
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>{isMiniMilitiaTheme ? 'CREDIT LEDGER (UDHAR)' : 'Udhar Ledger (Credit)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xs transition cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? isMiniMilitiaTheme
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>{isMiniMilitiaTheme ? 'HQ CONFIG (SETTINGS)' : 'Shop Settings'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
