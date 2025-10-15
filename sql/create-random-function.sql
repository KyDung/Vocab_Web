-- Function to get random oxford words
CREATE OR REPLACE FUNCTION get_random_oxford_words(limit_param INTEGER DEFAULT 10)
RETURNS TABLE(term TEXT, meaning TEXT, ipa TEXT, pos TEXT, example TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ow.term,
        ow.meaning,
        ow.ipa,
        ow.pos,
        ow.example
    FROM oxford_words ow
    ORDER BY RANDOM()
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;