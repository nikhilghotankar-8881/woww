import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../hooks/useAuth';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { FarmerGuideModal } from '../common/FarmerGuideModal';
import {
  Bell,
  BookOpen,
  CheckSquare,
  ShieldCheck,
  Activity,
  BarChart2,
  User,
  LogOut,
  Menu,
  X,
  Sprout,
  HelpCircle
} from 'lucide-react';

export function Navbar() {
  const { lang, t } = useTranslation();
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  const isMarathi = lang === 'mr';
  const isHindi = lang === 'hi';
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t('nav.schemes'), icon: BookOpen },
    ...(user ? [
      { path: '/matches', label: t('nav.matches'), icon: CheckSquare },
      { path: '/alerts', label: t('nav.alerts'), icon: Bell },
      { path: '/profile', label: t('nav.profile'), icon: User },
    ] : []),
    ...(isAdmin ? [
      { path: '/admin/review', label: t('nav.admin'), icon: ShieldCheck, badge: 'Reviewer' },
    ] : []),
    { path: '/sources', label: t('nav.sources'), icon: Activity },
    { path: '/evaluation', label: t('nav.evaluation'), icon: BarChart2 },
  ];

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 to-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 block leading-tight">
                    {t('appName')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block">
                    {t('appTagline')}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-colors ${
                      isActive(item.path)
                        ? 'bg-brand-50 text-brand-700 font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Guide Button, Language Switcher & Auth actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* How to use brochure modal trigger */}
              <button
                type="button"
                onClick={() => setGuideModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 transition-colors flex items-center space-x-1 shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                <span>{isMarathi ? 'माहिती पुस्तिका' : isHindi ? 'विवरणिका' : 'Guide'}</span>
              </button>

              <LanguageSwitcher />

              {user ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                    {user.email?.split('@')[0] || 'Farmer'}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title={t('nav.logout')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs sm:text-sm font-black hover:bg-brand-700 shadow-xs transition-colors"
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                type="button"
                onClick={() => setGuideModalOpen(true)}
                className="p-1.5 rounded-lg text-brand-700 bg-brand-50 text-xs font-bold flex items-center space-x-1"
              >
                <BookOpen className="w-4 h-4 text-brand-600" />
                <span>{isMarathi ? 'पुस्तिका' : 'Guide'}</span>
              </button>
              <LanguageSwitcher />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-base font-bold flex items-center justify-between ${
                    isActive(item.path)
                      ? 'bg-brand-50 text-brand-700 font-black'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-slate-500" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-slate-600 truncate max-w-[200px]">
                    {user.email || 'Farmer'}
                  </span>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm text-rose-600 font-bold hover:bg-rose-50 rounded-lg"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-brand-600 text-white rounded-xl font-black text-sm"
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <FarmerGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </>
  );
}

export default Navbar;
