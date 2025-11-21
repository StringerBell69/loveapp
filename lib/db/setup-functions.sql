-- ============================================
-- Setup Functions & Triggers for Notre Calendrier
-- Execute this file in Supabase SQL Editor after running bun db:push
-- ============================================

-- ============================================
-- PHASE 3: Rituals - Streak Calculation
-- ============================================

-- Function: Calculate ritual streak based on frequency
CREATE OR REPLACE FUNCTION calculate_ritual_streak(
  p_ritual_id UUID,
  p_frequency_type VARCHAR
)
RETURNS INT AS $$
DECLARE
  v_streak INT := 0;
  v_last_date DATE;
  v_dates DATE[];
  v_expected_interval INTERVAL;
BEGIN
  -- Determine expected interval based on frequency
  CASE p_frequency_type
    WHEN 'daily' THEN v_expected_interval := INTERVAL '1 day';
    WHEN 'weekly' THEN v_expected_interval := INTERVAL '7 days';
    WHEN 'monthly' THEN v_expected_interval := INTERVAL '30 days';
    WHEN 'yearly' THEN v_expected_interval := INTERVAL '365 days';
    ELSE v_expected_interval := INTERVAL '1 day';
  END CASE;

  -- Get all completion dates for this ritual, sorted DESC
  SELECT ARRAY_AGG(completed_date ORDER BY completed_date DESC)
  INTO v_dates
  FROM ritual_completions
  WHERE ritual_id = p_ritual_id;

  -- If no completions, streak is 0
  IF v_dates IS NULL OR array_length(v_dates, 1) = 0 THEN
    RETURN 0;
  END IF;

  -- Check if most recent completion is within expected interval from today
  v_last_date := v_dates[1];
  IF v_last_date < (CURRENT_DATE - v_expected_interval) THEN
    RETURN 0;
  END IF;

  -- Count consecutive completions
  v_streak := 1;
  FOR i IN 2..array_length(v_dates, 1) LOOP
    -- Check if this date is within expected interval from previous date
    IF v_dates[i] >= (v_dates[i-1] - v_expected_interval - INTERVAL '1 day') THEN
      v_streak := v_streak + 1;
    ELSE
      EXIT; -- Break streak
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- Trigger function: Update ritual streak after completion
CREATE OR REPLACE FUNCTION update_ritual_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_ritual RECORD;
  v_frequency VARCHAR;
  v_new_streak INT;
BEGIN
  -- Get ritual info
  SELECT * INTO v_ritual FROM rituals WHERE id = NEW.ritual_id;
  v_frequency := v_ritual.frequency_type;

  -- Calculate new streak
  v_new_streak := calculate_ritual_streak(NEW.ritual_id, v_frequency);

  -- Update ritual
  UPDATE rituals
  SET
    last_done = NEW.completed_date,
    streak_current = v_new_streak,
    streak_longest = GREATEST(streak_longest, v_new_streak),
    updated_at = NOW()
  WHERE id = NEW.ritual_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS tr_ritual_completion_update_streak ON ritual_completions;
CREATE TRIGGER tr_ritual_completion_update_streak
AFTER INSERT ON ritual_completions
FOR EACH ROW
EXECUTE FUNCTION update_ritual_streak();

-- ============================================
-- PHASE 4: Daily Questions - Generation
-- ============================================

-- Function: Generate daily question (avoiding recent categories and questions)
CREATE OR REPLACE FUNCTION generate_daily_question()
RETURNS VOID AS $$
DECLARE
  v_question_id UUID;
  v_last_categories VARCHAR[];
BEGIN
  -- Check if question already exists for today
  IF EXISTS (SELECT 1 FROM question_of_the_day WHERE date = CURRENT_DATE) THEN
    RETURN;
  END IF;

  -- Get last 7 categories used
  SELECT ARRAY_AGG(dq.category)
  INTO v_last_categories
  FROM question_of_the_day qotd
  JOIN daily_questions dq ON qotd.question_id = dq.id
  WHERE qotd.date >= CURRENT_DATE - INTERVAL '7 days'
  ORDER BY qotd.date DESC
  LIMIT 7;

  -- Select a random question avoiding:
  -- 1. Questions used in the last 60 days
  -- 2. Categories used in the last 7 days
  SELECT id INTO v_question_id
  FROM daily_questions
  WHERE
    is_active = TRUE
    AND id NOT IN (
      SELECT question_id
      FROM question_of_the_day
      WHERE date >= CURRENT_DATE - INTERVAL '60 days'
    )
    AND (v_last_categories IS NULL OR category != ALL(v_last_categories))
  ORDER BY RANDOM()
  LIMIT 1;

  -- Fallback: if no question found, just pick any active question not used recently
  IF v_question_id IS NULL THEN
    SELECT id INTO v_question_id
    FROM daily_questions
    WHERE
      is_active = TRUE
      AND id NOT IN (
        SELECT question_id
        FROM question_of_the_day
        WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      )
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;

  -- Insert question of the day
  IF v_question_id IS NOT NULL THEN
    INSERT INTO question_of_the_day (question_id, date)
    VALUES (v_question_id, CURRENT_DATE);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PHASE 4: Gratitude - Streak Calculation
-- ============================================

-- Function: Get gratitude streak for a user
CREATE OR REPLACE FUNCTION get_gratitude_streak(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_streak INT := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE;
BEGIN
  -- Start from yesterday (today doesn't count until tomorrow)
  v_check_date := v_current_date - INTERVAL '1 day';

  -- Loop backwards checking each day
  LOOP
    -- Check if gratitude exists for this date
    IF EXISTS (
      SELECT 1 FROM gratitude_entries
      WHERE user_id = p_user_id AND date = v_check_date
    ) THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - INTERVAL '1 day';
    ELSE
      EXIT; -- Break streak
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PHASE 5: Statistics - Complete Couple Stats
-- ============================================

-- Function: Get comprehensive statistics for a couple
CREATE OR REPLACE FUNCTION get_couple_stats(p_couple_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    -- Events
    'totalEvents', (
      SELECT COUNT(*) FROM events WHERE couple_id = p_couple_id
    ),
    'upcomingEvents', (
      SELECT COUNT(*) FROM events
      WHERE couple_id = p_couple_id AND event_date >= CURRENT_DATE
    ),
    'eventsThisMonth', (
      SELECT COUNT(*) FROM events
      WHERE couple_id = p_couple_id
      AND EXTRACT(MONTH FROM event_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM event_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    
    -- Memories
    'totalMemories', (
      SELECT COUNT(*) FROM memories WHERE couple_id = p_couple_id
    ),
    'memoriesThisYear', (
      SELECT COUNT(*) FROM memories
      WHERE couple_id = p_couple_id
      AND EXTRACT(YEAR FROM memory_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    
    -- Messages
    'totalMessages', (
      SELECT COUNT(*) FROM love_notes WHERE couple_id = p_couple_id
    ),
    'messagesThisWeek', (
      SELECT COUNT(*) FROM love_notes
      WHERE couple_id = p_couple_id
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    ),
    
    -- Bucket List
    'totalBucketItems', (
      SELECT COUNT(*) FROM bucket_list_items WHERE couple_id = p_couple_id
    ),
    'completedBucketItems', (
      SELECT COUNT(*) FROM bucket_list_items
      WHERE couple_id = p_couple_id AND status = 'done'
    ),
    'bucketCompletionRate', (
      SELECT CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE status = 'done')::FLOAT / COUNT(*) * 100)::NUMERIC, 2)
      END
      FROM bucket_list_items WHERE couple_id = p_couple_id
    ),
    
    -- Rituals
    'totalRituals', (
      SELECT COUNT(*) FROM rituals WHERE couple_id = p_couple_id
    ),
    'activeStreaks', (
      SELECT COUNT(*) FROM rituals
      WHERE couple_id = p_couple_id AND streak_current > 0
    ),
    'longestStreak', (
      SELECT COALESCE(MAX(streak_longest), 0)
      FROM rituals WHERE couple_id = p_couple_id
    ),
    
    -- Moods
    'moodLogsThisMonth', (
      SELECT COUNT(*) FROM daily_moods
      WHERE couple_id = p_couple_id
      AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ),
    'moodSynchronyRate', (
      SELECT CASE
        WHEN COUNT(DISTINCT dm.date) = 0 THEN 0
        ELSE ROUND((
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1 FROM daily_moods dm2
              WHERE dm2.couple_id = p_couple_id
              AND dm2.date = dm.date
              AND dm2.user_id != dm.user_id
            )
          )::FLOAT / COUNT(DISTINCT dm.date) * 100
        )::NUMERIC, 2)
      END
      FROM daily_moods dm
      WHERE couple_id = p_couple_id
      AND date >= CURRENT_DATE - INTERVAL '30 days'
    ),
    
    -- Gratitude
    'totalGratitudes', (
      SELECT COUNT(*) FROM gratitude_entries WHERE couple_id = p_couple_id
    ),
    'sharedGratitudesCount', (
      SELECT COUNT(*) FROM shared_gratitude WHERE couple_id = p_couple_id
    ),
    
    -- Questions
    'totalQuestionsAnswered', (
      SELECT COUNT(*) FROM question_answers WHERE couple_id = p_couple_id
    ),
    'questionsAnsweredTogether', (
      SELECT COUNT(DISTINCT qa.question_of_day_id)
      FROM question_answers qa
      WHERE qa.couple_id = p_couple_id
      AND EXISTS (
        SELECT 1 FROM question_answers qa2
        WHERE qa2.question_of_day_id = qa.question_of_day_id
        AND qa2.couple_id = p_couple_id
        AND qa2.user_id != qa.user_id
      )
    ),
    
    -- Time together
    'daysSinceCreation', (
      SELECT EXTRACT(DAY FROM (CURRENT_DATE - created_at::DATE))
      FROM couples WHERE id = p_couple_id
    )
  ) INTO v_stats;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PHASE 5: Onboarding - Milestone Tracking
-- ============================================

-- Function: Update onboarding milestones automatically
CREATE OR REPLACE FUNCTION update_onboarding_milestone()
RETURNS TRIGGER AS $$
BEGIN
  -- Determine which milestone to update based on table
  IF TG_TABLE_NAME = 'events' THEN
    UPDATE onboarding_progress
    SET has_created_first_event = TRUE, updated_at = NOW()
    WHERE user_id = NEW.created_by;

  ELSIF TG_TABLE_NAME = 'memories' THEN
    UPDATE onboarding_progress
    SET has_uploaded_first_memory = TRUE, updated_at = NOW()
    WHERE user_id = NEW.created_by;

  ELSIF TG_TABLE_NAME = 'love_notes' THEN
    UPDATE onboarding_progress
    SET has_sent_first_message = TRUE, updated_at = NOW()
    WHERE user_id = NEW.from_user_id;

  ELSIF TG_TABLE_NAME = 'bucket_list_items' THEN
    UPDATE onboarding_progress
    SET has_added_bucket_list_item = TRUE, updated_at = NOW()
    WHERE user_id = NEW.created_by;

  ELSIF TG_TABLE_NAME = 'daily_moods' THEN
    UPDATE onboarding_progress
    SET has_logged_mood = TRUE, updated_at = NOW()
    WHERE user_id = NEW.user_id;

  ELSIF TG_TABLE_NAME = 'question_answers' THEN
    UPDATE onboarding_progress
    SET has_answered_question = TRUE, updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for onboarding milestones
DROP TRIGGER IF EXISTS tr_event_milestone ON events;
CREATE TRIGGER tr_event_milestone
AFTER INSERT ON events
FOR EACH ROW EXECUTE FUNCTION update_onboarding_milestone();

DROP TRIGGER IF EXISTS tr_memory_milestone ON memories;
CREATE TRIGGER tr_memory_milestone
AFTER INSERT ON memories
FOR EACH ROW EXECUTE FUNCTION update_onboarding_milestone();

DROP TRIGGER IF EXISTS tr_message_milestone ON love_notes;
CREATE TRIGGER tr_message_milestone
AFTER INSERT ON love_notes
FOR EACH ROW EXECUTE FUNCTION update_onboarding_milestone();

DROP TRIGGER IF EXISTS tr_bucket_milestone ON bucket_list_items;
CREATE TRIGGER tr_bucket_milestone
AFTER INSERT ON bucket_list_items
FOR EACH ROW EXECUTE FUNCTION update_onboarding_milestone();

DROP TRIGGER IF EXISTS tr_mood_milestone ON daily_moods;
CREATE TRIGGER tr_mood_milestone
AFTER INSERT ON daily_moods
FOR EACH ROW EXECUTE FUNCTION update_onboarding_milestone();

DROP TRIGGER IF EXISTS tr_question_milestone ON question_answers;
CREATE TRIGGER tr_question_milestone
AFTER INSERT ON question_answers
FOR EACH ROW EXECUTE FUNCTION update_onboarding_milestone();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_couple_date ON events(couple_id, event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- Memories indexes
CREATE INDEX IF NOT EXISTS idx_memories_couple_date ON memories(couple_id, memory_date);
CREATE INDEX IF NOT EXISTS idx_memories_created_by ON memories(created_by);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_love_notes_couple_created ON love_notes(couple_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_love_notes_to_user ON love_notes(to_user_id, is_read);

-- Bucket list indexes
CREATE INDEX IF NOT EXISTS idx_bucket_list_couple ON bucket_list_items(couple_id);
CREATE INDEX IF NOT EXISTS idx_bucket_list_status ON bucket_list_items(couple_id, status);

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_couple ON wishlist_items(couple_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);

-- Rituals indexes
CREATE INDEX IF NOT EXISTS idx_rituals_couple ON rituals(couple_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_ritual ON ritual_completions(ritual_id, completed_date DESC);

-- Moods indexes
CREATE INDEX IF NOT EXISTS idx_moods_couple_date ON daily_moods(couple_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_moods_user_date ON daily_moods(user_id, date);

-- Gratitude indexes
CREATE INDEX IF NOT EXISTS idx_gratitude_couple_date ON gratitude_entries(couple_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gratitude_user_date ON gratitude_entries(user_id, date);

-- Questions indexes
CREATE INDEX IF NOT EXISTS idx_question_of_day_date ON question_of_the_day(date DESC);
CREATE INDEX IF NOT EXISTS idx_question_answers_qotd ON question_answers(question_of_day_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_couple ON question_answers(couple_id, created_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_couple_created ON analytics_events(couple_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);

-- Backups indexes
CREATE INDEX IF NOT EXISTS idx_backups_couple_created ON backups(couple_id, created_at DESC);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ All functions, triggers, and indexes created successfully!';
  RAISE NOTICE '📊 Next steps:';
  RAISE NOTICE '   1. Apply RLS policies from rls-policies.sql';
  RAISE NOTICE '   2. Seed questions from seed-questions.sql';
  RAISE NOTICE '   3. Test with: SELECT generate_daily_question();';
END $$;
