-- Enable Row Level Security
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ritual_completions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TRIGGER: Auto-create user profile on signup
-- ============================================
-- This function creates a user_profiles row automatically when a new user signs up
-- This avoids RLS issues when trying to create profile from client
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- HELPER FUNCTION: Get user's couple_id (bypasses RLS)
-- ============================================
-- This function prevents infinite recursion in RLS policies
-- by using SECURITY DEFINER to bypass RLS when checking couple_id
CREATE OR REPLACE FUNCTION public.get_user_couple_id()
RETURNS UUID AS $$
  SELECT couple_id FROM public.user_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to generate unique couple code
CREATE OR REPLACE FUNCTION generate_couple_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result VARCHAR(6) := '';
  i INT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    SELECT EXISTS(SELECT 1 FROM couples WHERE couple_code = result) INTO code_exists;

    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on events table
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view profiles in their couple" ON user_profiles;
CREATE POLICY "Users can view profiles in their couple"
  ON user_profiles FOR SELECT
  USING (couple_id = public.get_user_couple_id());

-- RLS Policies for couples
DROP POLICY IF EXISTS "Users can view their couple" ON couples;
CREATE POLICY "Users can view their couple"
  ON couples FOR SELECT
  USING (id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can view couples without members" ON couples;
CREATE POLICY "Users can view couples without members"
  ON couples FOR SELECT
  USING (
    NOT EXISTS (
      SELECT 1 FROM public.user_profiles WHERE couple_id = couples.id
    )
  );

DROP POLICY IF EXISTS "Users can update their couple" ON couples;
CREATE POLICY "Users can update their couple"
  ON couples FOR UPDATE
  USING (id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can insert couples" ON couples;
CREATE POLICY "Users can insert couples"
  ON couples FOR INSERT
  WITH CHECK (true);

-- RLS Policies for events
DROP POLICY IF EXISTS "Users can view their couple events" ON events;
CREATE POLICY "Users can view their couple events"
  ON events FOR SELECT
  USING (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can insert events for their couple" ON events;
CREATE POLICY "Users can insert events for their couple"
  ON events FOR INSERT
  WITH CHECK (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can update events of their couple" ON events;
CREATE POLICY "Users can update events of their couple"
  ON events FOR UPDATE
  USING (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can delete events of their couple" ON events;
CREATE POLICY "Users can delete events of their couple"
  ON events FOR DELETE
  USING (couple_id = public.get_user_couple_id());

-- Trigger on memories table
DROP TRIGGER IF EXISTS update_memories_updated_at ON memories;
CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for memories
DROP POLICY IF EXISTS "Users can view their couple memories" ON memories;
CREATE POLICY "Users can view their couple memories"
  ON memories FOR SELECT
  USING (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can insert memories for their couple" ON memories;
CREATE POLICY "Users can insert memories for their couple"
  ON memories FOR INSERT
  WITH CHECK (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can update memories of their couple" ON memories;
CREATE POLICY "Users can update memories of their couple"
  ON memories FOR UPDATE
  USING (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can delete memories of their couple" ON memories;
CREATE POLICY "Users can delete memories of their couple"
  ON memories FOR DELETE
  USING (couple_id = public.get_user_couple_id());

-- RLS Policies for love_notes
DROP POLICY IF EXISTS "Users can view their couple messages" ON love_notes;
CREATE POLICY "Users can view their couple messages"
  ON love_notes FOR SELECT
  USING (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can insert messages for their couple" ON love_notes;
CREATE POLICY "Users can insert messages for their couple"
  ON love_notes FOR INSERT
  WITH CHECK (
    couple_id = public.get_user_couple_id()
    AND from_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update messages in their couple" ON love_notes;
CREATE POLICY "Users can update messages in their couple"
  ON love_notes FOR UPDATE
  USING (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can delete their own messages" ON love_notes;
CREATE POLICY "Users can delete their own messages"
  ON love_notes FOR DELETE
  USING (
    from_user_id = auth.uid()
  );

-- Triggers for Phase 3 tables
DROP TRIGGER IF EXISTS update_bucket_list_updated_at ON bucket_list_items;
CREATE TRIGGER update_bucket_list_updated_at
  BEFORE UPDATE ON bucket_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wishlist_updated_at ON wishlist_items;
CREATE TRIGGER update_wishlist_updated_at
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rituals_updated_at ON rituals;
CREATE TRIGGER update_rituals_updated_at
  BEFORE UPDATE ON rituals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate ritual streak
CREATE OR REPLACE FUNCTION calculate_ritual_streak(p_ritual_id UUID, p_frequency_type VARCHAR)
RETURNS INT AS $$
DECLARE
  v_streak INT := 0;
  v_last_date DATE;
  v_expected_date DATE;
  v_completion_dates DATE[];
BEGIN
  -- Get all completion dates ordered desc
  SELECT ARRAY_AGG(completed_date ORDER BY completed_date DESC)
  INTO v_completion_dates
  FROM ritual_completions
  WHERE ritual_id = p_ritual_id;
  
  -- If no completions, return 0
  IF v_completion_dates IS NULL OR array_length(v_completion_dates, 1) = 0 THEN
    RETURN 0;
  END IF;
  
  -- Simple streak calculation (consecutive days for daily, weeks for weekly, etc.)
  -- For now, simplified version - can be enhanced based on frequency_type
  v_last_date := v_completion_dates[1];
  v_streak := 1;
  
  FOR i IN 2..array_length(v_completion_dates, 1) LOOP
    v_expected_date := v_last_date - INTERVAL '1 day';
    
    IF p_frequency_type = 'daily' THEN
      v_expected_date := v_last_date - INTERVAL '1 day';
    ELSIF p_frequency_type = 'weekly' THEN
      v_expected_date := v_last_date - INTERVAL '7 days';
    ELSIF p_frequency_type = 'monthly' THEN
      v_expected_date := v_last_date - INTERVAL '1 month';
    ELSIF p_frequency_type = 'yearly' THEN
      v_expected_date := v_last_date - INTERVAL '1 year';
    ELSE
      v_expected_date := v_last_date - INTERVAL '1 day';
    END IF;
    
    IF v_completion_dates[i] = v_expected_date::DATE THEN
      v_streak := v_streak + 1;
      v_last_date := v_completion_dates[i];
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_streak;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ritual streak after completion
CREATE OR REPLACE FUNCTION update_ritual_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_frequency_type VARCHAR;
  v_new_streak INT;
BEGIN
  -- Get frequency type
  SELECT frequency_type INTO v_frequency_type
  FROM rituals
  WHERE id = NEW.ritual_id;
  
  -- Calculate new streak
  v_new_streak := calculate_ritual_streak(NEW.ritual_id, v_frequency_type);
  
  -- Update ritual
  UPDATE rituals
  SET 
    last_done = NEW.completed_date,
    streak_current = v_new_streak,
    streak_longest = GREATEST(streak_longest, v_new_streak)
  WHERE id = NEW.ritual_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_ritual_completion ON ritual_completions;
CREATE TRIGGER after_ritual_completion
  AFTER INSERT ON ritual_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_ritual_streak();

-- RLS Policies for bucket_list_items
DROP POLICY IF EXISTS "Users can view their couple bucket list" ON bucket_list_items;
CREATE POLICY "Users can view their couple bucket list"
  ON bucket_list_items FOR SELECT
  USING (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can insert bucket items for their couple" ON bucket_list_items;
CREATE POLICY "Users can insert bucket items for their couple"
  ON bucket_list_items FOR INSERT
  WITH CHECK (
    couple_id = public.get_user_couple_id()
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update bucket items in their couple" ON bucket_list_items;
CREATE POLICY "Users can update bucket items in their couple"
  ON bucket_list_items FOR UPDATE
  USING (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can delete bucket items they created" ON bucket_list_items;
CREATE POLICY "Users can delete bucket items they created"
  ON bucket_list_items FOR DELETE
  USING (created_by = auth.uid());

-- RLS Policies for wishlist_items
DROP POLICY IF EXISTS "Users can view wishlists in their couple" ON wishlist_items;
CREATE POLICY "Users can view wishlists in their couple"
  ON wishlist_items FOR SELECT
  USING (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can insert items to their own wishlist" ON wishlist_items;
CREATE POLICY "Users can insert items to their own wishlist"
  ON wishlist_items FOR INSERT
  WITH CHECK (
    couple_id = public.get_user_couple_id()
    AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own wishlist items" ON wishlist_items;
CREATE POLICY "Users can update their own wishlist items"
  ON wishlist_items FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Partner can mark items as purchased" ON wishlist_items;
CREATE POLICY "Partner can mark items as purchased"
  ON wishlist_items FOR UPDATE
  USING (
    couple_id = public.get_user_couple_id()
    AND user_id != auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON wishlist_items;
CREATE POLICY "Users can delete their own wishlist items"
  ON wishlist_items FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for rituals
DROP POLICY IF EXISTS "Users can view their couple rituals" ON rituals;
CREATE POLICY "Users can view their couple rituals"
  ON rituals FOR SELECT
  USING (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can insert rituals for their couple" ON rituals;
CREATE POLICY "Users can insert rituals for their couple"
  ON rituals FOR INSERT
  WITH CHECK (
    couple_id = public.get_user_couple_id()
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update rituals in their couple" ON rituals;
CREATE POLICY "Users can update rituals in their couple"
  ON rituals FOR UPDATE
  USING (couple_id = public.get_user_couple_id());

DROP POLICY IF EXISTS "Users can delete rituals they created" ON rituals;
CREATE POLICY "Users can delete rituals they created"
  ON rituals FOR DELETE
  USING (created_by = auth.uid());

-- RLS Policies for ritual_completions
DROP POLICY IF EXISTS "Users can view completions of their couple rituals" ON ritual_completions;
CREATE POLICY "Users can view completions of their couple rituals"
  ON ritual_completions FOR SELECT
  USING (
    ritual_id IN (
      SELECT id FROM rituals WHERE couple_id = public.get_user_couple_id()
    )
  );

DROP POLICY IF EXISTS "Users can insert completions for their couple rituals" ON ritual_completions;
CREATE POLICY "Users can insert completions for their couple rituals"
  ON ritual_completions FOR INSERT
  WITH CHECK (
    ritual_id IN (
      SELECT id FROM rituals WHERE couple_id = public.get_user_couple_id()
    )
    AND completed_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete their own completions" ON ritual_completions;
CREATE POLICY "Users can delete their own completions"
  ON ritual_completions FOR DELETE
  USING (completed_by = auth.uid());
