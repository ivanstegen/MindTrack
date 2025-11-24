-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  text text NOT NULL,
  mood_label text,
  mood_score int CHECK (mood_score >= 1 AND mood_score <= 10),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, entry_date)
);

-- Habits Table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  streak int DEFAULT 0,
  best_streak int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habit History Table
CREATE TABLE IF NOT EXISTS habit_history (
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE,
  date date NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (habit_id, date)
);

-- Challenges Table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  status text CHECK (status IN ('active', 'completed')) DEFAULT 'active',
  challenge_type text DEFAULT 'mood_based',
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for journal_entries
CREATE POLICY "Users can view their own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for habits
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for habit_history
CREATE POLICY "Users can view their own habit history"
  ON habit_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_history.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own habit history"
  ON habit_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_history.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own habit history"
  ON habit_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_history.habit_id
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own habit history"
  ON habit_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_history.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- RLS Policies for challenges
CREATE POLICY "Users can view their own challenges"
  ON challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
  ON challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges"
  ON challenges FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_history_habit_date ON habit_history(habit_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_user_status ON challenges(user_id, status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
