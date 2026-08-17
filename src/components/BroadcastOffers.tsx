import React, { useState, useMemo } from 'react';
import { Invoice, ShopSettings } from '../types';
import {
  Megaphone,
  Send,
  Users,
  CheckSquare,
  Square,
  Sparkles,
  Search,
  MessageSquare,
  Copy,
  Check,
  Play,
  Pause,
  ExternalLink,
  ShoppingBag,
  RotateCcw,
  Tag,
  Phone,
  Flame,
  Gift,
  Zap,
} from 'lucide-react';

interface Props {
  invoices: Invoice[];
  shop: ShopSettings;
}

interface CustomerContact {
  phone: string;
  name: string;
  totalBills: number;
  totalSpent: number;
  lastDate: string;
}

export const BroadcastOffers: React.FC<Props> = ({ invoices, shop }) => {
  // Extract unique customers from invoices
  const customerList: CustomerContact[] = useMemo(() => {
    const map = new Map<string, CustomerContact>();

    invoices.forEach((inv) => {
      const rawPhone = (inv.customer.phone || '').replace(/\D/g, '');
      if (rawPhone.length >= 10) {
        const clean10 = rawPhone.slice(-10);
        const name = inv.customer.name?.trim() || 'Valued Customer';

        if (map.has(clean10)) {
          const existing = map.get(clean10)!;
          existing.totalBills += 1;
          existing.totalSpent += inv.grandTotal;
          if (inv.date > existing.lastDate) {
            existing.lastDate = inv.date;
          }
          if (name !== 'Valued Customer' && name !== 'Walk-in Customer') {
            existing.name = name;
          }
        } else {
          map.set(clean10, {
            phone: clean10,
            name: name === 'Walk-in Customer' ? 'Valued Customer' : name,
            totalBills: 1,
            totalSpent: inv.grandTotal,
            lastDate: inv.date,
          });
        }
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
    );
  }, [invoices]);

  // Selected customers state
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(() => {
    return new Set(customerList.map((c) => c.phone));
  });

  // Offer text state
  const [offerText, setOfferText] = useState(
    `🔥 *MEGA FESTIVAL SALE at SAI CLOTHES RAILWAY!* 🔥\n\nDear {CustomerName},\n\nWe have an exclusive offer just for you!\n🎉 *FLAT 30% to 50% OFF* on all latest Men's & Ladies' Garments, Jeans, Shirts & Ethnic Wear!\n\n🛍️ *Buy 2 Get 1 FREE* on selected categories this week.\n\n📍 *Visit Store:* Sai Clothes Railway, Opposite Railway Station\n📞 *Call/WhatsApp:* ${shop.phonePrimary}\n\n*Hurry! Offer valid for limited days only. Visit today!* ✨`
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedNumbers, setCopiedNumbers] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Automated Dispatcher Queue State
  const [isQueueRunning, setIsQueueRunning] = useState(false);
  const [queueIndex, setQueueIndex] = useState(0);
  const [sentSet, setSentSet] = useState<Set<string>>(new Set());

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return customerList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.lastDate.includes(q)
    );
  }, [customerList, searchQuery]);

  // Select all / Deselect all
  const handleToggleSelectAll = () => {
    if (selectedPhones.size === filteredCustomers.length && filteredCustomers.length > 0) {
      setSelectedPhones(new Set());
    } else {
      const all = new Set(filteredCustomers.map((c) => c.phone));
      setSelectedPhones(all);
    }
  };

  const handleToggleCustomer = (phone: string) => {
    const next = new Set(selectedPhones);
    if (next.has(phone)) {
      next.delete(phone);
    } else {
      next.add(phone);
    }
    setSelectedPhones(next);
  };

  // Helper to construct WhatsApp message for a specific customer
  const buildPersonalizedMessage = (contact: CustomerContact) => {
    let msg = offerText;
    msg = msg.replace(/{CustomerName}/g, contact.name);
    msg = msg.replace(/{ShopName}/g, shop.shopName);
    msg = msg.replace(/{ShopPhone}/g, shop.phonePrimary);
    return msg;
  };

  // Open single WhatsApp chat directly
  const handleOpenSingleWhatsApp = (contact: CustomerContact) => {
    const msg = buildPersonalizedMessage(contact);
    const encoded = encodeURIComponent(msg);
    const url = `https://api.whatsapp.com/send?phone=91${contact.phone}&text=${encoded}`;
    window.open(url, '_blank');
    setSentSet((prev) => new Set(prev).add(contact.phone));
  };

  // Quick Preset Offers
  const presetOffers = [
    {
      title: '🔥 Flat 50% Off Mega Sale',
      text: `🔥 *MEGA DISCOUNT OFFER at ${shop.shopName}!* 🔥\n\nDear {CustomerName},\n\nGet *FLAT 50% OFF* on all Premium Shirts, Jeans & Trousers!\n\n🎉 Limited stock available for our loyal customers.\n📍 *Store:* ${shop.shopName}, Opposite Railway Station\n📞 *Call:* ${shop.phonePrimary}\n\n*Visit today and grab your favorite styles!* 🛍️✨`,
    },
    {
      title: '🛍️ Buy 2 Get 1 FREE',
      text: `🛍️ *SPECIAL BUY 2 GET 1 FREE OFFER!* 🛍️\n\nHello {CustomerName},\n\nBuy any 2 Garments and get 1 absolutely *FREE* this weekend at ${shop.shopName}!\n\n✨ Fresh new stock arrived in all sizes.\n📍 *Location:* ${shop.addressLine1}\n📞 *Inquiries:* ${shop.phonePrimary}\n\n*Show this WhatsApp message at billing counter to claim!* 🙏`,
    },
    {
      title: '✨ New Arrivals Collection',
      text: `✨ *NEW SEASON ARRIVALS at ${shop.shopName}* ✨\n\nDear {CustomerName},\n\nWe have just unpacked the freshest trending collection for you:\n• Premium Cotton Shirts\n• Slim & Comfort Jeans\n• Ethnic & Festive Wear\n\n🎁 Special 10% Extra Discount on your next bill!\n📍 *Visit us:* ${shop.shopName}\n📞 *WhatsApp:* ${shop.phonePrimary}`,
    },
    {
      title: '🎉 Festival Special Discount',
      text: `🎉 *HAPPY FESTIVAL EXCLUSIVE OFFER!* 🎉\n\nDear {CustomerName},\n\nCelebrate with stylish clothes for the entire family!\nEnjoy flat discounts, combo offers, and gifts on every purchase above ₹999 at ${shop.shopName}.\n\n📍 *Opposite Railway Station*\n📞 *Ph:* ${shop.phonePrimary}\n\n*Thank you for being our valued customer!* 🙏❤️`,
    },
  ];

  // Selected array for the 1-Click Multi Dispatcher Queue
  const selectedList = useMemo(() => {
    return customerList.filter((c) => selectedPhones.has(c.phone));
  }, [customerList, selectedPhones]);

  // Handle 1-Click Sequential Dispatch
  const handleStartQueue = () => {
    if (selectedList.length === 0) {
      alert('Please select at least one customer to send the offer to!');
      return;
    }
    if (!offerText.trim()) {
      alert('Please write or paste an offer message first!');
      return;
    }

    setIsQueueRunning(true);
    setQueueIndex(0);

    // Open first customer immediately
    const firstCustomer = selectedList[0];
    handleOpenSingleWhatsApp(firstCustomer);
  };

  // Move to next customer in the 1-click sequence
  const handleNextInQueue = () => {
    const nextIdx = queueIndex + 1;
    if (nextIdx < selectedList.length) {
      setQueueIndex(nextIdx);
      const nextCustomer = selectedList[nextIdx];
      handleOpenSingleWhatsApp(nextCustomer);
    } else {
      setIsQueueRunning(false);
      alert('All selected customer WhatsApp chats have been launched!');
    }
  };

  // Copy all selected phone numbers (Formatted for Broadcast Lists / Contacts)
  const handleCopyNumbers = () => {
    const nums = selectedList.map((c) => `+91${c.phone}`).join(', ');
    navigator.clipboard.writeText(nums);
    setCopiedNumbers(true);
    setTimeout(() => setCopiedNumbers(false), 2500);
  };

  // Copy raw offer message
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(offerText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-2xl p-5 sm:p-6 shadow-md border border-amber-300 text-slate-950">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-md">
                <Megaphone className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight uppercase">
                WhatsApp Offers & Broadcast
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-mono font-bold text-slate-900">
              Send discount offers & festival promotions to all your store customers in 1 click!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/90 text-amber-300 px-4 py-2 rounded-xl font-mono text-xs border border-slate-800 shadow-sm">
            <Users className="w-4 h-4 text-amber-400" />
            <span>
              <strong className="text-white text-sm font-black">{customerList.length}</strong> Past Store Customers
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Offer Composer (Left) & Customer Selection (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Offer Message Composer & Templates (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Composer Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-900">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>WRITE / PASTE OFFER MESSAGE</span>
              </div>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-xs font-mono font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>
            </div>

            {/* Smart Placeholders Help Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
              <span className="text-slate-500 font-bold">Auto Tags:</span>
              <button
                type="button"
                onClick={() => setOfferText((prev) => prev + ' {CustomerName}')}
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-bold transition cursor-pointer"
                title="Inserts customer name automatically"
              >
                + &#123;CustomerName&#125;
              </button>
              <button
                type="button"
                onClick={() => setOfferText((prev) => prev + ` ${shop.shopName}`)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-md font-bold transition cursor-pointer"
              >
                + Shop Name
              </button>
              <button
                type="button"
                onClick={() => setOfferText((prev) => prev + ` ${shop.phonePrimary}`)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-md font-bold transition cursor-pointer"
              >
                + Phone
              </button>
            </div>

            {/* Offer Textarea */}
            <div>
              <textarea
                rows={7}
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
                placeholder="Paste or write your special discount or offer message here..."
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl p-3.5 text-xs sm:text-sm font-mono text-slate-900 leading-relaxed shadow-inner outline-none transition"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-1">
                <span>Supports WhatsApp bold (*text*), italic (_text_), and emojis.</span>
                <span>{offerText.length} characters</span>
              </div>
            </div>

            {/* Ready Offer Templates */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>QUICK 1-TAP OFFER TEMPLATES</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presetOffers.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setOfferText(preset.text)}
                    className="p-2.5 text-left bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-xl transition cursor-pointer group"
                  >
                    <div className="text-xs font-mono font-bold text-slate-900 group-hover:text-amber-900">
                      {preset.title}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-mono">
                      {preset.text.replace(/\n/g, ' ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Button: 1-Click Send to All via WhatsApp */}
            <div className="pt-3 border-t border-slate-100">
              <button
                id="btn-send-offers-all-whatsapp"
                type="button"
                onClick={handleStartQueue}
                className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-700 hover:to-emerald-700 text-white font-black font-mono py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer transform active:scale-98"
              >
                <MessageSquare className="w-5 h-5 fill-white" />
                <span>
                  SEND TO ALL ({selectedPhones.size} CUSTOMERS) IN 1-CLICK WHATSAPP
                </span>
              </button>
              <p className="text-[11px] text-slate-500 text-center font-mono mt-1.5">
                Opens WhatsApp directly for each selected customer with your customized message pre-filled.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Directory & Quick List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 font-sans">
            {/* Header with Select All & Copy */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-900">
                <Users className="w-5 h-5 text-amber-600" />
                <span>CUSTOMER RECIPIENTS</span>
                <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded-full font-black">
                  {selectedPhones.size}/{customerList.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyNumbers}
                  className="text-[11px] font-mono font-bold text-slate-600 hover:text-slate-900 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
                  title="Copy mobile numbers for WhatsApp Broadcast list"
                >
                  {copiedNumbers ? 'Copied!' : 'Copy Numbers'}
                </button>
              </div>
            </div>

            {/* Search and Selection Toggle */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search customer name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono px-1">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-1.5 text-slate-700 font-bold hover:text-amber-600 transition cursor-pointer"
                >
                  {selectedPhones.size === filteredCustomers.length && filteredCustomers.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Select All ({filteredCustomers.length})</span>
                </button>

                <span className="text-[11px] text-slate-400">
                  {sentSet.size} Sent today
                </span>
              </div>
            </div>

            {/* Scrollable Customer List */}
            <div className="max-h-[380px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-mono text-xs space-y-1">
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-bold">No customers found</p>
                  <p className="text-[10px]">Create bills to automatically build your customer directory.</p>
                </div>
              ) : (
                filteredCustomers.map((c) => {
                  const isSelected = selectedPhones.has(c.phone);
                  const isSent = sentSet.has(c.phone);

                  return (
                    <div
                      key={c.phone}
                      className={`pt-2 pb-1.5 flex items-center justify-between gap-2 transition px-2 rounded-xl ${
                        isSelected ? 'bg-amber-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div
                        onClick={() => handleToggleCustomer(c.phone)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCustomer(c.phone)}
                          className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold text-slate-900 truncate">
                              {c.name}
                            </span>
                            {isSent && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                                ✓ SENT
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                            <span>+91 {c.phone}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">
                              ₹{c.totalSpent} ({c.totalBills} {c.totalBills === 1 ? 'bill' : 'bills'})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Direct 1-Tap Single WhatsApp Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenSingleWhatsApp(c)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl border border-emerald-300 transition cursor-pointer shadow-2xs shrink-0"
                        title={`Send WhatsApp offer directly to ${c.name}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Automated Dispatcher Modal (When 1-Click Send Queue is Active) */}
      {isQueueRunning && selectedList.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 font-sans space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-mono font-black text-slate-900 text-base">
                <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                <span>WHATSAPP DISPATCHER IN PROGRESS</span>
              </div>
              <button
                type="button"
                onClick={() => setIsQueueRunning(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono font-bold"
              >
                Close
              </button>
            </div>

            {/* Current Progress Meter */}
            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>
                  Customer {queueIndex + 1} of {selectedList.length}
                </span>
                <span className="text-emerald-700 font-black">
                  {Math.round(((queueIndex + 1) / selectedList.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((queueIndex + 1) / selectedList.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Current Customer Card */}
            {selectedList[queueIndex] && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 font-mono text-xs">
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  Current Recipient:
                </div>
                <div className="text-sm font-black text-slate-900">
                  {selectedList[queueIndex].name}
                </div>
                <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>+91 {selectedList[queueIndex].phone}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleNextInQueue}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {queueIndex + 1 < selectedList.length
                    ? 'NEXT CUSTOMER (LAUNCH WHATSAPP)'
                    : 'FINISH DISPATCH'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsQueueRunning(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer border border-slate-300"
              >
                Stop / Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
