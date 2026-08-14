import React from 'react';
import {
  FileText,
  History,
  Tag,
} from 'lucide-react';

interface Props {
  activeTab: 'new' | 'history' | 'catalog';
  setActiveTab: (tab: 'new' | 'history' | 'catalog') => void;
  invoicesCount: number;
  isMiniMilitiaTheme?: boolean;
}

export const BottomNavBar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  invoicesCount,
  isMiniMilitiaTheme = true,
}) => {
  return (
    <nav
      id="bottom-app-navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 print:hidden transition-all shadow-[0_-8px_30px_rgba(0,0,0,0.6)] ${
        isMiniMilitiaTheme
          ? 'bg-slate-950/95 backdrop-blur-md border-t-2 border-emerald-600/80 military-camo-bg text-white'
          : 'bg-slate-900/95 backdrop-blur-md border-t border-slate-700 text-white'
      }`}
    >
      <div className="max-w-xl mx-auto px-4 py-2">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Section 1: Create Invoice */}
          <button
            id="tab-create-invoice"
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all cursor-pointer font-mono ${
              activeTab === 'new'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80 font-semibold'
            }`}
          >
            <div className="relative">
              <FileText className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'new' ? 'text-slate-950' : 'text-amber-400'}`} />
            </div>
            <span className="text-xs sm:text-sm mt-1 text-center font-bold tracking-tight whitespace-nowrap">
              Billing (New)
            </span>
          </button>

          {/* Section 2: Invoice History */}
          <button
            id="tab-invoice-history"
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all cursor-pointer font-mono ${
              activeTab === 'history'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80 font-semibold'
            }`}
          >
            <div className="relative">
              <History className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'history' ? 'text-slate-950' : 'text-emerald-400'}`} />
              {invoicesCount > 0 && (
                <span
                  className={`absolute -top-1.5 -right-2.5 text-[10px] font-black px-1.5 py-0.2 rounded-full border ${
                    activeTab === 'history'
                      ? 'bg-slate-950 text-amber-400 border-amber-300'
                      : 'bg-emerald-500 text-slate-950 border-emerald-400'
                  }`}
                >
                  {invoicesCount}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm mt-1 text-center font-bold tracking-tight whitespace-nowrap">
              Bill History
            </span>
          </button>

          {/* Section 3: Quick Catalog */}
          <button
            id="tab-quick-catalog"
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all cursor-pointer font-mono ${
              activeTab === 'catalog'
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80 font-semibold'
            }`}
          >
            <Tag className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === 'catalog' ? 'text-slate-950' : 'text-emerald-400'}`} />
            <span className="text-xs sm:text-sm mt-1 text-center font-bold tracking-tight whitespace-nowrap">
              Catalog
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
