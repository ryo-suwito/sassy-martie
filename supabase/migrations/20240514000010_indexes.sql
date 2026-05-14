-- =============================================================================
-- 010_indexes.sql
-- Every RLS-filtered column indexed. No exceptions.
-- =============================================================================

-- catalog
CREATE INDEX idx_listings_lister_id ON catalog.listings(lister_id);
CREATE INDEX idx_listings_slug ON catalog.listings(slug);
CREATE INDEX idx_listings_status ON catalog.listings(status);
CREATE INDEX idx_listings_qa_status ON catalog.listings(qa_status);

CREATE INDEX idx_editorials_listing_id ON catalog.editorials(listing_id);
CREATE INDEX idx_editorials_author_id ON catalog.editorials(author_id);
CREATE INDEX idx_editorials_status ON catalog.editorials(status);

-- trust
CREATE INDEX idx_qa_runs_listing_id ON trust.qa_runs(listing_id);
CREATE INDEX idx_qa_checks_run_id ON trust.qa_checks(run_id);
CREATE INDEX idx_badge_grants_listing_id ON trust.badge_grants(listing_id);
CREATE INDEX idx_badge_grants_badge_id ON trust.badge_grants(badge_id);
CREATE INDEX idx_badge_grants_revoked_at ON trust.badge_grants(revoked_at);
CREATE INDEX idx_grace_periods_listing_id ON trust.grace_periods(listing_id);
CREATE INDEX idx_grace_periods_closed_at ON trust.grace_periods(closed_at);

-- backoffice
CREATE INDEX idx_flags_listing_id ON backoffice.flags(listing_id);
CREATE INDEX idx_flags_flagged_by ON backoffice.flags(flagged_by);
CREATE INDEX idx_audit_log_actor_id ON backoffice.audit_log(actor_id);
CREATE INDEX idx_audit_log_target_id ON backoffice.audit_log(target_id);
CREATE INDEX idx_audit_log_created_at ON backoffice.audit_log(created_at);

-- community
CREATE INDEX idx_taster_apps_applicant_id ON community.taster_applications(applicant_id);
CREATE INDEX idx_taster_apps_status ON community.taster_applications(status);
CREATE INDEX idx_taste_votes_listing_id ON community.taste_votes(listing_id);
CREATE INDEX idx_taste_votes_taster_id ON community.taste_votes(taster_id);
CREATE INDEX idx_taste_votes_qa_run_id ON community.taste_votes(qa_run_id);

-- rewards
CREATE INDEX idx_vouchers_bearer_id ON rewards.vouchers(bearer_id);
