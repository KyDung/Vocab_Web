-- Supabase Setup Script cho Vocab Learner
-- Chạy script này trong Supabase SQL Editor

-- 1. Tạo bảng profiles (mở rộng auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    avatar_url TEXT,
    locale TEXT DEFAULT 'vi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tạo bảng topics
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tạo bảng oxford_words
CREATE TABLE IF NOT EXISTS oxford_words (
    id INTEGER PRIMARY KEY,
    term TEXT NOT NULL,
    ipa TEXT,
    pos TEXT,
    meaning TEXT,
    example TEXT,
    rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tạo bảng topic_words (liên kết N-N)
CREATE TABLE IF NOT EXISTS topic_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    word_id INTEGER REFERENCES oxford_words(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(topic_id, word_id)
);

-- 5. Tạo bảng word_status
CREATE TABLE IF NOT EXISTS word_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    oxford_word_id INTEGER REFERENCES oxford_words(id),
    status TEXT CHECK (status IN ('learning', 'mastered', 'ignored')) DEFAULT 'learning',
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, oxford_word_id)
);

-- 6. Tạo bảng progress_attempts
CREATE TABLE IF NOT EXISTS progress_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_type TEXT CHECK (game_type IN ('flashcard', 'quiz', 'typing')) NOT NULL,
    total INTEGER DEFAULT 0 CHECK (total >= 0),
    correct INTEGER DEFAULT 0 CHECK (correct >= 0),
    duration_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tạo bảng ai_evaluations
CREATE TABLE IF NOT EXISTS ai_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    eval_type TEXT CHECK (eval_type IN ('pronunciation', 'writing')) NOT NULL,
    input_text TEXT,
    input_audio_url TEXT,
    score NUMERIC(5,2),
    feedback JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tạo indexes để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_oxford_words_term ON oxford_words(LOWER(term));
CREATE INDEX IF NOT EXISTS idx_oxford_words_rank ON oxford_words(rank);
CREATE INDEX IF NOT EXISTS idx_topic_words_topic ON topic_words(topic_id);
CREATE INDEX IF NOT EXISTS idx_word_status_user ON word_status(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_attempts_user ON progress_attempts(user_id, created_at);

-- 9. Insert sample data
INSERT INTO topics (slug, title, description) VALUES
('basics', 'Basics', 'Basic English vocabulary for beginners'),
('daily-life', 'Daily Life', 'Common words used in daily life'),
('work', 'Work & Career', 'Professional and workplace vocabulary'),
('travel', 'Travel & Transport', 'Words related to travel and transportation'),
('food', 'Food & Drink', 'Vocabulary about food, cooking, and dining')
ON CONFLICT (slug) DO NOTHING;

-- 10. Insert sample Oxford words
INSERT INTO oxford_words (id, term, ipa, pos, meaning, example, rank) VALUES
(1, 'hello', '/həˈloʊ/', 'exclamation', 'used as a greeting', 'Hello, how are you?', 1),
(2, 'world', '/wɜːrld/', 'noun', 'the earth and all the people and places on it', 'We live in a beautiful world.', 2),
(3, 'good', '/ɡʊd/', 'adjective', 'having positive qualities; satisfactory', 'This is a good book.', 3),
(4, 'time', '/taɪm/', 'noun', 'the indefinite continued progress of existence', 'What time is it?', 4),
(5, 'people', '/ˈpiːpl/', 'noun', 'human beings in general', 'Many people like music.', 5)
ON CONFLICT (id) DO NOTHING;

-- 11. Link words to topics
INSERT INTO topic_words (topic_id, word_id) VALUES
(1, 1), (1, 2), (1, 3), -- basics
(2, 3), (2, 4), (2, 5)  -- daily-life
ON CONFLICT (topic_id, word_id) DO NOTHING;

-- 12. Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_evaluations ENABLE ROW LEVEL SECURITY;

-- 13. Create RLS Policies
-- Profiles: users can read and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Word status: users can only access their own word status
CREATE POLICY "Users can view own word status" ON word_status
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own word status" ON word_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own word status" ON word_status
    FOR UPDATE USING (auth.uid() = user_id);

-- Progress attempts: users can only access their own attempts
CREATE POLICY "Users can view own progress attempts" ON progress_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress attempts" ON progress_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI evaluations: users can only access their own evaluations
CREATE POLICY "Users can view own AI evaluations" ON ai_evaluations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI evaluations" ON ai_evaluations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 14. Allow public read access to oxford_words and topics
ALTER TABLE oxford_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view oxford words" ON oxford_words
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view topics" ON topics
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view topic words" ON topic_words
    FOR SELECT USING (true);

-- 15. Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Create trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Completed! Database is ready for Vocab Learner app.