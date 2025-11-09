-- VocabApp - Supabase String-based Schema (Production Implementation)
-- Schema thực tế được sử dụng trong production với string-based progress tracking
-- Supabase PostgreSQL implementation

-- =====================================================
-- CÁCH THỨC HOẠT ĐỘNG CỦA STRING-BASED APPROACH
-- =====================================================

/*
Thay vì lưu mỗi từ vựng như một row riêng biệt (relational approach),
chúng ta lưu tất cả các từ của user trong một string, ngăn cách bởi dấu nháy đơn (').

Ví dụ thực tế:
- user_id: 550e8400-e29b-41d4-a716-446655440000
- source: "oxford"  
- mastered_words: "cat'dog'house'tree'book"
- learning_words: "computer'phone'table'window'door"

Advantages:
1. Performance: 1 query thay vì N queries
2. Simplicity: Ít complexity hơn, dễ maintain
3. JSON-like: Phù hợp với modern web apps
4. Supabase-friendly: Ít RLS policies, ít joins

Disadvantages:
1. String parsing overhead (client-side)
2. Không thể query từng từ riêng lẻ
3. Limited relational operations
*/

-- =====================================================
-- 1. CORE TABLE: user_word_strings
-- =====================================================

CREATE TABLE IF NOT EXISTS user_word_strings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source VARCHAR(50) NOT NULL, -- 'oxford' hoặc 'topics'
    
    -- String format: "word1'word2'word3'word4"
    mastered_words TEXT DEFAULT '',
    learning_words TEXT DEFAULT '',
    
    -- Cached statistics for dashboard performance
    total_mastered INTEGER DEFAULT 0,
    total_learning INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Business constraint: one progress record per user per source
    UNIQUE(user_id, source)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_word_strings_user_id ON user_word_strings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_strings_user_source ON user_word_strings(user_id, source);
CREATE INDEX IF NOT EXISTS idx_user_word_strings_updated ON user_word_strings(last_updated);

-- =====================================================
-- 2. RLS SECURITY
-- =====================================================

ALTER TABLE user_word_strings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage their own word progress" 
    ON user_word_strings
    USING (auth.uid() = user_id);

-- =====================================================
-- 3. HELPER FUNCTIONS (Optional - hiện tại không dùng trong production)
-- =====================================================

-- Function: Add word to string list
CREATE OR REPLACE FUNCTION add_word_to_string_list(
    word_list TEXT, 
    new_word VARCHAR(255)
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if word already exists
    IF position('''' || new_word || '''' IN '''' || COALESCE(word_list, '') || '''') > 0 THEN
        RETURN word_list; -- Word already exists, no change
    END IF;
    
    -- Add new word
    IF COALESCE(word_list, '') = '' THEN
        RETURN new_word;
    ELSE
        RETURN word_list || '''' || new_word;
    END IF;
END;
$$;

-- Function: Remove word from string list
CREATE OR REPLACE FUNCTION remove_word_from_string_list(
    word_list TEXT, 
    remove_word VARCHAR(255)
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    words_array TEXT[];
    result TEXT := '';
    word TEXT;
BEGIN
    -- Handle empty list
    IF COALESCE(word_list, '') = '' THEN
        RETURN '';
    END IF;
    
    -- Split string into array
    words_array := string_to_array(word_list, '''');
    
    -- Rebuild string without the removed word
    FOREACH word IN ARRAY words_array
    LOOP
        IF word != remove_word AND word != '' THEN
            IF result = '' THEN
                result := word;
            ELSE
                result := result || '''' || word;
            END IF;
        END IF;
    END LOOP;
    
    RETURN result;
END;
$$;

-- Function: Count words in string list
CREATE OR REPLACE FUNCTION count_words_in_string_list(word_list TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF COALESCE(word_list, '') = '' THEN
        RETURN 0;
    END IF;
    
    RETURN array_length(string_to_array(word_list, ''''), 1);
END;
$$;

-- =====================================================
-- 4. PRODUCTION IMPLEMENTATION NOTES
-- =====================================================

/*
ACTUAL PRODUCTION CODE (JavaScript/TypeScript):

API Routes thực tế xử lý strings:

1. GET /api/word-status:
   - Lấy mastered_words và learning_words strings
   - Client-side: split("'") thành arrays
   - Build word status map từ arrays

2. POST /api/word-status:
   - Nhận {word, source, isCorrect}
   - Load existing strings từ database
   - Client-side: parse strings thành arrays
   - Update arrays (add/remove words)
   - Convert arrays về strings: join("'")
   - Save updated strings về database

3. GET /api/stats:
   - Lấy tất cả records của user
   - Client-side: parse strings và tính statistics
   - Return aggregated stats

PERFORMANCE CHARACTERISTICS:
- Database queries: O(1) per user per source
- Client parsing: O(n) where n = number of words
- Memory usage: Minimal (just strings)
- Network payload: Small (compressed strings)

TYPICAL PRODUCTION DATA SIZE:
- Mastered words: ~100-500 words → ~5-25KB string
- Learning words: ~50-200 words → ~2-10KB string
- Total per user: ~10-50KB (very manageable)

DATABASE SCALING:
- 1000 users × 2 sources × 2 strings = ~4000 records total
- Much simpler than 1000 users × 500 words = 500,000 records
*/

-- =====================================================
-- 5. EXAMPLE PRODUCTION DATA
-- =====================================================

/*
Sample record in production:

{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "550e8400-e29b-41d4-a716-446655440000", 
  "source": "oxford",
  "mastered_words": "cat'dog'house'tree'book'water'fire'earth'air'light",
  "learning_words": "computer'phone'table'window'door'chair'desk'paper",
  "total_mastered": 10,
  "total_learning": 8,
  "last_updated": "2024-11-07T10:30:00Z"
}

Usage patterns:
- User practices 20-50 words per session
- String updates happen 1-5 times per practice session
- Stats queries happen on page loads (dashboard, profile)
- No complex joins or aggregations needed
*/