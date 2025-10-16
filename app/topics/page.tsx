"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWords } from "@/lib/words-context";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Volume2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
  X,
  Grid3X3,
  Grid,
  List,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Send,
  CreditCard,
  Users,
  Star,
  Target,
} from "lucide-react";
import { WordEvaluation } from "@/components/word-evaluation";
import {
  SkeletonGrid,
  TopicCardSkeleton,
  WordCardSkeleton,
  WordListSkeleton,
} from "@/components/ui/skeleton";

// Star Status Component
interface StarStatusProps {
  status: "mastered" | "learning" | "not-started";
  size?: number;
  isAuthenticated?: boolean;
}

const StarStatus: React.FC<StarStatusProps> = ({
  status,
  size = 16,
  isAuthenticated = false,
}) => {
  // Only show colors when authenticated
  if (isAuthenticated && status === "mastered") {
    return (
      <div title="Đã thành thạo">
        <Star className="animate-pulse" size={size} fill="gold" color="gold" />
      </div>
    );
  } else if (isAuthenticated && status === "learning") {
    return (
      <div title="Đang học">
        <Star size={size} fill="#dc2626" color="#dc2626" />
      </div>
    );
  } else {
    return (
      <div title={isAuthenticated ? "Chưa học" : "Đăng nhập để xem tiến độ"}>
        <Star size={size} fill="none" color="#d1d5db" />
      </div>
    );
  }
};

// Type definitions
type ViewMode = "card" | "list" | "flashcard";

interface Word {
  id: number;
  term: string;
  meaning: string;
  pos?: string;
  example?: string;
  image_url?: string;
  topic?: string;
  ipa?: string;
}

// 25 predefined topics - matching database topic column
const TOPICS = [
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
  { name: "Art & Culture", icon: "�", description: "Nghệ thuật và văn hóa" },
  { name: "Law & Crime", icon: "⚖️", description: "Pháp luật và tội phạm" },
  {
    name: "Society & Politics",
    icon: "�️",
    description: "Xã hội và chính trị",
  },
  { name: "Places & Geography", icon: "🗺️", description: "Địa điểm và địa lý" },
  { name: "Plants", icon: "🌱", description: "Thực vật" },
  { name: "Miscellaneous", icon: "📦", description: "Tổng hợp và khác" },
];

export default function TopicsPage() {
  const { user } = useAuth(); // Add authentication hook
  const { topicStats, topicStatsLoading, getWordsByTopic } = useWords(); // Use words context

  console.log("🎯 Topics page debug:", {
    topicStatsLoading,
    topicStatsCount: topicStats.length,
    firstTopicStats: topicStats[0],
    sampleWordCounts: topicStats
      .slice(0, 3)
      .map((t) => `${t.name}: ${t.word_count}`),
  });
  const prevUserRef = useRef(user); // Track previous user state
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [jumpToPage, setJumpToPage] = useState("");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardSearchQuery, setFlashcardSearchQuery] = useState("");
  const [topicViewMode, setTopicViewMode] = useState<"grid" | "list">("grid");

  // Word dialog states
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Word learning status tracking
  const [wordStatuses, setWordStatuses] = useState<
    Record<string, "mastered" | "learning" | "not-started">
  >({});

  // AI Practice states
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState("");
  const [practiceResult, setPracticeResult] = useState<boolean | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(false);

  // Load word learning statuses from localStorage (shared between Oxford and Topics)
  // Simple word status loading - using string method API
  const loadWordStatuses = async (wordsArray: Word[]) => {
    console.log(
      "🔄 Loading word statuses using string method for Topics",
      wordsArray.length,
      "words"
    );

    try {
      // Get auth token for API call
      const authToken = localStorage.getItem("auth_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Use string method - get all statuses in one call
      const response = await fetch("/api/word-status", {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Received status data for Topics:", data);

        // Parse mastered and learning words from string format
        const masteredWords = data.masteredWords
          ? data.masteredWords.split("'").filter(Boolean)
          : [];
        const learningWords = data.learningWords
          ? data.learningWords.split("'").filter(Boolean)
          : [];

        // Build status map
        const statusMap: Record<
          string,
          "mastered" | "learning" | "not-started"
        > = {};
        wordsArray.forEach((word) => {
          if (masteredWords.includes(word.term)) {
            statusMap[word.term] = "mastered";
          } else if (learningWords.includes(word.term)) {
            statusMap[word.term] = "learning";
          } else {
            statusMap[word.term] = "not-started";
          }
        });

        console.log("✅ Built status map for Topics:", statusMap);
        setWordStatuses(statusMap);
      } else {
        console.warn(
          "Failed to load statuses from API for Topics, using fallback"
        );
        // Set all to not-started as fallback
        const statusMap: Record<
          string,
          "mastered" | "learning" | "not-started"
        > = {};
        wordsArray.forEach((word) => {
          statusMap[word.term] = "not-started";
        });
        setWordStatuses(statusMap);
      }
    } catch (error) {
      console.error("Error loading word statuses for Topics:", error);
      // Set all to not-started as fallback
      const statusMap: Record<string, "mastered" | "learning" | "not-started"> =
        {};
      wordsArray.forEach((word) => {
        statusMap[word.term] = "not-started";
      });
      setWordStatuses(statusMap);
    }
  };

  // Function to update word status after practice (saves to API database using string method)
  const updateWordStatus = async (
    word: string,
    status: "mastered" | "learning" | "not-started"
  ) => {
    console.log(`🔄 Updating word status in Topics: "${word}" to "${status}"`);
    console.log(`👤 User authenticated:`, !!user);

    // Update local state immediately for UI responsiveness
    setWordStatuses((prev) => {
      const newStatuses = {
        ...prev,
        [word]: status,
      };

      console.log(`📊 New wordStatuses in Topics:`, newStatuses);
      console.log(`⭐ Status for "${word}":`, newStatuses[word]);

      return newStatuses;
    });

    // Save to API database using string method
    try {
      const authToken = localStorage.getItem("auth_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      // Use string method - POST với format đúng cho API
      const response = await fetch("/api/word-status", {
        method: "POST",
        headers,
        body: JSON.stringify({
          word: word,
          source: "topics", // Required by API
          isCorrect: status === "mastered", // Convert status to boolean
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          `💾 Updated word status for "${word}" to "${status}" using string method in Topics`,
          data
        );
      } else {
        console.warn(
          `Failed to save status for "${word}" to database:`,
          response.status
        );
      }
    } catch (error) {
      console.error(
        `Failed to save word status for "${word}" to database:`,
        error
      );
    }

    // Force re-render after state update
    setTimeout(() => {
      console.log(
        `🔄 Force re-render in Topics - wordStatuses["${word}"]:`,
        wordStatuses[word]
      );
    }, 100);
  };

  // Load topic word counts on mount - now handled by context
  useEffect(() => {
    // Topic stats are loaded automatically by context
  }, []);

  // Load word statuses when user authentication state changes
  useEffect(() => {
    const prevUser = prevUserRef.current;
    const currentUser = user;

    console.log(
      `🔄 User state check in Topics - Previous:`,
      !!prevUser,
      `Current:`,
      !!currentUser,
      `Words:`,
      words.length
    );

    // Update ref with current user
    prevUserRef.current = currentUser;

    // Load word statuses when:
    // 1. User state changes (login/logout)
    // 2. Topic words become available (empty → loaded)
    // 3. User is authenticated and words are available
    if (currentUser && words.length > 0) {
      console.log(
        `🔑 Loading word statuses for authenticated user with ${words.length} topic words`
      );
      loadWordStatuses(words);
    } else if (!currentUser && words.length > 0) {
      // User not authenticated - set all to not-started
      console.log(
        `🚪 No user authentication, setting topic words to not-started`
      );
      const clearedStatuses: Record<
        string,
        "mastered" | "learning" | "not-started"
      > = {};
      words.forEach((word) => {
        clearedStatuses[word.term] = "not-started";
      });
      setWordStatuses(clearedStatuses);
    }
  }, [user, words]); // React when user or words change - fixed to include words array

  const loadTopicWords = async (topicName: string) => {
    setLoading(true);
    try {
      console.log(`🔄 Loading words for topic: ${topicName}`);

      // Use context method to get words by topic
      const topicWords = await getWordsByTopic(topicName);

      setWords(topicWords);
      setSelectedTopic(topicName);
      setCurrentPage(1);
      setFlashcardIndex(0);
      setSearchQuery("");
      setFlashcardSearchQuery("");

      // Load word learning statuses
      await loadWordStatuses(topicWords);

      console.log(
        `✅ Loaded ${topicWords.length} words for topic: ${topicName}`
      );
    } catch (error) {
      console.error("Error loading topic words:", error);
      setWords([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic (same as Oxford page)
  useEffect(() => {
    let filtered = words;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (word) =>
          word.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredWords(filtered);
    setCurrentPage(1);
  }, [words, searchQuery]);

  // All other functions from Oxford page (keyboard shortcuts, navigation, practice, etc.)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (dialogOpen) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          navigateWord(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          navigateWord(1);
        } else if (e.key === "Escape") {
          setDialogOpen(false);
        }
        return;
      }

      if (viewMode === "flashcard") {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          navigateFlashcard("prev");
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          navigateFlashcard("next");
        } else if (e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          if (filteredWords[flashcardIndex]) {
            const utterance = new SpeechSynthesisUtterance(
              filteredWords[flashcardIndex].term
            );
            utterance.lang = "en-US";
            speechSynthesis.speak(utterance);
          }
        } else if (e.key === "Escape") {
          setViewMode("card");
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [dialogOpen, selectedWord, filteredWords, viewMode, flashcardIndex]);

  const navigateWord = (direction: number) => {
    // Cancel any ongoing speech synthesis
    speechSynthesis.cancel();

    if (!selectedWord) return;

    const currentIndex = filteredWords.findIndex(
      (word) => word.id === selectedWord.id
    );
    if (currentIndex === -1) return;

    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < filteredWords.length) {
      const newWord = filteredWords[newIndex];
      setSelectedWord(newWord);
      resetPractice();
    }
  };

  const playPronunciation = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Handle flashcard search - jump to word
  const handleFlashcardSearch = (query: string) => {
    setFlashcardSearchQuery(query);

    if (!query.trim()) return;

    // First try exact match
    const exactMatch = filteredWords.findIndex(
      (word) => word.term.toLowerCase() === query.toLowerCase()
    );

    if (exactMatch !== -1) {
      setFlashcardIndex(exactMatch);
      return;
    }

    // Then try partial match
    const searchTerm = query.toLowerCase().trim();
    const wordIndex = filteredWords.findIndex((word) =>
      word.term.toLowerCase().includes(searchTerm)
    );

    if (wordIndex !== -1) {
      setFlashcardIndex(wordIndex);
    }
  };

  const handlePractice = async () => {
    if (!practiceInput.trim() || !selectedWord) return;

    setPracticeLoading(true);
    try {
      // Step 1: Evaluate the English sentence
      const evaluationResponse = await fetch("/api/ai-evaluate-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: selectedWord.term,
          meaning: selectedWord.meaning,
          userInput: practiceInput,
          source: "topics",
          topic: selectedTopic,
        }),
      });

      const evaluationData = await evaluationResponse.json();

      if (evaluationData.success) {
        const { passed, feedback } = evaluationData.evaluation;
        setPracticeFeedback(feedback);
        setPracticeResult(passed);

        // Step 2: Update word status using string method
        const newStatus = passed ? "mastered" : "learning";
        await updateWordStatus(selectedWord.term, newStatus);

        console.log(
          `✅ Updated word status for "${selectedWord.term}" to "${newStatus}" using string method in Topics`
        );
      } else {
        setPracticeFeedback("Có lỗi xảy ra khi phân tích. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Practice error:", error);
      setPracticeFeedback("Có lỗi xảy ra khi phân tích. Vui lòng thử lại!");
    } finally {
      setPracticeLoading(false);
    }
  };

  const resetPractice = () => {
    setPracticeInput("");
    setPracticeFeedback("");
    setPracticeResult(null);
  };

  const closeDialog = () => {
    // Cancel any ongoing speech synthesis
    speechSynthesis.cancel();
    setDialogOpen(false);
    resetPractice();
  };

  const openWordDialog = (word: Word) => {
    setSelectedWord(word);
    setDialogOpen(true);
    resetPractice();
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpToPage("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navigateFlashcard = (direction: "prev" | "next") => {
    // Cancel any ongoing speech synthesis
    speechSynthesis.cancel();

    let newIndex = flashcardIndex;
    if (direction === "prev" && flashcardIndex > 0) {
      newIndex = flashcardIndex - 1;
    } else if (
      direction === "next" &&
      flashcardIndex < filteredWords.length - 1
    ) {
      newIndex = flashcardIndex + 1;
    }

    setFlashcardIndex(newIndex);
  };

  // Pagination
  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWords =
    itemsPerPage === 10000
      ? filteredWords
      : filteredWords.slice(startIndex, endIndex);

  // Back to topics
  const backToTopics = () => {
    setSelectedTopic(null);
    setWords([]);
    setFilteredWords([]);
    setSearchQuery("");
    setViewMode("card");
    setCurrentPage(1);
    setFlashcardIndex(0);
    setFlashcardSearchQuery("");
  };

  // Topic grid view
  if (!selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Banner - Beautiful Gradient inspired by Games Page */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-blue-500 dark:from-green-800 dark:to-blue-900 py-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full animate-pulse delay-300"></div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Content in vertical layout with image on top */}
            <div className="text-center text-white mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
                <BookOpen className="w-4 h-4 mr-2" />
                Học theo chủ đề
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                📚 Học theo chủ đề
              </h1>
              <p className="text-xl text-white/90 mb-6 leading-relaxed max-w-2xl mx-auto">
                Chọn chủ đề để học từ vựng một cách có hệ thống và hiệu quả
              </p>
            </div>

            {/* Banner Image - Centered */}
            <div className="flex justify-center mb-8">
              <div className="relative max-w-2xl w-full">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="/vocab_topic.png"
                    alt="Vocabulary Topics"
                    className="w-full h-64 md:h-80 object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIxMS4wNDYgMTUwIDIyMCAxNDAuNDkzIDIyMCAxMjguNjM2QzIyMCAxMTYuNzc5IDIxMS4wNDYgMTA3LjI3MyAyMDAgMTA3LjI3M0MxODguOTU0IDEwNy4yNzMgMTgwIDExNi43NzkgMTgwIDEyOC42MzZDMTgwIDE0MC40OTMgMTg4Ljk1NCAxNTAgMjAwIDE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxODgiIHk9IjEzOCI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMlM2LjQ4IDIyIDEyIDIyIDIyIDE3LjUyIDIyIDEyIDE3LjUyIDIgMTIgMlpNMTMgMTdIMTFWMTVIMTNWMTdaTTEzIDEzSDExVjdIMTNWMTNaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo8L3N2Zz4K";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  {/* Floating Icons */}
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                </div>
                {/* Decorative elements around image */}
                <div className="absolute -top-2 -left-2 w-16 h-16 bg-green-400/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
              </div>
            </div>

            {/* Action Cards Row */}
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold border border-white/20 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Học tập có hệ thống
              </div>
              <div className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold border border-white/20 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                25 chủ đề đa dạng
              </div>
              <div className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold border border-white/20 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Phương pháp hiệu quả
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                Debug:{" "}
                {topicStatsLoading
                  ? "Loading topic stats..."
                  : `${topicStats.length} topics loaded`}
                {topicStats.length > 0 && (
                  <div>
                    Sample counts:{" "}
                    {topicStats
                      .slice(0, 3)
                      .map((t) => `${t.name}: ${t.word_count}`)
                      .join(", ")}
                  </div>
                )}
              </div>
            )}

            {/* Topic View Controls */}
            <div className="flex justify-center items-center space-x-2 mb-6">
              <Button
                variant={topicViewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setTopicViewMode("grid")}
                className="flex items-center space-x-1"
              >
                <Grid className="h-4 w-4" />
                <span>Grid</span>
              </Button>
              <Button
                variant={topicViewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setTopicViewMode("list")}
                className="flex items-center space-x-1"
              >
                <List className="h-4 w-4" />
                <span>List</span>
              </Button>
            </div>
          </div>

          {/* Topics Display */}
          {topicStatsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 25 }).map((_, index) => (
                <TopicCardSkeleton key={index} />
              ))}
            </div>
          ) : topicViewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topicStats.map((topic) => (
                <Card
                  key={topic.name}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 group bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
                  onClick={() => loadTopicWords(topic.name)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{topic.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {topic.description}
                    </p>
                    <Badge variant="secondary">
                      {topic.word_count || 0} từ
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : topicStatsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 25 }).map((_, index) => (
                <TopicCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {topicStats.map((topic) => (
                <Card
                  key={topic.name}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
                  onClick={() => loadTopicWords(topic.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{topic.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {topic.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {topic.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {topic.word_count || 0} từ
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Selected topic view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Button variant="outline" onClick={backToTopics} className="mb-4">
            ← Quay lại chủ đề
          </Button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {topicStats.find((t) => t.name === selectedTopic)?.icon}{" "}
                {selectedTopic}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {filteredWords.length} từ vựng
              </p>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("card")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "flashcard" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("flashcard");
                  // Set to first word of current page
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  setFlashcardIndex(startIndex);
                }}
              >
                <BookOpen className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Controls in flashcard mode */}
        {viewMode === "flashcard" && (
          <div className="mb-6">
            {/* Search in flashcard mode */}
            <div className="flex justify-center">
              <div className="w-full max-w-md relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nhập từ để jump đến (vd: play)..."
                  value={flashcardSearchQuery}
                  onChange={(e) => handleFlashcardSearch(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleFlashcardSearch(flashcardSearchQuery);
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : viewMode === "flashcard" ? (
          // Flashcard Mode - Match Oxford exactly
          <div className="flex justify-center items-center min-h-[60vh] py-4">
            <div className="relative w-full max-w-3xl">
              {/* Navigation Arrows */}
              <Button
                variant="outline"
                size="lg"
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 h-12 w-12 rounded-full shadow-lg"
                onClick={() => navigateFlashcard("prev")}
                disabled={flashcardIndex === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 h-12 w-12 rounded-full shadow-lg"
                onClick={() => navigateFlashcard("next")}
                disabled={flashcardIndex === filteredWords.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Flashcard Content */}
              {filteredWords[flashcardIndex] && (
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 text-center space-y-3 mx-16 relative">
                  {/* Pronunciation button - top right corner */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const utterance = new SpeechSynthesisUtterance(
                        filteredWords[flashcardIndex].term
                      );
                      utterance.lang = "en-US";
                      speechSynthesis.speak(utterance);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>

                  {/* Progress Indicator */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {flashcardIndex + 1} / {filteredWords.length}
                  </div>

                  {/* Image */}
                  {filteredWords[flashcardIndex].image_url && (
                    <div className="flex justify-center">
                      <img
                        src={filteredWords[flashcardIndex].image_url}
                        alt={filteredWords[flashcardIndex].term}
                        className="w-48 h-32 object-cover rounded-xl shadow-md"
                      />
                    </div>
                  )}

                  {/* Word and Pronunciation */}
                  <div className="space-y-2">
                    {/* Main term - centered with star */}
                    <div className="text-center flex flex-col items-center space-y-2">
                      <h1 className="text-4xl font-bold text-gray-800 dark:text-white select-none">
                        {filteredWords[flashcardIndex].term}
                      </h1>
                      <StarStatus
                        key={`flashcard-${filteredWords[flashcardIndex].term}-${
                          wordStatuses[filteredWords[flashcardIndex].term] ||
                          "not-started"
                        }`}
                        status={
                          wordStatuses[filteredWords[flashcardIndex].term] ||
                          "not-started"
                        }
                        size={24}
                        isAuthenticated={!!user}
                      />
                    </div>

                    {/* IPA */}
                    {filteredWords[flashcardIndex].ipa &&
                      filteredWords[flashcardIndex].ipa.trim() && (
                        <p className="text-lg text-gray-600 dark:text-gray-300 font-mono">
                          {filteredWords[flashcardIndex].ipa}
                        </p>
                      )}

                    {/* Part of Speech */}
                    {filteredWords[flashcardIndex].pos && (
                      <div className="flex justify-center">
                        <Badge
                          variant="secondary"
                          className="px-4 py-2 text-sm"
                        >
                          {filteredWords[flashcardIndex].pos}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Meaning */}
                  <div className="space-y-2 max-w-2xl mx-auto">
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                      {filteredWords[flashcardIndex].meaning}
                    </p>

                    {/* Example */}
                    {filteredWords[flashcardIndex].example && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border-l-4 border-blue-300 dark:border-blue-500">
                        <p className="text-base text-gray-600 dark:text-gray-300 italic leading-relaxed break-words">
                          "{filteredWords[flashcardIndex].example}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Keyboard Shortcuts Hint */}
                  <div className="text-sm text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-600">
                    Phím ← → để chuyển từ • Space để phát âm • ESC để thoát
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Search bar */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm từ vựng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Results Info */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Hiển thị {paginatedWords.length} trong tổng số{" "}
              {filteredWords.length} từ vựng
            </div>

            {filteredWords.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Không tìm thấy từ vựng
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Thử thay đổi từ khóa tìm kiếm
                </p>
              </div>
            ) : (
              <>
                {/* Words Display - Match Oxford exactly */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <WordCardSkeleton key={index} />
                    ))}
                  </div>
                ) : viewMode === "card" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {paginatedWords.map((word) => (
                      <Card
                        key={word.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 group bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
                        onClick={() => openWordDialog(word)}
                      >
                        <CardContent className="p-4">
                          {word.image_url && (
                            <div className="mb-3 overflow-hidden rounded-lg">
                              <img
                                src={word.image_url}
                                alt={word.term}
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {word.term}
                              </h3>
                              <StarStatus
                                key={`card-${word.term}-${
                                  wordStatuses[word.term] || "not-started"
                                }`}
                                status={
                                  wordStatuses[word.term] || "not-started"
                                }
                                size={18}
                                isAuthenticated={!!user}
                              />
                            </div>

                            {word.pos && (
                              <Badge variant="secondary" className="text-xs">
                                {word.pos}
                              </Badge>
                            )}

                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 break-words">
                              {word.meaning}
                            </p>

                            {word.example && (
                              <div className="text-xs text-gray-500 dark:text-slate-400 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700/50 dark:to-slate-600/50 rounded p-2 line-clamp-2 break-words">
                                "{word.example}"
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : loading ? (
                  <div className="space-y-3 mb-8">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <WordListSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  /* List View - Match Oxford exactly */
                  <div className="space-y-3 mb-8">
                    {paginatedWords.map((word) => (
                      <Card
                        key={word.id}
                        className="cursor-pointer hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
                        onClick={() => openWordDialog(word)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  {word.term}
                                </h3>
                                <StarStatus
                                  key={`list-${word.term}-${
                                    wordStatuses[word.term] || "not-started"
                                  }`}
                                  status={
                                    wordStatuses[word.term] || "not-started"
                                  }
                                  size={16}
                                  isAuthenticated={!!user}
                                />
                                {word.pos && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {word.pos}
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playPronunciation(word.term);
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Volume2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 mb-2 break-words">
                                {word.meaning}
                              </p>
                              {word.example && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic break-words">
                                  "{word.example}"
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-4">
                              {word.image_url && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={word.image_url}
                                    alt={word.term}
                                    className="w-16 h-16 object-cover rounded-lg"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = "/placeholder.svg";
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Pagination - Match Oxford exactly */}
                {totalPages > 1 && itemsPerPage !== 10000 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t">
                    {/* Results Per Page */}
                    <div className="flex items-center space-x-4">
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                          setItemsPerPage(parseInt(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 mỗi trang</SelectItem>
                          <SelectItem value="24">24 mỗi trang</SelectItem>
                          <SelectItem value="48">48 mỗi trang</SelectItem>
                          <SelectItem value="10000">Tất cả</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentPage((prev) => Math.max(prev - 1, 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Trang trước
                      </Button>

                      <span className="px-4 py-2 text-sm">
                        Trang {currentPage} / {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          );
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={currentPage === totalPages}
                      >
                        Trang sau
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>

                    {/* Jump to Page */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Đến trang:</span>
                      <Input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={jumpToPage}
                        onChange={(e) => setJumpToPage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleJumpToPage();
                          }
                        }}
                        className="w-20 text-center"
                        placeholder="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleJumpToPage}
                        disabled={!jumpToPage}
                      >
                        Đi
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Word Detail Dialog - Responsive */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            className="!max-w-none !w-[96vw] sm:!w-[90vw] lg:!w-[85vw] !h-[95vh] sm:!h-[92vh] p-0 !fixed !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%]"
            showCloseButton={false}
          >
            {selectedWord && (
              <div className="flex flex-col h-full">
                {/* Dialog Header - Responsive */}
                <DialogHeader className="p-2 sm:p-4 lg:p-6 border-b flex-shrink-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold">
                      Chi tiết từ vựng
                    </DialogTitle>
                    <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWord(-1)}
                        disabled={
                          filteredWords.findIndex(
                            (w) => w.id === selectedWord.id
                          ) === 0
                        }
                        className="text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Trước</span>
                      </Button>
                      <span className="text-xs sm:text-sm text-gray-600 font-medium px-1 sm:px-3">
                        {filteredWords.findIndex(
                          (w) => w.id === selectedWord.id
                        ) + 1}{" "}
                        / {filteredWords.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWord(1)}
                        disabled={
                          filteredWords.findIndex(
                            (w) => w.id === selectedWord.id
                          ) ===
                          filteredWords.length - 1
                        }
                        className="text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <span className="hidden sm:inline">Sau</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={closeDialog}
                        className="p-1 sm:p-2"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </DialogHeader>

                {/* Dialog Body - Responsive: vertical on mobile, horizontal on desktop */}
                <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 lg:gap-8 overflow-hidden">
                  {/* Left Panel - Word Information */}
                  <div className="w-full lg:w-1/2 p-3 sm:p-4 lg:p-6 overflow-y-auto flex flex-col items-center text-center relative">
                    {/* Nút phát âm và ngôi sao ở góc */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center space-x-1 sm:space-x-2">
                      <StarStatus
                        key={`dialog-${selectedWord.term}-${
                          wordStatuses[selectedWord.term] || "not-started"
                        }`}
                        status={
                          wordStatuses[selectedWord.term] || "not-started"
                        }
                        size={16}
                        isAuthenticated={!!user}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playPronunciation(selectedWord.term)}
                        className="p-1 sm:p-2"
                      >
                        <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 sm:space-y-3 max-w-lg w-full min-h-0 flex-1 flex flex-col justify-center">
                      {/* Word image */}
                      {selectedWord.image_url && (
                        <div className="flex justify-center flex-shrink-0">
                          <img
                            src={selectedWord.image_url}
                            alt={selectedWord.term}
                            className="max-w-full max-h-24 sm:max-h-32 lg:max-h-40 object-cover rounded-lg shadow-md"
                          />
                        </div>
                      )}

                      <div className="text-center flex-shrink-0">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-words">
                          {selectedWord.term}
                        </h2>
                      </div>

                      {selectedWord.ipa && selectedWord.ipa.trim() && (
                        <div className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 text-center flex-shrink-0">
                          {selectedWord.ipa}
                        </div>
                      )}

                      {selectedWord.pos && (
                        <div className="space-y-1 text-center flex-shrink-0">
                          <Badge
                            variant="secondary"
                            className="text-xs sm:text-sm"
                          >
                            {selectedWord.pos}
                          </Badge>
                        </div>
                      )}

                      <div className="space-y-1 flex-shrink-0">
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words leading-relaxed">
                          {selectedWord.meaning}
                        </p>
                      </div>

                      <div className="space-y-1 flex-shrink-0">
                        {selectedWord.example && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 italic break-words leading-relaxed">
                            "{selectedWord.example}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - AI Practice */}
                  <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 flex flex-col">
                    {/* Practice Content */}
                    <div className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col min-h-0">
                      <div className="space-y-3 sm:space-y-4 flex-1 flex flex-col">
                        <div className="flex-shrink-0">
                          <Textarea
                            placeholder={`Viết một câu tiếng Anh có từ "${selectedWord.term}"...`}
                            value={practiceInput}
                            onChange={(e) => setPracticeInput(e.target.value)}
                            className="min-h-20 sm:min-h-24 lg:min-h-28 resize-none text-sm sm:text-base"
                          />
                        </div>

                        <div className="flex-shrink-0">
                          <Button
                            onClick={handlePractice}
                            disabled={practiceLoading || !practiceInput.trim()}
                            className="w-full text-sm sm:text-base"
                            size="lg"
                          >
                            {practiceLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Đang phân tích...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                Gửi để nhận phản hồi
                              </>
                            )}
                          </Button>
                        </div>

                        {/* AI Feedback */}
                        {practiceFeedback && (
                          <div className="flex-1 min-h-0 flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex-shrink-0">
                              � Nhận xét từ AI:
                            </label>
                            <div
                              className={`rounded-lg p-3 flex-1 overflow-hidden min-h-0 max-h-48 border ${
                                practiceResult === true
                                  ? "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700"
                                  : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-700"
                              }`}
                            >
                              <div className="overflow-y-auto h-full">
                                <div
                                  className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                    practiceResult === true
                                      ? "text-yellow-800 dark:text-yellow-200"
                                      : "text-red-800 dark:text-red-200"
                                  }`}
                                >
                                  {practiceFeedback}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {!practiceFeedback && (
                          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
                            <div className="text-center">
                              <div className="text-4xl mb-2">💭</div>
                              <p className="text-sm">
                                Viết câu và gửi để nhận phản hồi từ AI
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
