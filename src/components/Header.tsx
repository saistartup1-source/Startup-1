import React from 'react';
import { ShopSettings } from '../types';
import { ShoppingBag, Zap, MapPin, Phone } from 'lucide-react';

interface Props {
  shop: ShopSettings;
}

export const Header: React.FC<Props> = ({ shop }) => {
  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm transition-all print:hidden"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Shop Branding */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-300">
              <ShoppingBag className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase font-mono text-slate-900">
                  {shop.shopName}
                </h1>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                  RETAIL POS
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 font-mono mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {shop.addressLine1}
                </span>
                <span className="hidden sm:inline text-slate-300">•</span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Phone className="w-3 h-3 text-amber-600" />
                  Ph: {shop.phonePrimary}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1.5 rounded-xl font-mono font-bold flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              INSTANT BILLING SYSTEM
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
