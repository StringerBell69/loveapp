-- Enable Row Level Security
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

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
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for couples
DROP POLICY IF EXISTS "Users can view their couple" ON couples;
CREATE POLICY "Users can view their couple"
  ON couples FOR SELECT
  USING (
    id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their couple" ON couples;
CREATE POLICY "Users can update their couple"
  ON couples FOR UPDATE
  USING (
    id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert couples" ON couples;
CREATE POLICY "Users can insert couples"
  ON couples FOR INSERT
  WITH CHECK (true);

-- RLS Policies for events
DROP POLICY IF EXISTS "Users can view their couple events" ON events;
CREATE POLICY "Users can view their couple events"
  ON events FOR SELECT
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert events for their couple" ON events;
CREATE POLICY "Users can insert events for their couple"
  ON events FOR INSERT
  WITH CHECK (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update events of their couple" ON events;
CREATE POLICY "Users can update events of their couple"
  ON events FOR UPDATE
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete events of their couple" ON events;
CREATE POLICY "Users can delete events of their couple"
  ON events FOR DELETE
  USING (
    couple_id IN (
      SELECT couple_id FROM user_profiles WHERE id = auth.uid()
    )
  );
