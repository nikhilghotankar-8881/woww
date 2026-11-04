import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { useAuth } from '../hooks/useAuth';
import { ReviewCard } from '../components/admin/ReviewCard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export function AdminReviewPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [pendingChanges, setPendingChanges] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPendingChanges = async () => {
    const sampleDemoChange = {
      id: 'demo-change-01',
      source_id: 'pmkisan-home',
      detected_at: new Date().toISOString(),
      materiality: 'material',
      grounding: 'grounded',
      grounding_notes: [],
      synthetic: true,
      summary: 'PM-KISAN: Official portal update announces 22nd instalment release and mandatory e-KYC requirement.',
      summary_method: 'template',
      fields: [
        { name: 'instalment_date', value: '13th March 2026', evidence: 'Hon\'ble Prime Minister released the 22nd instalment of PM KISAN scheme on 13th March 2026.', method: 'regex' },
        { name: 'last_date', value: '31-12-2026', evidence: 'Last date for mandatory eKYC submission is 31-12-2026.', method: 'regex' }
      ],
      diff: [
        { type: 'del', line: 'Hon\'ble Prime Minister released the 21st instalment of PM KISAN scheme on 05th November 2025.' },
        { type: 'add', line: 'Hon\'ble Prime Minister released the 22nd instalment of PM KISAN scheme on 13th March 2026.' },
        { type: 'add', line: 'eKYC is mandatory for all registered farmers before next instalment.' },
        { type: 'add', line: 'Last date for mandatory eKYC submission is 31-12-2026.' }
      ]
    };

    if (!isSupabaseConfigured()) {
      const localChanges = JSON.parse(localStorage.getItem('shetkari_demo_changes') || 'null');
      setPendingChanges(localChanges || [sampleDemoChange]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('changes')
        .select('*')
        .eq('review_status', 'pending')
        .order('detected_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setPendingChanges(data);
      } else {
        const localChanges = JSON.parse(localStorage.getItem('shetkari_demo_changes') || 'null');
        setPendingChanges(localChanges || [sampleDemoChange]);
      }
    } catch (err) {
      console.warn('Error loading pending changes:', err);
      setPendingChanges([sampleDemoChange]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingChanges();

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('admin-review-queue')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'changes'
          },
          () => {
            loadPendingChanges();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const handleApprove = async (changeId, reviewNote) => {
    const now = new Date().toISOString();
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('changes')
        .update({
          review_status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: now,
          review_note: reviewNote || 'Approved by human reviewer'
        })
        .eq('id', changeId);

      if (error) {
        alert('Approval failed: ' + error.message);
        return;
      }
    }

    // In demo mode, trigger fanout in local storage
    const approvedChange = pendingChanges.find(c => c.id === changeId);
    if (approvedChange) {
      const existingAlerts = JSON.parse(localStorage.getItem('shetkari_mock_alerts') || '[]');
      const newAlert = {
        id: 'alert-' + Date.now(),
        user_id: user?.id || 'demo-user',
        scheme_id: approvedChange.source_id === 'pmkisan-home' ? 'pm-kisan' : 'pmfby',
        headline: approvedChange.summary,
        match_state: 'MAY_APPLY',
        reasons: ['Requirement update verified from official portal.'],
        created_at: now,
        read_at: null,
        changes: approvedChange
      };
      localStorage.setItem('shetkari_mock_alerts', JSON.stringify([newAlert, ...existingAlerts]));
    }

    setPendingChanges(prev => prev.filter(c => c.id !== changeId));
  };

  const handleReject = async (changeId, reviewNote) => {
    const now = new Date().toISOString();
    if (isSupabaseConfigured()) {
      await supabase
        .from('changes')
        .update({
          review_status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: now,
          review_note: reviewNote || 'Rejected by reviewer'
        })
        .eq('id', changeId);
    }

    setPendingChanges(prev => prev.filter(c => c.id !== changeId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Human-in-the-Loop Review Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('admin.title')}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              {t('admin.subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold">
              {pendingChanges.length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Queue items */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
        </div>
      ) : pendingChanges.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">{t('admin.emptyQueue')}</h3>
          <p className="text-xs text-slate-500 mt-1">
            All detected changes have been reviewed and dispatched.
          </p>
        </div>
      ) : (
        <div>
          {pendingChanges.map((change) => (
            <ReviewCard
              key={change.id}
              change={change}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

