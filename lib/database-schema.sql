-- User Progress Tracking Schema
-- Bảng theo dõi tiến độ học từ vựng của người dùng

CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word VARCHAR(255) NOT NULL,
  word_meaning TEXT,
  source VARCHAR(50) NOT NULL, -- 'oxford' hoặc 'topics'
  topic VARCHAR(100), -- null cho oxford, tên topic cho topics
  is_mastered BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  learned_date DATE DEFAULT CURRENT_DATE,
  first_attempt_date TIMESTAMP DEFAULT NOW(),
  last_attempt_date TIMESTAMP DEFAULT NOW(),
  ai_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Đảm bảo mỗi user chỉ có 1 record cho mỗi từ trong mỗi source
  UNIQUE(user_id, word, source)
);

-- Index để tối ưu query
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_learned_date ON user_progress(learned_date);
CREATE INDEX idx_user_progress_mastered ON user_progress(user_id, is_mastered);
CREATE INDEX idx_user_progress_source ON user_progress(user_id, source);

-- Bảng thống kê daily learning
CREATE TABLE daily_learning_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  words_learned INTEGER DEFAULT 0,
  words_mastered INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Index cho daily stats
CREATE INDEX idx_daily_stats_user_date ON daily_learning_stats(user_id, date);

-- Function để tự động cập nhật daily stats
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Cập nhật hoặc tạo mới daily stats
  INSERT INTO daily_learning_stats (user_id, date, words_learned, words_mastered, total_attempts)
  VALUES (
    NEW.user_id, 
    NEW.learned_date,
    1,
    CASE WHEN NEW.is_mastered THEN 1 ELSE 0 END,
    NEW.attempts
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    words_learned = daily_learning_stats.words_learned + 
      CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
    words_mastered = daily_learning_stats.words_mastered + 
      CASE WHEN NEW.is_mastered AND NOT OLD.is_mastered THEN 1 
           WHEN NOT NEW.is_mastered AND OLD.is_mastered THEN -1 
           ELSE 0 END,
    total_attempts = daily_learning_stats.total_attempts + 
      (NEW.attempts - COALESCE(OLD.attempts, 0)),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger để tự động cập nhật daily stats
CREATE TRIGGER trigger_update_daily_stats
  AFTER INSERT OR UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stats();

-- Row Level Security (RLS)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_learning_stats ENABLE ROW LEVEL SECURITY;

-- Policy cho user_progress
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy cho daily_learning_stats
CREATE POLICY "Users can view their own daily stats"
  ON daily_learning_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily stats"
  ON daily_learning_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats"
  ON daily_learning_stats FOR UPDATE
  USING (auth.uid() = user_id);