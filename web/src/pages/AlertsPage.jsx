import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { useAuth } from '../hooks/useAuth';
import { AlertCard } from '../components/alerts/AlertCard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Bell, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export function AlertsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load existing alerts
  const loadAlerts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const sampleAlert = {
      id: 'demo-alert-01',
      user_id: user.id,
      scheme_id: 'pm-kisan',
      headline: 'PM-KISAN: Official notice updated: "Hon\'ble Prime Minister released 22nd instalment on 13th March 2026. e-KYC mandatory before next payment."',
      match_state: 'MAY_APPLY',
      reasons: ['e-KYC is mandatory to receive instalments; complete biometric or OTP verification.'],
      created_at: new Date().toISOString(),
      read_at: null,
      changes: {
        source_id: 'pmkisan-home',
        synthetic: true,
        detected_at: new Date().toISOString(),
        diff: [
          { type: 'del', line: 'Hon\'ble Prime Minister released the 21st instalment on 05th November 2025.' },
          { type: 'add', line: 'Hon\'ble Prime Minister released the 22nd instalment on 13th March 2026.' },
          { type: 'add', line: 'eKYC is mandatory for all registered farmers before next instalment.' },
          { type: 'add', line: 'Last date for mandatory eKYC submission is 31-12-2026.' }
        ]
      }
    };

    if (!isSupabaseConfigured()) {
      const localAlerts = JSON.parse(localStorage.getItem('shetkari_mock_alerts') || '[]');
      setAlerts(localAlerts.length > 0 ? localAlerts : [sampleAlert]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          changes:change_id (
            id,
            source_id,
            detected_at,
            materiality,
            diff,
            fields,
            grounding,
            summary,
            synthetic
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setAlerts(data);
      } else {
        const localAlerts = JSON.parse(localStorage.getItem('shetkari_mock_alerts') || '[]');
        setAlerts(localAlerts.length > 0 ? localAlerts : [sampleAlert]);
      }
    } catch (err) {
      console.warn('Error loading alerts:', err);
      const localAlerts = JSON.parse(localStorage.getItem('shetkari_mock_alerts') || '[]');
      setAlerts(localAlerts.length > 0 ? localAlerts : [sampleAlert]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();

    // Setup Supabase Realtime Subscription
    if (isSupabaseConfigured() && user) {
      const channel = supabase
        .channel(`farmer-alerts-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alerts',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('[Realtime] New alert received!', payload);
            loadAlerts(); // Reload with joined change fields
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const handleMarkRead = async (alertId) => {
    const now = new Date().toISOString();
    if (isSupabaseConfigured()) {
      await supabase
        .from('alerts')
        .update({ read_at: now })
        .eq('id', alertId);
    }

    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read_at: now } : a));
  };

  const unreadCount = alerts.filter(a => !a.read_at).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Real-Time Verified Stream</span>
              </span>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('alerts.title')}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              {t('alerts.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Alerts Recorded</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {t('alerts.noAlerts')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

