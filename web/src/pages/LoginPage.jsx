import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAuth } from '../hooks/useAuth';
import { Sprout, Mail, Lock, Phone, ArrowRight, ShieldCheck, User, Sparkles, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const { lang, t } = useTranslation();
  const { signIn, signUp, signInWithGoogle, signInWithOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';

  const [tab, setTab] = useState('one-tap'); // 'one-tap' | 'phone' | 'email'
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (res.error) {
        setErrorMsg(res.error.message);
      } else {
        navigate('/matches');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await signInWithOtp(phone);
      if (res.error) {
        setErrorMsg(res.error.message);
      } else {
        setOtpSent(true);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await verifyOtp(phone, otpToken);
      if (res.error) {
        setErrorMsg(res.error.message);
      } else {
        navigate('/matches');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick One-Tap Farmer Entry
  const handleQuickDemo = async (type) => {
    setLoading(true);
    setErrorMsg('');
    const email = type === 'farmer' ? 'farmer.demo@shetkarisuchna.org' : 'admin.reviewer@shetkarisuchna.org';
    const res = await signIn(email, 'demo1234');
    setLoading(false);
    if (res?.error) {
      setErrorMsg(res.error.message);
    } else {
      navigate(type === 'farmer' ? '/matches' : '/admin/review');
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-brand-700 to-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-md">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('appName')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isMarathi
              ? 'शेतकऱ्यांसाठी अत्यंत सोपा व विनामूल्य शासकीय योजना मंच'
              : 'Simple, direct government intelligence for farmers'}
          </p>
        </div>

        {/* 1-Tap Farmer Entry Box */}
        <div className="mb-6 bg-gradient-to-br from-brand-50 to-emerald-50 border-2 border-brand-500 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center space-x-1.5 text-brand-800 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>{isMarathi ? 'तात्काळ शेतकरी प्रवेश' : 'One-Tap Farmer Access'}</span>
          </div>

          <p className="text-xs text-slate-700 mb-3 leading-relaxed">
            {isMarathi
              ? 'कोणताही पासवर्ड लक्षात ठेवण्याची गरज नाही! एका क्लिकवर शेतकरी खात्यात प्रवेश करा.'
              : 'No passwords to remember. Jump straight into the verified farmer portal.'}
          </p>

          <button
            type="button"
            onClick={() => handleQuickDemo('farmer')}
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2 hover:scale-102"
          >
            <User className="w-4 h-4 text-brand-200" />
            <span>{isMarathi ? '👨‍🌾 थेट शेतकरी खात्यात प्रवेश करा' : (isHindi ? '👨‍🌾 सीधे किसान खाते में प्रवेश करें' : 'Enter as Farmer (One-Tap)')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => setTab('phone')}
            className={`flex-1 py-2 text-xs font-black border-b-2 text-center transition-colors ${
              tab === 'phone'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isMarathi ? 'मोबाईल OTP' : 'Phone OTP'}
          </button>
          <button
            type="button"
            onClick={() => setTab('email')}
            className={`flex-1 py-2 text-xs font-black border-b-2 text-center transition-colors ${
              tab === 'email'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isMarathi ? 'ईमेल / पासवर्ड' : 'Email / Password'}
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            className="py-2 px-2 text-[11px] font-bold text-amber-700 hover:text-amber-800 transition-colors flex items-center space-x-1"
            title="Reviewer Admin Queue"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isMarathi ? 'पडताळणी अधिकारी' : 'Reviewer'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800">
            {errorMsg}
          </div>
        )}

        {/* PHONE OTP FORM */}
        {tab === 'phone' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handlePhoneSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    {isMarathi ? 'मोबाईल नंबर टाका' : 'Mobile Number'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors"
                >
                  {loading ? 'कृपया थांबा...' : (isMarathi ? 'ओटीपी पाठवा (Send OTP)' : 'Send Verification OTP')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    {phone} {isMarathi ? 'वर आलेला ओटीपी टाका' : 'Enter OTP'}
                  </label>
                  <input
                    type="text"
                    required
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-base text-center font-mono tracking-widest font-black focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors"
                >
                  {loading ? 'पडताळणी करत आहे...' : (isMarathi ? 'ओटीपी पडताळा व लॉग इन करा' : 'Verify OTP & Log In')}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-center text-xs text-slate-500 hover:underline"
                >
                  {isMarathi ? 'दुसरा मोबाईल नंबर वापरा' : 'Use a different phone number'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* EMAIL FORM */}
        {tab === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'ईमेल पत्ता' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                {isMarathi ? 'पासवर्ड' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors"
            >
              {loading ? 'कृपया थांबा...' : (isSignUp ? (isMarathi ? 'खाते तयार करा' : 'Create Account') : (isMarathi ? 'लॉग इन करा' : 'Sign In'))}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-brand-700 hover:underline font-bold"
              >
                {isSignUp
                  ? (isMarathi ? 'आधीच खाते आहे? लॉग इन करा' : 'Already have an account? Sign In')
                  : (isMarathi ? 'नवीन शेतकरी? नवीन खाते तयार करा' : 'New farmer? Create an account')}
              </button>
            </div>
          </form>
        )}

        {/* Google OAuth Option */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
