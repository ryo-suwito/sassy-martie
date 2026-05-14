-- =============================================================================
-- 012_triggers.sql
-- Database-level triggers for updated_at, lifecycle events, and sync operations.
-- Never embed business logic in app code if a DB trigger can own it.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. updated_at Trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_catalog_listings
  BEFORE UPDATE ON catalog.listings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_updated_at_system_config
  BEFORE UPDATE ON public.system_config
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. New User Signup -> Lister Profile Auto-creation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION builder.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- We assume standard Supabase auth metadata is provided during signup
  INSERT INTO builder.lister_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE builder.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. Taster Auto-creation on Application Approval
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION community.handle_taster_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO community.tasters (id, application_id, status)
    VALUES (NEW.applicant_id, NEW.id, 'active')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_taster_application_approved
  AFTER UPDATE ON community.taster_applications
  FOR EACH ROW EXECUTE PROCEDURE community.handle_taster_approval();

-- ---------------------------------------------------------------------------
-- 4. Badge Revoke Cascade
-- When a listing goes failing or revoked, strip active badges
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trust.cascade_badge_revoke()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_id uuid;
BEGIN
  IF NEW.qa_status IN ('failing', 'revoked') AND OLD.qa_status NOT IN ('failing', 'revoked') THEN
    -- Try to get the actor from the application context setting, fallback to null (system)
    BEGIN
      v_actor_id := current_setting('app.actor_id', true)::uuid;
    EXCEPTION WHEN OTHERS THEN
      v_actor_id := NULL;
    END;

    UPDATE trust.badge_grants
    SET revoked_at = now(), revoked_by = v_actor_id
    WHERE listing_id = NEW.id AND revoked_at IS NULL;
    
    -- Record in audit log
    INSERT INTO backoffice.audit_log (actor_id, action, target_type, target_id, payload)
    VALUES (
      v_actor_id, 
      'badge.bulk_revoke', 
      'listing', 
      NEW.id, 
      jsonb_build_object('reason', 'qa_status_' || NEW.qa_status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_listing_failing_revoke_badges
  AFTER UPDATE ON catalog.listings
  FOR EACH ROW EXECUTE PROCEDURE trust.cascade_badge_revoke();
