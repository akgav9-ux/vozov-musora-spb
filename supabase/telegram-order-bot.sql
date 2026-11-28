-- Run once in Supabase SQL Editor.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.telegram_order_sessions (
  telegram_user_id bigint PRIMARY KEY,
  chat_id bigint NOT NULL,
  step text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_order_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.telegram_order_sessions FROM anon, authenticated;
GRANT ALL ON public.telegram_order_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.orders TO service_role;
