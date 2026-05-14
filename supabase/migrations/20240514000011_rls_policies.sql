-- =============================================================================
-- 011_rls_policies.sql
-- RLS policies for all tables across all schemas.
-- RLS is the wall.
-- =============================================================================

-- Helper function: Is Backoffice User?
CREATE OR REPLACE FUNCTION public.is_backoffice() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role') = 'backoffice'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- CATALOG SCHEMA
-- =============================================================================

-- catalog.listings
CREATE POLICY "Public sees live listings" ON catalog.listings FOR SELECT
  USING (status = 'live');

CREATE POLICY "Builders see own listings" ON catalog.listings FOR SELECT
  USING (auth.uid() = lister_id);

CREATE POLICY "Builders insert own listings" ON catalog.listings FOR INSERT
  WITH CHECK (auth.uid() = lister_id);

CREATE POLICY "Builders update own listings" ON catalog.listings FOR UPDATE
  USING (auth.uid() = lister_id);

CREATE POLICY "Backoffice full access to listings" ON catalog.listings FOR ALL
  USING (public.is_backoffice());


-- catalog.utilities
CREATE POLICY "Public reads utilities" ON catalog.utilities FOR SELECT
  USING (true);

CREATE POLICY "Backoffice full access to utilities" ON catalog.utilities FOR ALL
  USING (public.is_backoffice());


-- catalog.editorials
CREATE POLICY "Public sees published editorials" ON catalog.editorials FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors see own editorials" ON catalog.editorials FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Authors insert own editorials" ON catalog.editorials FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors update own editorials" ON catalog.editorials FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Backoffice full access to editorials" ON catalog.editorials FOR ALL
  USING (public.is_backoffice());


-- =============================================================================
-- TRUST SCHEMA
-- =============================================================================

-- trust.qa_runs
CREATE POLICY "Builders see QA runs for own listings" ON trust.qa_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM catalog.listings
      WHERE listings.id = trust.qa_runs.listing_id AND listings.lister_id = auth.uid()
    )
  );

CREATE POLICY "Backoffice full access to qa_runs" ON trust.qa_runs FOR ALL
  USING (public.is_backoffice());

-- trust.qa_checks
CREATE POLICY "Builders see QA checks for own listings" ON trust.qa_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trust.qa_runs
      JOIN catalog.listings ON listings.id = qa_runs.listing_id
      WHERE qa_runs.id = trust.qa_checks.run_id AND listings.lister_id = auth.uid()
    )
  );

CREATE POLICY "Backoffice full access to qa_checks" ON trust.qa_checks FOR ALL
  USING (public.is_backoffice());

-- trust.badges
CREATE POLICY "Public reads badges" ON trust.badges FOR SELECT
  USING (true);

CREATE POLICY "Backoffice full access to badges" ON trust.badges FOR ALL
  USING (public.is_backoffice());

-- trust.badge_grants
CREATE POLICY "Public reads badge grants" ON trust.badge_grants FOR SELECT
  USING (true);

CREATE POLICY "Backoffice full access to badge_grants" ON trust.badge_grants FOR ALL
  USING (public.is_backoffice());

-- trust.grace_periods
CREATE POLICY "Builders see grace periods for own listings" ON trust.grace_periods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM catalog.listings
      WHERE listings.id = trust.grace_periods.listing_id AND listings.lister_id = auth.uid()
    )
  );

CREATE POLICY "Backoffice full access to grace_periods" ON trust.grace_periods FOR ALL
  USING (public.is_backoffice());


-- =============================================================================
-- BUILDER SCHEMA
-- =============================================================================

-- builder.lister_profiles
CREATE POLICY "Public reads lister_profiles" ON builder.lister_profiles FOR SELECT
  USING (true);

CREATE POLICY "Owner inserts own lister_profile" ON builder.lister_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Owner updates own lister_profile" ON builder.lister_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Backoffice full access to lister_profiles" ON builder.lister_profiles FOR ALL
  USING (public.is_backoffice());


-- =============================================================================
-- BACKOFFICE SCHEMA
-- =============================================================================

-- backoffice.flags
CREATE POLICY "Backoffice full access to flags" ON backoffice.flags FOR ALL
  USING (public.is_backoffice());

-- backoffice.audit_log
-- INSERT-only for service role (enforced by omitting INSERT policy for users)
-- Backoffice READ-only.
-- NO UPDATE. NO DELETE. EVER.
CREATE POLICY "Backoffice reads audit_log" ON backoffice.audit_log FOR SELECT
  USING (public.is_backoffice());


-- =============================================================================
-- REWARDS SCHEMA
-- =============================================================================

-- rewards.reward_items
CREATE POLICY "Public reads reward_items" ON rewards.reward_items FOR SELECT
  USING (true);

CREATE POLICY "Backoffice full access to reward_items" ON rewards.reward_items FOR ALL
  USING (public.is_backoffice());

-- rewards.vouchers
-- CRITICAL: bearer_id NO UPDATE PATH
CREATE POLICY "Bearers read own vouchers" ON rewards.vouchers FOR SELECT
  USING (auth.uid() = bearer_id);

-- Note: no UPDATE policy for bearers. Only backoffice (or service role) can update.
CREATE POLICY "Backoffice full access to vouchers" ON rewards.vouchers FOR ALL
  USING (public.is_backoffice());

-- rewards.redemptions
CREATE POLICY "Users read own redemptions" ON rewards.redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Backoffice full access to redemptions" ON rewards.redemptions FOR ALL
  USING (public.is_backoffice());

-- rewards.earn_policies
CREATE POLICY "Public reads earn_policies" ON rewards.earn_policies FOR SELECT
  USING (true);

CREATE POLICY "Backoffice full access to earn_policies" ON rewards.earn_policies FOR ALL
  USING (public.is_backoffice());

-- rewards.external_code_pool
CREATE POLICY "Backoffice full access to external_code_pool" ON rewards.external_code_pool FOR ALL
  USING (public.is_backoffice());


-- =============================================================================
-- COMMUNITY SCHEMA
-- =============================================================================

-- community.taster_applications
CREATE POLICY "Applicants read own applications" ON community.taster_applications FOR SELECT
  USING (auth.uid() = applicant_id);

CREATE POLICY "Applicants insert own applications" ON community.taster_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Backoffice full access to taster_applications" ON community.taster_applications FOR ALL
  USING (public.is_backoffice());

-- community.tasters
CREATE POLICY "Public reads tasters" ON community.tasters FOR SELECT
  USING (true);

CREATE POLICY "Backoffice full access to tasters" ON community.tasters FOR ALL
  USING (public.is_backoffice());

-- community.taste_votes
-- Read blocked until quorum.
CREATE POLICY "Tasters read own votes" ON community.taste_votes FOR SELECT
  USING (auth.uid() = taster_id);

CREATE POLICY "Tasters read all votes if quorum reached" ON community.taste_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community.taste_verdicts
      WHERE taste_verdicts.qa_run_id = community.taste_votes.qa_run_id
    )
  );

CREATE POLICY "Tasters insert own votes" ON community.taste_votes FOR INSERT
  WITH CHECK (auth.uid() = taster_id);

CREATE POLICY "Backoffice full access to taste_votes" ON community.taste_votes FOR ALL
  USING (public.is_backoffice());

-- community.taste_verdicts
CREATE POLICY "Public reads taste_verdicts" ON community.taste_verdicts FOR SELECT
  USING (true);

CREATE POLICY "Backoffice full access to taste_verdicts" ON community.taste_verdicts FOR ALL
  USING (public.is_backoffice());


-- =============================================================================
-- PUBLIC SCHEMA
-- =============================================================================

-- public.system_config
CREATE POLICY "Public reads system_config" ON public.system_config FOR SELECT
  USING (true);

CREATE POLICY "Backoffice full access to system_config" ON public.system_config FOR ALL
  USING (public.is_backoffice());
