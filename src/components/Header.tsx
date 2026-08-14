import React from 'react';
import { ShopSettings, Invoice } from '../types';
import {
  Shield,
  Crosshair,
} from 'lucide-react';

interface Props {
  activeTab: 'new' | 'history' | 'catalog';
  setActiveTab: (tab: 'new' | 'history' | 'catalog') => void;
  shop: ShopSettings;
  invoices: Invoice[];
  onNewInvoiceClick: () => void;
  isMiniMilitiaTheme: boolean;
  setIsMiniMilitiaTheme: (val: boolean) => void;
}

export const Header: React.FC<Props> = ({
  shop,
  isMiniMilitiaTheme,
}) => {
  return (
    <header
      id="main-app-header"
      className={`sticky top-0 z-30 shadow-xl transition-all print:hidden ${
        isMiniMilitiaTheme
          ? 'bg-slate-950 border-b-2 border-emerald-700/80 military-camo-bg text-white'
          : 'bg-slate-900 text-white border-b border-slate-800'
      }`}
    >
      {/* Sleek Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Shop Branding */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl shadow-lg transition-transform hover:scale-105 ${
                isMiniMilitiaTheme
                  ? 'bg-gradient-to-br from-emerald-600 via-amber-600 to-emerald-950 text-amber-300 border-2 border-amber-400 shadow-emerald-900/50'
                  : 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {isMiniMilitiaTheme ? (
                <Crosshair className="w-6 h-6 text-amber-300 animate-pulse" />
              ) : (
                'S'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase font-mono text-amber-400">
                  {shop.shopName}
                </h1>
                <span className="bg-emerald-900/90 text-amber-300 border border-emerald-500/80 text-[10px] px-2 py-0.5 rounded-full font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Shield className="w-3 h-3 text-amber-400" />
                  POS V2.4
                </span>
              </div>

              <p className="text-xs text-emerald-300/80 font-mono flex items-center gap-2 mt-0.5">
                <span>{shop.addressLine1} • Ph: {shop.phonePrimary}</span>
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="bg-slate-900/80 text-emerald-400 border border-emerald-700/60 text-xs px-3 py-1.5 rounded-xl font-mono font-bold">
              ⚡ FAST BILLING ACTIVE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
