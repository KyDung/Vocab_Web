-- VocabApp - Supabase Database Schema (Production Reality)
-- Cấu trúc database thực tế đang được sử dụng trong production
-- Supabase PostgreSQL instance

-- =====================================================
-- 1. AUTH.USERS (Supabase Built-in Auth Table)
-- =====================================================
-- Bảng này được Supabase tự quản lý, không cần tạo manually
-- Chỉ liệt kê structure để tham khảo

/*
auth.users (Built-in Supabase Auth)
- id: UUID PRIMARY KEY
- email: TEXT
- display_name: TEXT  
- phone: TEXT
- providers: TEXT
- provider_type: TEXT
- created_at: TIMESTAMPTZ
- last_sign_in_at: TIMESTAMPTZ
- user_metadata: JSONB (Google profile, name, avatar_url)
- app_metadata: JSONB (provider info, etc.)
*/

-- =====================================================
-- 2. OXFORD_WORDS (Core Vocabulary Table)
-- =====================================================
CREATE TABLE IF NOT EXISTS oxford_words (
    id INTEGER PRIMARY KEY,
    term TEXT NOT NULL,
    ipa TEXT,
    pos TEXT,
    meaning TEXT,
    example TEXT,
    rank INTEGER,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes cho oxford_words
CREATE INDEX IF NOT EXISTS idx_oxford_words_term ON oxford_words USING btree (lower(term));
CREATE INDEX IF NOT EXISTS idx_oxford_words_rank ON oxford_words(rank);
CREATE INDEX IF NOT EXISTS idx_oxford_words_meaning ON oxford_words USING gin (to_tsvector('english', meaning));

-- =====================================================
-- 3. USER_WORD_STRINGS (String-based Progress Tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_word_strings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source VARCHAR(50) NOT NULL, -- 'oxford' hoặc 'topics'
    
    -- String format: words separated by single quote (')
    mastered_words TEXT DEFAULT '',
    learning_words TEXT DEFAULT '',
    
    -- Cached counts for performance
    total_mastered INTEGER DEFAULT 0,
    total_learning INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per user per source
    UNIQUE(user_id, source)
);

-- Indexes cho user_word_strings
CREATE INDEX IF NOT EXISTS idx_user_word_strings_user_id ON user_word_strings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_strings_source ON user_word_strings(user_id, source);

-- =====================================================
-- 4. SUPABASE STORAGE BUCKET: avatars
-- =====================================================
-- Bucket được tạo trong Supabase Dashboard
-- Không thể tạo bằng SQL, chỉ liệt kê để tham khảo

/*
Storage Bucket: avatars
- Purpose: User profile pictures
- Max file size: 2MB
- Allowed types: jpg, png, webp
- RLS enabled: users can only access their own files
- Public read: false (private access only)
*/

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS cho user_word_strings
ALTER TABLE user_word_strings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own progress data
CREATE POLICY IF NOT EXISTS "Users can view own word strings" 
    ON user_word_strings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own word strings" 
    ON user_word_strings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own word strings" 
    ON user_word_strings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own word strings" 
    ON user_word_strings FOR DELETE
    USING (auth.uid() = user_id);

-- Oxford words are public (no RLS needed)
-- Anyone can read oxford_words for vocabulary practice

-- =====================================================
-- 6. HELPER FUNCTIONS (Optional)
-- =====================================================

-- Function to get random oxford words (used by /api/game/random)
CREATE OR REPLACE FUNCTION get_random_oxford_words(limit_param INTEGER DEFAULT 10)
RETURNS SETOF oxford_words
LANGUAGE sql
AS $$
    SELECT * FROM oxford_words 
    ORDER BY RANDOM() 
    LIMIT limit_param;
$$;

-- =====================================================
-- 7. NOTES & PRODUCTION DETAILS
-- =====================================================

/*
PRODUCTION NOTES:
1. Chỉ có 3 tables được sử dụng thực tế:
   - auth.users (Supabase built-in)
   - oxford_words (~3000 từ vựng)
   - user_word_strings (progress tracking)

2. String-based storage được chọn thay vì relational approach vì:
   - Performance: O(1) read thay vì JOIN operations
   - Simplicity: Ít bảng hơn, dễ maintain
   - Scalability: Phù hợp với vocab app use case

3. Tables KHÔNG được triển khai (chỉ trong design docs):
   - profiles (thông tin user lưu trong auth.users metadata)
   - topics (hardcoded trong frontend)
   - topic_words (không cần vì topics là hardcoded)
   - user_progress (thay bằng user_word_strings)
   - daily_learning_stats (không cần cho MVP)
   - ai_evaluations (AI feedback không lưu database)

4. API Endpoints sử dụng:
   - /api/oxford -> oxford_words
   - /api/word-status -> user_word_strings
   - /api/stats -> user_word_strings
   - /api/upload-avatar -> Supabase Storage avatars bucket

5. Authentication: Supabase Auth với Google OAuth + Email/Password
6. Client-side processing: Game logic xử lý trên client, không lưu game results
7. AI Integration: Gemini API for evaluation, results không persist
*/