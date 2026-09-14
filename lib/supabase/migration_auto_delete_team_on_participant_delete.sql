-- ==============================================================================
-- NOVA FORGE MIGRATION: Auto-Delete Team When Participant Is Removed
-- ==============================================================================
-- Problem: When deleting a player from the `participants` table (via Supabase Table
-- Editor or API), the team row in `teams` was left orphaned with 0 or 1 player.
--
-- Solution: This trigger ensures that deleting ANY participant of a squad automatically
-- deletes the entire team row in `teams` (which also cascades to clean up the rest of the squad).
-- ==============================================================================

CREATE OR REPLACE FUNCTION delete_team_on_participant_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent infinite recursion when deletion was already triggered by cascade from `teams`
  IF pg_trigger_depth() <= 1 THEN
    DELETE FROM teams WHERE team_id = OLD.team_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if already exists to ensure idempotency
DROP TRIGGER IF EXISTS trg_delete_team_on_participant_delete ON participants;

-- Attach trigger to participants table
CREATE TRIGGER trg_delete_team_on_participant_delete
AFTER DELETE ON participants
FOR EACH ROW
EXECUTE FUNCTION delete_team_on_participant_delete();

-- Also clean up any existing orphaned teams that have fewer than 2 participants (optional health check)
-- DELETE FROM teams WHERE team_id NOT IN (SELECT team_id FROM participants GROUP BY team_id HAVING COUNT(*) >= 2);
