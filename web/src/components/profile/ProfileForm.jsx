import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../hooks/useAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  Save,
  Trash2,
  CheckCircle2,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  MapPin,
  Sprout,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'Pune', 'Ahmednagar', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar', 'Beed', 'Bhandara',
  'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon',
  'Jalna', 'Kolhapur', 'Latur', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik',
  'Dharashiv', 'Palghar', 'Parbhani', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara',
  'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
];

const AVAILABLE_CROPS = [
  { id: 'Wheat', mr: 'गहू', hi: 'गेहूं', icon: '🌱' },
  { id: 'Gram', mr: 'हरभरा / चना', hi: 'चना', icon: '🫘' },
  { id: 'Soybean', mr: 'सोयाबीन', hi: 'सोयाबीन', icon: '🌾' },
  { id: 'Cotton', mr: 'कापूस', hi: 'कपास', icon: '🌿' },
  { id: 'Onion', mr: 'कांदा', hi: 'प्याज', icon: '🧅' },
  { id: 'Sugarcane', mr: 'ऊस', hi: 'गन्ना', icon: '🎋' },
  { id: 'Jowar', mr: 'ज्वारी', hi: 'ज्वार', icon: '🌾' },
  { id: 'Bajra', mr: 'बाजरी', hi: 'बाजरा', icon: '🌾' },
  { id: 'Maize', mr: 'मका', hi: 'मक्का', icon: '🌽' },
  { id: 'Tur', mr: 'तूर', hi: 'अरहर', icon: '🫘' },
  { id: 'Grapes', mr: 'द्राक्षे', hi: 'अंगूर', icon: '🍇' },
  { id: 'Pomegranate', mr: 'डाळिंब', hi: 'अनार', icon: '🍎' },
  { id: 'Banana', mr: 'केळी', hi: 'केला', icon: '🍌' },
  { id: 'Rice', mr: 'भात / तांदूळ', hi: 'चावल', icon: '🌾' }
];

export function ProfileForm({ initialProfile = {}, onSaved = () => {} }) {
  const { t, lang } = useTranslation();
  const { user, refreshProfile, deleteMyData } = useAuth();

  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';

  const [district, setDistrict] = useState(initialProfile.district || 'Pune');
  const [crops, setCrops] = useState(initialProfile.crops || ['Wheat', 'Gram']);
  const [landStatus, setLandStatus] = useState(initialProfile.land_status || 'owner');
  const [landPre2019, setLandPre2019] = useState(initialProfile.land_on_or_before_2019 !== false);
  const [loanee, setLoanee] = useState(Boolean(initialProfile.loanee));
  const [ekycDone, setEkycDone] = useState(initialProfile.ekyc_done || 'unsure');
  const [season, setSeason] = useState(initialProfile.season || 'rabi');
  const [phone, setPhone] = useState(initialProfile.phone || '+91 98765 43210');
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(initialProfile.notify_whatsapp !== false);
  const [notifySms, setNotifySms] = useState(Boolean(initialProfile.notify_sms));
  const [notifyCall, setNotifyCall] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleCrop = (cropId) => {
    if (crops.includes(cropId)) {
      if (crops.length > 1) {
        setCrops(crops.filter(c => c !== cropId));
      }
    } else {
      setCrops([...crops, cropId]);
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
      notify_whatsapp: notifyWhatsapp,
      notify_sms: notifySms,
      notify_call: notifyCall,
      lang,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('profiles')
        .upsert(payload);

      if (error) {
        console.error('Error saving profile:', error.message);
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
    <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-7 shadow-xs">
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs sm:text-sm font-bold text-emerald-900 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{isMarathi ? 'माहिती यशस्वीरित्या जतन झाली! तुमच्या योजनांची जुळवणी अद्ययावत केली आहे.' : 'Profile saved successfully! Your matched schemes have been refreshed.'}</span>
        </div>
      )}

      {/* 1. District Selection */}
      <div>
        <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
          <MapPin className="w-4 h-4 text-brand-600" />
          <span>{isMarathi ? '१. तुमचा जिल्हा निवडा:' : '1. Select Your District:'}</span>
        </label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-bold bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
        >
          {MAHARASHTRA_DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* 2. Visual Crops Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>{isMarathi ? '२. शेतातील पिके निवडा (टॅप करा):' : '2. Select Your Crops (Tap to pick):'}</span>
          </label>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            {crops.length} {isMarathi ? 'निवडली' : 'selected'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {AVAILABLE_CROPS.map((c) => {
            const isSelected = crops.includes(c.id);
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => toggleCrop(c.id)}
                className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center space-x-2.5 ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-xs ring-1 ring-brand-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xl">{c.icon}</span>
                <div className="truncate">
                  <span className="block leading-tight">{isMarathi ? c.mr : (isHindi ? c.hi : c.id)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{c.id}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Land Status */}
      <div>
        <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
          {isMarathi ? '३. शेतजमीन स्थिती:' : '3. Land Holding Status:'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'owner', label: isMarathi ? '🚜 स्वतःची जमीन (मालक)' : (isHindi ? '🚜 खुद की जमीन (मालिक)' : 'Land Owner'), sub: '< 2 हेक्टर (लहान शेतकरी)' },
            { id: 'tenant', label: isMarathi ? '🌾 बटाईदार / कुळ' : (isHindi ? '🌾 बटाईदार / पट्टेदार' : 'Tenant / Sharecropper'), sub: 'करार शेती' },
            { id: 'landless', label: isMarathi ? '🌱 शेतमजूर / भूमिहीन' : (isHindi ? '🌱 भूमिहीन मजदूर' : 'Agricultural Laborer'), sub: 'मजुरी काम' }
          ].map((item) => (
            <label
              key={item.id}
              className={`p-4 rounded-2xl border cursor-pointer text-xs font-bold transition-all flex flex-col justify-between ${
                landStatus === item.id
                  ? 'border-brand-500 bg-brand-50/70 text-brand-900 ring-1 ring-brand-500 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <input
                  type="radio"
                  name="land_status"
                  value={item.id}
                  checked={landStatus === item.id}
                  onChange={() => setLandStatus(item.id)}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-black">{item.label}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium pl-6">{item.sub}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. PM-KISAN e-KYC */}
      <div>
        <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
          {isMarathi ? '४. पीएम-किसान ई-केवायसी (e-KYC) झाली आहे का?' : '4. PM-KISAN e-KYC Status:'}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'yes', label: isMarathi ? 'होय, पूर्ण झाली' : 'Yes, Complete', color: 'emerald' },
            { id: 'no', label: isMarathi ? 'नाही, बाकी आहे' : 'No, Pending', color: 'rose' },
            { id: 'unsure', label: isMarathi ? 'माहित नाही / तपासावे लागेल' : 'Unsure / Check', color: 'amber' }
          ].map(opt => (
            <label
              key={opt.id}
              className={`p-3 rounded-2xl border text-xs text-center cursor-pointer font-bold transition-all ${
                ekycDone === opt.id
                  ? 'border-brand-500 bg-brand-50 text-brand-900 ring-1 ring-brand-500 shadow-2xs'
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

      {/* 5. Automated Multi-Channel Alert Dispatch (Phone, WhatsApp, Voice Call) */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
            <PhoneCall className="w-4 h-4 text-brand-600" />
            <span>{isMarathi ? '५. स्वयंचलित मुदत इशारा सेवा (मोबाईल नंबर):' : '5. Automatic Deadline Alert Dispatch (Mobile Number):'}</span>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            {isMarathi
              ? 'अंतिम मुदत बदलली किंवा वाढली की प्रणाली आपोआप या क्रमांकावर मेसेज व फोन कॉल करते.'
              : 'The system automatically dials or messages this number when scheme deadlines change.'}
          </p>

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-sm font-bold bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* 3 Channels Checkboxes */}
        <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <label className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={notifyWhatsapp}
              onChange={(e) => setNotifyWhatsapp(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isMarathi ? 'व्हॉट्सॲप मेसेज' : 'WhatsApp'}</span>
          </label>

          <label className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={notifyCall}
              onChange={(e) => setNotifyCall(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <PhoneCall className="w-4 h-4 text-brand-600 shrink-0" />
            <span>{isMarathi ? 'स्वयंचलित फोन कॉल' : 'Voice Call'}</span>
          </label>

          <label className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={notifySms}
              onChange={(e) => setNotifySms(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{isMarathi ? 'एसएमएस (SMS)' : 'SMS Text'}</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          type="button"
          onClick={handleDeleteData}
          className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t('profile.deleteData')}</span>
        </button>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-black shadow-md transition-all flex items-center justify-center space-x-2 hover:scale-102"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'जतन करत आहे...' : (isMarathi ? 'माहिती जतन करा' : 'Save Farm Profile')}</span>
        </button>
      </div>
    </form>
  );
}

export default ProfileForm;
