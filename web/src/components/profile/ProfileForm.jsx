import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../hooks/useAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Save, Trash2, CheckCircle2 } from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar', 'Beed', 'Bhandara',
  'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon',
  'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
  'Nandurbar', 'Nashik', 'Dharashiv', 'Palghar', 'Parbhani', 'Pune', 'Raigad',
  'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha',
  'Washim', 'Yavatmal'
];

const AVAILABLE_CROPS = [
  'Wheat', 'Gram', 'Cotton', 'Soybean', 'Onion', 'Sugarcane',
  'Grapes', 'Pomegranate', 'Banana', 'Turmeric', 'Rice', 'Tur', 'Jowar', 'Bajra'
];

export function ProfileForm({ initialProfile = {}, onSaved = () => {} }) {
  const { t, lang, setLang } = useTranslation();
  const { user, refreshProfile, deleteMyData } = useAuth();

  const [district, setDistrict] = useState(initialProfile.district || 'Pune');
  const [crops, setCrops] = useState(initialProfile.crops || ['Wheat', 'Gram']);
  const [landStatus, setLandStatus] = useState(initialProfile.land_status || 'owner');
  const [landPre2019, setLandPre2019] = useState(initialProfile.land_on_or_before_2019 !== false);
  const [loanee, setLoanee] = useState(Boolean(initialProfile.loanee));
  const [ekycDone, setEkycDone] = useState(initialProfile.ekyc_done || 'unsure');
  const [season, setSeason] = useState(initialProfile.season || 'rabi');
  const [phone, setPhone] = useState(initialProfile.phone || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleCrop = (crop) => {
    if (crops.includes(crop)) {
      setCrops(crops.filter(c => c !== crop));
    } else {
      setCrops([...crops, crop]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    const payload = {
      id: user.id,
      district,
      crops,
      land_status: landStatus,
      land_on_or_before_2019: landPre2019,
      loanee,
      ekyc_done: ekycDone,
      season,
      phone: phone || null,
      lang,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('profiles')
        .upsert(payload);

      if (error) {
        console.error('Error saving profile:', error.message);
        alert('Failed to save profile: ' + error.message);
      } else {
        await refreshProfile();
        setSaveSuccess(true);
        onSaved();
      }
    } else {
      // Local demo mode
      const demoUser = JSON.parse(localStorage.getItem('shetkari_demo_user') || '{}');
      demoUser.profile = payload;
      localStorage.setItem('shetkari_demo_user', JSON.stringify(demoUser));
      setSaveSuccess(true);
      onSaved();
    }

    setSaving(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteData = async () => {
    if (window.confirm(t('profile.deleteConfirm'))) {
      await deleteMyData();
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile saved successfully. Matching determinations updated.</span>
        </div>
      )}

      {/* District */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('profile.district')}
        </label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
        >
          {MAHARASHTRA_DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Crops Grown */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('profile.crops')}
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_CROPS.map((crop) => {
            const isSelected = crops.includes(crop);
            return (
              <button
                type="button"
                key={crop}
                onClick={() => toggleCrop(crop)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isSelected ? `✓ ${crop}` : `+ ${crop}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Land Status */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('profile.landStatus')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'owner', label: t('profile.owner') },
            { id: 'tenant', label: t('profile.tenant') },
            { id: 'landless', label: t('profile.landless') },
          ].map((item) => (
            <label
              key={item.id}
              className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer text-xs font-medium transition-colors ${
                landStatus === item.id
                  ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="land_status"
                value={item.id}
                checked={landStatus === item.id}
                onChange={() => setLandStatus(item.id)}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Land Cut-off Date */}
      {landStatus === 'owner' && (
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            {t('profile.landCutoff')}
          </label>
          <div className="flex space-x-4 text-xs font-medium">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="pre_2019"
                checked={landPre2019 === true}
                onChange={() => setLandPre2019(true)}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span>{t('profile.yes')} (Before 01-02-2019)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="pre_2019"
                checked={landPre2019 === false}
                onChange={() => setLandPre2019(false)}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span>{t('profile.no')} (After 01-02-2019)</span>
            </label>
          </div>
        </div>
      )}

      {/* PM-KISAN e-KYC */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('profile.ekyc')}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'yes', label: t('profile.yes') },
            { id: 'no', label: t('profile.no') },
            { id: 'unsure', label: t('profile.unsure') }
          ].map(opt => (
            <label
              key={opt.id}
              className={`p-2.5 rounded-lg border text-xs text-center cursor-pointer font-medium ${
                ekycDone === opt.id
                  ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="ekyc_done"
                value={opt.id}
                checked={ekycDone === opt.id}
                onChange={() => setEkycDone(opt.id)}
                className="sr-only"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Loanee / Crop Loan */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('profile.loanee')}
        </label>
        <div className="flex space-x-4 text-xs font-medium">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="loanee"
              checked={loanee === true}
              onChange={() => setLoanee(true)}
              className="text-brand-600 focus:ring-brand-500"
            />
            <span>{t('profile.yes')} (Loanee Farmer)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="loanee"
              checked={loanee === false}
              onChange={() => setLoanee(false)}
              className="text-brand-600 focus:ring-brand-500"
            />
            <span>{t('profile.no')} (Non-Loanee)</span>
          </label>
        </div>
      </div>

      {/* Season */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          {t('profile.season')}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'rabi', label: t('profile.rabi') },
            { id: 'kharif', label: t('profile.kharif') },
            { id: 'both', label: t('profile.both') }
          ].map(opt => (
            <label
              key={opt.id}
              className={`p-2.5 rounded-lg border text-xs text-center cursor-pointer font-medium ${
                season === opt.id
                  ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="season"
                value={opt.id}
                checked={season === opt.id}
                onChange={() => setSeason(opt.id)}
                className="sr-only"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          {t('profile.phone')}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Action buttons */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
        <button
          type="button"
          onClick={handleDeleteData}
          className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t('profile.deleteData')}</span>
        </button>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold shadow-xs transition-colors flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : t('profile.save')}</span>
        </button>
      </div>
    </form>
  );
}

