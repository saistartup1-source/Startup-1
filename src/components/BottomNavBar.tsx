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
}

export const BottomNavBar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  invoicesCount,
}) => {
  return (
    <nav
      id="bottom-app-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 print:hidden transition-all bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="max-w-xl mx-auto px-4 py-2">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Section 1: Create Invoice */}
          <button
            id="tab-create-invoice"
            type="button"
            onClick={() => setActiveTab('new')}
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all cursor-pointer font-mono ${
              activeTab === 'new'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.03]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-semibold'
            }`}
          >
            <div className="relative">
              <FileText
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  activeTab === 'new' ? 'text-slate-950' : 'text-slate-600'
                }`}
              />
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
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all cursor-pointer font-mono ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.03]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-semibold'
            }`}
          >
            <div className="relative">
              <History
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  activeTab === 'history' ? 'text-slate-950' : 'text-slate-600'
                }`}
              />
              {invoicesCount > 0 && (
                <span
                  className={`absolute -top-1.5 -right-2.5 text-[10px] font-black px-1.5 py-0.2 rounded-full border ${
                    activeTab === 'history'
                      ? 'bg-slate-950 text-amber-300 border-amber-400'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
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
            className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all cursor-pointer font-mono ${
              activeTab === 'catalog'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.03]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-semibold'
            }`}
          >
            <Tag
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                activeTab === 'catalog' ? 'text-slate-950' : 'text-slate-600'
              }`}
            />
            <span className="text-xs sm:text-sm mt-1 text-center font-bold tracking-tight whitespace-nowrap">
              Catalog
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
