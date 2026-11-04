-- 005_notifications.sql
-- Multi-channel outbound notification extensions for Shetkari SuchnaSetu

-- 1. Add notification preference columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_whatsapp BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_sms BOOLEAN DEFAULT FALSE;

-- 2. Create notification_logs table for WhatsApp & SMS delivery tracking
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES public.alerts(id) ON DELETE CASCADE,
  change_id UUID REFERENCES public.changes(id) ON DELETE CASCADE,
  channel TEXT CHECK (channel IN ('whatsapp', 'sms', 'in_app')),
  recipient TEXT NOT NULL,
  message_body TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'simulated')),
  provider TEXT,
  provider_msg_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying logs by user and alert
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON public.notification_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_alert ON public.notification_logs(alert_id);

-- Enable Row-Level Security
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Farmers can view their own notification logs
DROP POLICY IF EXISTS "Users read own notification logs" ON public.notification_logs;
CREATE POLICY "Users read own notification logs" ON public.notification_logs
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Only admins / service role can insert or modify notification logs
DROP POLICY IF EXISTS "Admin modify notification logs" ON public.notification_logs;
CREATE POLICY "Admin modify notification logs" ON public.notification_logs
  FOR ALL USING (public.is_admin());

