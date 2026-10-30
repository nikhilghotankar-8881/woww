import React from 'react';
import { useTranslation } from '../i18n';
import { useAuth } from '../hooks/useAuth';
import { ProfileForm } from '../components/profile/ProfileForm';
import { useNavigate, Link } from 'react-router-dom';
import { User, CheckSquare, Bell } from 'lucide-react';

export function ProfilePage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {t('profile.title')}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              {t('profile.subtitle')}
            </p>
          </div>

          <div className="flex sm:flex-col gap-2">
            <Link
              to="/matches"
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              <CheckSquare className="w-4 h-4 text-brand-600" />
              <span>Check Matches</span>
            </Link>
            <Link
              to="/alerts"
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              <Bell className="w-4 h-4 text-brand-600" />
              <span>Notice Alerts</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <ProfileForm
        initialProfile={profile || {}}
        onSaved={() => {
          navigate('/matches');
        }}
      />
    </div>
  );
}

