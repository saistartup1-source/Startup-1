import React, { useState } from 'react';
import { ShopSettings } from '../types';
import { Settings, Save, Store, Phone, MapPin, QrCode, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
  shop: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => void;
}

export const ShopSettingsModal: React.FC<Props> = ({ shop, onSaveSettings }) => {
  const [formData, setFormData] = useState<ShopSettings>({ ...shop });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof ShopSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Settings className="w-5 h-5 text-amber-600" />
          <span>Shop Configuration & Bill Settings</span>
        </div>

        {savedSuccess && (
          <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </span>
        )}
      </div>

      {/* Shop Profile Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Store className="w-4 h-4 text-amber-600" />
          <span>Shop Branding Details</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shop Name (Printed Header)
            </label>
            <input
              type="text"
              value={formData.shopName}
              onChange={(e) => handleChange('shopName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              value={formData.addressLine1}
              onChange={(e) => handleChange('addressLine1', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              City, State & Pincode
            </label>
            <input
              type="text"
              value={formData.cityStatePincode}
              onChange={(e) => handleChange('cityStatePincode', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Mobile Number
            </label>
            <input
              type="text"
              value={formData.phonePrimary}
              onChange={(e) => handleChange('phonePrimary', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Secondary Mobile Number
            </label>
            <input
              type="text"
              value={formData.phoneSecondary}
              onChange={(e) => handleChange('phoneSecondary', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Tax & UPI Payment QR Settings */}
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <QrCode className="w-4 h-4 text-amber-600" />
          <span>GSTIN & UPI Payment Settings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              GSTIN Number
            </label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => handleChange('gstin', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-amber-900 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              UPI ID (for QR Code Payment)
            </label>
            <input
              type="text"
              value={formData.upiId}
              onChange={(e) => handleChange('upiId', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payee Name for UPI
            </label>
            <input
              type="text"
              value={formData.upiName}
              onChange={(e) => handleChange('upiName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Invoice Prefix & Signature Text */}
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-amber-600" />
          <span>Invoice Format & Signature</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Invoice Prefix
            </label>
            <input
              type="text"
              value={formData.invoicePrefix}
              onChange={(e) => handleChange('invoicePrefix', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Authorized Signatory Title
            </label>
            <input
              type="text"
              value={formData.authorizedSignatoryText}
              onChange={(e) => handleChange('authorizedSignatoryText', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="submit"
          className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Shop Settings</span>
        </button>
      </div>
    </form>
  );
};
