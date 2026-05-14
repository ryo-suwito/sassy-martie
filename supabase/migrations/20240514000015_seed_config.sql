-- =============================================================================
-- 015_seed_config.sql
-- Seed public.system_config with initial operational defaults.
-- =============================================================================

INSERT INTO public.system_config (key, value) VALUES
  ('grace_period_hours',     '48'),
  ('qa_schedule_cron',       '0 3 * * 1'),
  ('taste_quorum_minimum',   '5'),
  ('taste_pass_threshold',   '3.5'),
  ('taste_vote_window_days', '7')
ON CONFLICT (key) DO UPDATE 
  SET value = EXCLUDED.value, updated_at = now();
