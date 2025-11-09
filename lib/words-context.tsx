"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// Type definitions
interface Word {
  id: number;
  term: string;
  meaning: string;
  pos: string;
  example: string;
  ipa: string;
  image_url: string;
  topic: string;
  level: string;
}

interface TopicStats {
  name: string;
  icon: string;
  description: string;
  word_count: number;
  words?: Word[];
}

interface WordsContextType {
  // Oxford words data
  oxfordWords: Word[];
  oxfordLoading: boolean;
  oxfordLoaded: boolean;
  loadOxfordWords: () => Promise<void>;

  // Topic data
  topicStats: TopicStats[];
  topicStatsLoading: boolean;
  topicStatsLoaded: boolean;
  loadTopicStats: () => Promise<void>;

  // Get words by topic (with caching)
  getWordsByTopic: (topicName: string) => Promise<Word[]>;

  // Clear cache
  clearCache: () => void;
}

const WordsContext = createContext<WordsContextType | undefined>(undefined);

// Predefined topics with metadata
const TOPICS_METADATA = [
  {
    name: "Function Words",
    icon: "⚙️",
    description: "Từ chức năng: giới từ, liên từ, đại từ",
  },
  { name: "People & Family", icon: "👨‍👩‍👧‍👦", description: "Con người và gia đình" },
  {
    name: "Home & Housing",
    icon: "🏠",
    description: "Nhà ở và không gian sống",
  },
  { name: "Food & Drink", icon: "🍳", description: "Thực phẩm và đồ uống" },
  {
    name: "Clothes & Fashion",
    icon: "👗",
    description: "Quần áo và thời trang",
  },
  { name: "Health & Body", icon: "🏥", description: "Sức khỏe và cơ thể" },
  {
    name: "School & Education",
    icon: "🎓",
    description: "Trường học và giáo dục",
  },
  { name: "Work & Jobs", icon: "💼", description: "Công việc và nghề nghiệp" },
  {
    name: "Travel & Transport",
    icon: "✈️",
    description: "Du lịch và giao thông",
  },
  { name: "Sports & Leisure", icon: "⚽", description: "Thể thao và giải trí" },
  {
    name: "Media & Communication",
    icon: "📺",
    description: "Truyền thông và giao tiếp",
  },
  {
    name: "Science & Technology",
    icon: "💻",
    description: "Khoa học và công nghệ",
  },
  {
    name: "Business & Money",
    icon: "🛍️",
    description: "Kinh doanh và tiền bạc",
  },
  {
    name: "Nature & Environment",
    icon: "🌿",
    description: "Thiên nhiên và môi trường",
  },
  {
    name: "Weather & Climate",
    icon: "🌤️",
    description: "Thời tiết và khí hậu",
  },
  { name: "Animals", icon: "🐕", description: "Động vật" },
  { name: "Time & Numbers", icon: "📅", description: "Thời gian và số học" },
  {
    name: "Emotions & Personality",
    icon: "😊",
    description: "Cảm xúc và tính cách",
  },
  { name: "Colors & Shapes", icon: "🎨", description: "Màu sắc và hình dạng" },
  { name: "Art & Culture", icon: "🎭", description: "Nghệ thuật và văn hóa" },
  { name: "Law & Crime", icon: "⚖️", description: "Pháp luật và tội phạm" },
  {
    name: "Society & Politics",
    icon: "🏛️",
    description: "Xã hội và chính trị",
  },
  { name: "Places & Geography", icon: "🗺️", description: "Địa điểm và địa lý" },
  { name: "Plants", icon: "🌱", description: "Thực vật" },
  { name: "Miscellaneous", icon: "📦", description: "Tổng hợp và khác" },
];

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Cache keys
const CACHE_KEYS = {
  OXFORD_WORDS: "vocab_oxford_words",
  TOPIC_STATS: "vocab_topic_stats",
  OXFORD_TIMESTAMP: "vocab_oxford_timestamp",
  TOPIC_STATS_TIMESTAMP: "vocab_topic_stats_timestamp",
};

export function WordsProvider({ children }: { children: ReactNode }) {
  const [oxfordWords, setOxfordWords] = useState<Word[]>([]);
  const [oxfordLoading, setOxfordLoading] = useState(false);
  const [oxfordLoaded, setOxfordLoaded] = useState(false);

  const [topicStats, setTopicStats] = useState<TopicStats[]>([]);
  const [topicStatsLoading, setTopicStatsLoading] = useState(false);
  const [topicStatsLoaded, setTopicStatsLoaded] = useState(false);

  // Topic words cache
  const [topicWordsCache, setTopicWordsCache] = useState<
    Record<string, { words: Word[]; timestamp: number }>
  >({});

  // Function to get topic from word meaning/context (optimized)
  const getTopicFromWord = (word: Word): string => {
    const meaning = word.meaning.toLowerCase();
    const term = word.term.toLowerCase();
    const example = word.example?.toLowerCase() || "";
    const combined = `${meaning} ${term} ${example}`;

    // Use more efficient regex patterns for topic detection
    const topicPatterns: Record<string, RegExp> = {
      Animals:
        /\b(animal|pet|dog|cat|bird|fish|horse|cow|pig|sheep|lion|tiger|bear|elephant|monkey|zoo|wild|domestic)\b/,
      "Food & Drink":
        /\b(food|eat|drink|meal|fruit|vegetable|meat|bread|milk|water|coffee|tea|restaurant|kitchen|cook|hungry|thirsty)\b/,
      "People & Family":
        /\b(family|parent|mother|father|child|son|daughter|brother|sister|grandmother|grandfather|uncle|aunt|cousin|baby|person|people|man|woman)\b/,
      "Work & Jobs":
        /\b(work|job|office|business|career|company|manager|employee|boss|worker|salary|professional|occupation|industry)\b/,
      "Travel & Transport":
        /\b(travel|trip|journey|vacation|hotel|airport|train|bus|car|plane|boat|ship|road|street|map|tourist|passport)\b/,
      "Health & Body":
        /\b(health|doctor|medicine|hospital|sick|ill|body|head|hand|foot|eye|ear|nose|mouth|heart|pain|medical|nurse)\b/,
      "School & Education":
        /\b(school|study|learn|student|teacher|education|university|college|class|lesson|book|read|write|exam|homework)\b/,
      "Home & Housing":
        /\b(house|home|room|kitchen|bedroom|bathroom|living|garden|furniture|bed|table|chair|door|window|roof|apartment)\b/,
      "Sports & Leisure":
        /\b(sport|game|play|football|basketball|tennis|swimming|running|exercise|gym|team|match|player|leisure|hobby)\b/,
      "Weather & Climate":
        /\b(weather|rain|sun|wind|cloud|snow|hot|cold|warm|cool|climate|temperature|season|summer|winter|spring|autumn)\b/,
    };

    for (const [topic, pattern] of Object.entries(topicPatterns)) {
      if (pattern.test(combined)) {
        return topic;
      }
    }

    return "Miscellaneous";
  };

  // Function to get level from word complexity (optimized)
  const getLevelFromWord = (word: Word): string => {
    const term = word.term;
    const meaning = word.meaning;

    // Basic words (short, common)
    const basicWords = new Set([
      "be",
      "do",
      "go",
      "see",
      "get",
      "come",
      "know",
      "time",
      "way",
      "day",
      "man",
      "new",
      "old",
      "say",
      "her",
      "his",
      "she",
      "him",
      "may",
      "use",
      "can",
      "will",
      "has",
      "had",
      "one",
      "two",
      "all",
      "any",
      "big",
      "small",
    ]);

    if (term.length <= 4 && basicWords.has(term.toLowerCase())) {
      return "Beginner";
    }

    // Intermediate words (moderate length, standard vocabulary)
    if (term.length <= 8 || meaning.split(" ").length <= 15) {
      return "Intermediate";
    }

    // Advanced words (long, complex meanings)
    return "Advanced";
  };

  // Check if cache is valid
  const isCacheValid = (cacheKey: string): boolean => {
    const timestamp = localStorage.getItem(cacheKey);
    if (!timestamp) return false;

    const age = Date.now() - parseInt(timestamp);
    return age < CACHE_DURATION;
  };

  // Load Oxford words with caching
  const loadOxfordWords = async (): Promise<void> => {
    // Check cache first
    if (oxfordLoaded && oxfordWords.length > 0) {
      console.log("🎯 Oxford words already loaded in memory");
      return;
    }

    if (isCacheValid(CACHE_KEYS.OXFORD_TIMESTAMP)) {
      const cached = localStorage.getItem(CACHE_KEYS.OXFORD_WORDS);
      if (cached) {
        try {
          const parsedWords = JSON.parse(cached);
          setOxfordWords(parsedWords);
          setOxfordLoaded(true);
          console.log(
            `🚀 Loaded ${parsedWords.length} Oxford words from cache`
          );
          return;
        } catch (error) {
          console.warn("Failed to parse cached Oxford words:", error);
        }
      }
    }

    if (oxfordLoading) {
      console.log("⏳ Oxford words already loading...");
      return;
    }

    setOxfordLoading(true);
    try {
      console.log("🔄 Fetching Oxford words from API...");
      const response = await fetch("/api/oxford?limit=all");
      const data = await response.json();

      let wordsArray: Word[] = [];
      if (data.words && Array.isArray(data.words)) {
        wordsArray = data.words;
      } else if (Array.isArray(data)) {
        wordsArray = data;
      }

      // Add virtual topic and level fields efficiently
      const wordsWithMeta = wordsArray.map((word: Word) => ({
        ...word,
        topic: word.topic || getTopicFromWord(word),
        level: getLevelFromWord(word),
      }));

      setOxfordWords(wordsWithMeta);
      setOxfordLoaded(true);

      // Cache the results
      localStorage.setItem(
        CACHE_KEYS.OXFORD_WORDS,
        JSON.stringify(wordsWithMeta)
      );
      localStorage.setItem(CACHE_KEYS.OXFORD_TIMESTAMP, Date.now().toString());

      console.log(`✅ Loaded and cached ${wordsWithMeta.length} Oxford words`);
    } catch (error) {
      console.error("Error loading Oxford words:", error);
    } finally {
      setOxfordLoading(false);
    }
  };

  // Load topic stats with caching
  const loadTopicStats = async (): Promise<void> => {
    // Check cache first
    if (topicStatsLoaded && topicStats.length > 0) {
      console.log("🎯 Topic stats already loaded in memory");
      return;
    }

    if (isCacheValid(CACHE_KEYS.TOPIC_STATS_TIMESTAMP)) {
      const cached = localStorage.getItem(CACHE_KEYS.TOPIC_STATS);
      if (cached) {
        try {
          const parsedStats = JSON.parse(cached);
          setTopicStats(parsedStats);
          setTopicStatsLoaded(true);
          console.log(`🚀 Loaded topic stats from cache`);
          return;
        } catch (error) {
          console.warn("Failed to parse cached topic stats:", error);
        }
      }
    }

    if (topicStatsLoading) {
      console.log("⏳ Topic stats already loading...");
      return;
    }

    setTopicStatsLoading(true);
    try {
      console.log("🔄 Computing topic stats...");

      // ENSURE Oxford words are loaded first (auto-dependency)
      if (oxfordWords.length === 0 && !oxfordLoading) {
        console.log("📚 Oxford words not loaded - loading dependency first...");
        await loadOxfordWords();

        // Wait a bit for state to update
        let retries = 0;
        while (oxfordWords.length === 0 && retries < 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          retries++;
        }
      }

      // Compute topic stats from Oxford words (should already be loaded)
      if (oxfordWords.length === 0) {
        console.warn(
          "⚠️ No Oxford words available for topic stats computation"
        );
        setTopicStats([]);
        return;
      }

      console.log(
        `🔄 Computing topic stats for ${oxfordWords.length} Oxford words...`
      );

      const statsMap = new Map<string, number>();

      // Initialize all topics with 0 count
      TOPICS_METADATA.forEach((topic) => {
        statsMap.set(topic.name, 0);
      });

      // Count words per topic
      let totalMapped = 0;
      oxfordWords.forEach((word: Word) => {
        const topic = word.topic || getTopicFromWord(word);
        statsMap.set(topic, (statsMap.get(topic) || 0) + 1);
        totalMapped++;
      });

      console.log(`📈 Mapped ${totalMapped} words to topics`);
      console.log(`🎯 Topic distribution:`, Array.from(statsMap.entries()));

      // Build topic stats array
      const computedStats: TopicStats[] = TOPICS_METADATA.map((topic) => ({
        ...topic,
        word_count: statsMap.get(topic.name) || 0,
      }));

      console.log(
        "📊 Topic stats computed:",
        computedStats.map((t) => `${t.name}: ${t.word_count}`)
      );

      setTopicStats(computedStats);
      setTopicStatsLoaded(true);

      // Cache the results
      localStorage.setItem(
        CACHE_KEYS.TOPIC_STATS,
        JSON.stringify(computedStats)
      );
      localStorage.setItem(
        CACHE_KEYS.TOPIC_STATS_TIMESTAMP,
        Date.now().toString()
      );

      console.log(`✅ Computed and cached topic stats`);
    } catch (error) {
      console.error("Error loading topic stats:", error);
    } finally {
      setTopicStatsLoading(false);
    }
  };

  // Get words by topic with caching
  const getWordsByTopic = async (topicName: string): Promise<Word[]> => {
    // Check memory cache first
    const cached = topicWordsCache[topicName];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`🎯 Using cached words for topic: ${topicName}`);
      return cached.words;
    }

    console.log(`🔄 Loading words for topic: ${topicName}`);

    // Ensure Oxford words are loaded
    if (!oxfordLoaded) {
      await loadOxfordWords();
    }

    // Filter words by topic
    const topicWords = oxfordWords.filter((word: Word) => {
      const wordTopic = word.topic || getTopicFromWord(word);
      return wordTopic === topicName;
    });

    // Cache the result
    setTopicWordsCache(
      (prev: Record<string, { words: Word[]; timestamp: number }>) => ({
        ...prev,
        [topicName]: {
          words: topicWords,
          timestamp: Date.now(),
        },
      })
    );

    console.log(`✅ Loaded ${topicWords.length} words for topic: ${topicName}`);
    return topicWords;
  };

  // Clear cache
  const clearCache = (): void => {
    // Clear localStorage
    Object.values(CACHE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    // Clear memory cache
    setOxfordWords([]);
    setOxfordLoaded(false);
    setTopicStats([]);
    setTopicStatsLoaded(false);
    setTopicWordsCache({});

    console.log("🧹 Cache cleared");
  };

  // Auto-load on mount - PRELOAD everything for all pages
  useEffect(() => {
    console.log("🚀 WordsProvider mounted - Starting preload...");
    loadOxfordWords();
  }, []);

  // Load topic stats after Oxford words are loaded - IMMEDIATE preload
  useEffect(() => {
    if (oxfordLoaded && oxfordWords.length > 0) {
      console.log("📊 Oxford words loaded - Computing topic stats...");
      loadTopicStats();
    }
  }, [oxfordLoaded, oxfordWords.length]);

  // ADDITIONAL: Force load if somehow missed (safety net)
  useEffect(() => {
    const forceLoadTimer = setTimeout(() => {
      if (!oxfordLoaded && !oxfordLoading) {
        console.log("⚡ Force loading Oxford words (safety net)...");
        loadOxfordWords();
      }
      if (!topicStatsLoaded && !topicStatsLoading && oxfordWords.length > 0) {
        console.log("⚡ Force loading topic stats (safety net)...");
        loadTopicStats();
      }
    }, 2000); // After 2 seconds

    return () => clearTimeout(forceLoadTimer);
  }, [
    oxfordLoaded,
    oxfordLoading,
    topicStatsLoaded,
    topicStatsLoading,
    oxfordWords.length,
  ]);

  const value: WordsContextType = {
    oxfordWords,
    oxfordLoading,
    oxfordLoaded,
    loadOxfordWords,

    topicStats,
    topicStatsLoading,
    topicStatsLoaded,
    loadTopicStats,

    getWordsByTopic,
    clearCache,
  };

  return (
    <WordsContext.Provider value={value}>{children}</WordsContext.Provider>
  );
}

export function useWords() {
  const context = useContext(WordsContext);
  if (context === undefined) {
    throw new Error("useWords must be used within a WordsProvider");
  }
  return context;
}
