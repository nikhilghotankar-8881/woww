import React from 'react';
import { useTranslation } from '../../i18n';
import { VoiceReader } from './VoiceReader';
import {
  X,
  BookOpen,
  Sprout,
  CheckCircle2,
  Bell,
  PhoneCall,
  ShieldCheck,
  FileText,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function FarmerGuideModal({ isOpen, onClose }) {
  const { lang, t } = useTranslation();

  if (!isOpen) return null;

  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';

  const brochureTitle = isMarathi
    ? 'शेतकरी माहिती पुस्तिका — सूचना सेतू कसे वापरावे?'
    : isHindi
    ? 'किसान सूचना विवरणिका — सूचना सेतु का उपयोग कैसे करें?'
    : 'Farmer Information Guide — How Shetkari Suchna Setu Works';

  const fullGuideSpeechText = isMarathi
    ? 'शेतकरी सूचना सेतू माहिती पुस्तिका. पहिली पायरी: आपले शेत आणि पिके निवडा. दुसरी पायरी: आपल्यासाठी योग्य योजना आणि मिळणारे अनुदान पहा. तिसरी पायरी: शेवटची तारीख बदलल्यास थेट व्हॉट्सॲप, मेसेज आणि फोन कॉलद्वारे अलर्ट मिळवा. चौथी पायरी: सर्व माहिती थेट अधिकृत शासकीय राजपत्रावरून तपासलेली असते.'
    : isHindi
    ? 'किसान सूचना सेतु विवरणिका। पहला चरण: अपनी जमीन और फसलें चुनें। दूसरा चरण: अपने लिए उपयोगी योजनाएं और अनुदान देखें। तीसरा चरण: अंतिम तिथि बदलने पर सीधे व्हाट्सएप, एसएमएस और फोन कॉल अलर्ट पाएं। चौथा चरण: सभी जानकारी आधिकारिक सरकारी गजट से जांची गई होती है।'
    : 'Shetkari Suchna Setu Information Guide. Step 1: Select your farm and crops. Step 2: View matched schemes and cash benefits. Step 3: Receive automatic WhatsApp, SMS, and phone call alerts when deadlines change. Step 4: 100% verified directly from official government gazettes.';

  const steps = [
    {
      num: '१',
      numEn: '1',
      title: isMarathi ? 'तुमची शेती व पिके निवडा (30 सेकंद)' : isHindi ? 'अपनी जमीन और फसलें चुनें (30 सेकंड)' : 'Choose Farm & Crops (30 secs)',
      desc: isMarathi
        ? 'कोणताही पासवर्ड नको! फक्त तुमचा जिल्हा आणि पिके (गहू, सोयाबीन, कापूस, कांदा) निवडा.'
        : isHindi
        ? 'कोई कठिन पासवर्ड नहीं! बस अपना जिला और फसलें (गेहूं, सोयाबीन, कपास, प्याज) चुनें।'
        : 'Zero technical complexity. Just pick your district and current crops (Wheat, Soybean, Cotton, Onion).',
      badge: isMarathi ? 'अतिशय सोपे' : isHindi ? 'बेहद आसान' : 'Zero Friction',
      icon: Sprout,
      color: 'bg-emerald-500'
    },
    {
      num: '२',
      numEn: '2',
      title: isMarathi ? 'तुमच्यासाठी योग्य योजना पहा' : isHindi ? 'अपने लिए सही योजनाएं देखें' : 'View Matched Schemes & Money',
      desc: isMarathi
        ? 'पीएम-किसान (₹6,000), नमो शेतकरी (₹6,000) आणि ₹1 रुपयात पीक विमा — तुम्हाला नेमके काय मिळेल ते स्पष्ट दिसेल.'
        : isHindi
        ? 'पीएम-किसान (₹6,000), नमो शेतकरी (₹6,000) और ₹1 में फसल बीमा — आपको क्या फायदा मिलेगा यह साफ दिखेगा।'
        : 'Clear cash support: ₹12,000/yr total income support plus ₹1 token crop insurance protection.',
      badge: isMarathi ? 'थेट बँक खात्यात' : isHindi ? 'सीधे बैंक खाते में' : 'Direct Cash Transfer',
      icon: CheckCircle2,
      color: 'bg-blue-500'
    },
    {
      num: '३',
      numEn: '3',
      title: isMarathi ? 'शेवटची तारीख बदलल्यास थेट कॉल व मेसेज' : isHindi ? 'अंतिम तिथि बदलते ही कॉल और मैसेज' : 'Auto Alert on Deadline Change',
      desc: isMarathi
        ? 'मुदत वाढली की धावपळ नको! प्रणाली स्वतः तुमच्या मोबाईलवर व्हॉट्सॲप मेसेज आणि ऑडिओ फोन कॉल करून सावध करेल.'
        : isHindi
        ? 'अंतिम तिथि बढ़ते ही चिंता खत्म! सिस्टम खुद आपके फोन पर व्हाट्सएप संदेश और वॉयस कॉल भेजकर सूचित करेगा।'
        : 'Never miss cut-offs. The system automatically dials or messages your mobile whenever application dates are extended.',
      badge: isMarathi ? 'स्वयंचलित अलर्ट' : isHindi ? 'स्वचालित अलर्ट' : 'Automated Dispatch',
      icon: PhoneCall,
      color: 'bg-amber-500'
    },
    {
      num: '४',
      numEn: '4',
      title: isMarathi ? '100% शासकीय पुरावा (अफवांपासून मुक्ती)' : isHindi ? '100% सरकारी प्रमाण (अफवाहों से मुक्ति)' : '100% Verified Official Truth',
      desc: isMarathi
        ? 'सोशल मीडियावरील खोट्या बातम्यांवर विश्वास ठेवू नका. येथे प्रत्येक तारीख आणि नियम शासकीय राजपत्राशी ताडूनच दाखवला जातो.'
        : isHindi
        ? 'सोशल मीडिया की भ्रामक खबरों से बचें। यहां हर तारीख और नियम सरकारी गजट से जांच कर ही दिखाया जाता है।'
        : 'Zero fake forwards. Every figure, cut-off date, and criteria is cross-checked against primary Government of India circulars.',
      badge: isMarathi ? 'पडताळलेले' : isHindi ? 'सत्यापित' : 'Grounded Proof',
      icon: ShieldCheck,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-700 text-white p-5 sm:p-6 flex items-start justify-between relative">
          <div className="pr-8">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white mb-2 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'शेतकरी मार्गदर्शक' : isHindi ? 'किसान गाइड' : 'Farmer Quick Guide'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              {brochureTitle}
            </h2>
            <p className="text-xs sm:text-sm text-brand-100 mt-1">
              {isMarathi
                ? 'कमी शिकलेल्या शेतकरी बांधवांसाठी अत्यंत साधी, बोलणारी आणि विश्वासाची डिजिटल सेवा.'
                : isHindi
                ? 'कम पढ़े-लिखे किसान भाइयों के लिए बेहद सरल, बोलने वाली और भरोसेमंद डिजिटल सेवा।'
                : 'A dead-simple, voice-enabled, verified notice intelligence bridge for every Indian farmer.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors absolute top-5 right-5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listen Aloud Bar */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            <span>
              {isMarathi
                ? 'हे माहितीपत्रक ऑडिओमध्ये ऐका:'
                : isHindi
                ? 'इस विवरणिका को ऑडियो में सुनें:'
                : 'Listen to this brochure aloud:'}
            </span>
          </div>
          <VoiceReader
            title={brochureTitle}
            text={fullGuideSpeechText}
            size="sm"
          />
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Steps Cards */}
          <div className="space-y-3">
            {steps.map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-brand-400 hover:shadow-sm transition-all flex items-start space-x-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${st.color} text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {st.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shrink-0">
                        {st.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Assurance Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 text-amber-900">
            <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <span className="font-bold block">
                {isMarathi
                  ? 'शेतकऱ्यांसाठी मोफत व सुरक्षित हमी:'
                  : isHindi
                  ? 'किसानों के लिए मुफ्त व सुरक्षित गारंटी:'
                  : '100% Free & Privacy-Protected:'}
              </span>
              <p className="text-amber-800 leading-relaxed">
                {isMarathi
                  ? 'ही प्रणाली सर्व शेतकऱ्यांसाठी विनामूल्य आहे. आम्ही कधीही तुमचा बँक पासवर्ड, आधार किंवा पैशांची मागणी करत नाही.'
                  : isHindi
                  ? 'यह प्रणाली सभी किसानों के लिए बिल्कुल मुफ्त है। हम कभी भी आपका बैंक पासवर्ड, आधार या पैसे की मांग नहीं करते।'
                  : 'This platform is completely free. We never request bank credentials, Aadhaar copies, or application fees.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">
            {isMarathi ? 'शेतकरी सूचना सेतू • महाराष्ट्र व भारत शासन' : 'Shetkari Suchna Setu • Citizen First'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <span>{isMarathi ? 'समजले, सुरू करा' : isHindi ? 'समझ गया, शुरू करें' : 'Got it, let’s start'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FarmerGuideModal;

