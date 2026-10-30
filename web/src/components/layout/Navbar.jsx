import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../hooks/useAuth';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
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
  Sprout
} from 'lucide-react';

export function Navbar() {
  const { t } = useTranslation();
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  {t('appName')}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                    isActive(item.path)
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Language Switcher & Auth actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <span className="text-xs text-slate-600 truncate max-w-[120px]">
                  {user.email || 'Farmer'}
                </span>
                <button
                  onClick={() => signOut()}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 shadow-xs transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
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
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center justify-between ${
                  isActive(item.path)
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-slate-600 truncate max-w-[200px]">
                  {user.email || 'Farmer'}
                </span>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-sm text-red-600 font-medium hover:bg-red-50 rounded"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-brand-600 text-white rounded-lg font-medium"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

