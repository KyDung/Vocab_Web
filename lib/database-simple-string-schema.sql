-- Alternative Simple Schema - String-based word tracking
-- Theo ý tưởng của user: dùng string concatenation thay vì separate rows

CREATE TABLE user_word_strings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL, -- 'oxford' hoặc 'topics'
  
  -- String chứa các từ đã mastered, ngăn cách bởi '
  mastered_words TEXT DEFAULT '',
  
  -- String chứa các từ đang learning, ngăn cách bởi '
  learning_words TEXT DEFAULT '',
  
  -- Thống kê
  total_mastered INTEGER DEFAULT 0,
  total_learning INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, source)
);

-- Ví dụ data:
-- Example record structure for user progress tracking
-- user_id: <actual-user-id>, source: oxford
-- mastered_words: "cat'dog'house'tree'book"
-- learning_words: "computer'phone'table"

-- Functions để thêm/xóa từ khỏi string
CREATE OR REPLACE FUNCTION add_word_to_string(word_list TEXT, new_word VARCHAR(255))
RETURNS TEXT AS $$
BEGIN
  -- Kiểm tra từ đã tồn tại chưa
  IF position('''' || new_word || '''' IN '''' || word_list || '''') > 0 THEN
    RETURN word_list; -- Từ đã tồn tại
  END IF;
  
  -- Thêm từ mới
  IF word_list = '' THEN
    RETURN new_word;
  ELSE
    RETURN word_list || '''' || new_word;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_word_from_string(word_list TEXT, remove_word VARCHAR(255))
RETURNS TEXT AS $$
DECLARE
  words_array TEXT[];
  result TEXT := '';
  word TEXT;
BEGIN
  -- Split string thành array
  words_array := string_to_array(word_list, '''');
  
  -- Rebuild string mà không có remove_word
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
$$ LANGUAGE plpgsql;

-- Function để update word status
CREATE OR REPLACE FUNCTION update_word_status_string(
  p_user_id UUID,
  p_source VARCHAR(50),
  p_word VARCHAR(255),
  p_is_mastered BOOLEAN
)
RETURNS VOID AS $$
DECLARE
  current_row RECORD;
  new_mastered TEXT;
  new_learning TEXT;
BEGIN
  -- Lấy record hiện tại hoặc tạo mới
  SELECT * INTO current_row FROM user_word_strings 
  WHERE user_id = p_user_id AND source = p_source;
  
  IF NOT FOUND THEN
    INSERT INTO user_word_strings (user_id, source, mastered_words, learning_words)
    VALUES (p_user_id, p_source, '', '');
    
    SELECT * INTO current_row FROM user_word_strings 
    WHERE user_id = p_user_id AND source = p_source;
  END IF;
  
  IF p_is_mastered THEN
    -- Move từ learning -> mastered
    new_learning := remove_word_from_string(current_row.learning_words, p_word);
    new_mastered := add_word_to_string(current_row.mastered_words, p_word);
  ELSE
    -- Move từ mastered -> learning (hoặc thêm mới vào learning)
    new_mastered := remove_word_from_string(current_row.mastered_words, p_word);
    new_learning := add_word_to_string(current_row.learning_words, p_word);
  END IF;
  
  -- Update database
  UPDATE user_word_strings SET
    mastered_words = new_mastered,
    learning_words = new_learning,
    total_mastered = array_length(string_to_array(new_mastered, ''''), 1) - CASE WHEN new_mastered = '' THEN 1 ELSE 0 END,
    total_learning = array_length(string_to_array(new_learning, ''''), 1) - CASE WHEN new_learning = '' THEN 1 ELSE 0 END,
    last_updated = NOW()
  WHERE user_id = p_user_id AND source = p_source;
END;
$$ LANGUAGE plpgsql;