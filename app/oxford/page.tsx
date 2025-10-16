"use client";

// Oxford vocabulary page with flashcard mode
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWords } from "@/lib/words-context";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
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
  List,
  CreditCard,
  BookOpen,
  Star,
  Target,
} from "lucide-react";
import { WordEvaluation } from "@/components/word-evaluation";
import { WordCardSkeleton, WordListSkeleton } from "@/components/ui/skeleton";

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
  // Enhanced debug logging
  console.log(`⭐ StarStatus DEBUG:`);
  console.log(`   - Status: "${status}"`);
  console.log(`   - Authenticated: ${isAuthenticated}`);
  console.log(
    `   - Should show color: ${
      isAuthenticated && (status === "mastered" || status === "learning")
    }`
  );

  // Only show colors when authenticated
  if (isAuthenticated && status === "mastered") {
    console.log(`   - Rendering GOLD star for mastered`);
    return (
      <div title="Đã thành thạo">
        <Star className="animate-pulse" size={size} fill="gold" color="gold" />
      </div>
    );
  } else if (isAuthenticated && status === "learning") {
    console.log(`   - Rendering RED star for learning`);
    return (
      <div title="Đang học">
        <Star size={size} fill="#dc2626" color="#dc2626" />
      </div>
    );
  } else {
    console.log(`   - Rendering GRAY star (not authenticated or not-started)`);
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
  pos: string;
  example: string;
  ipa: string;
  image_url: string;
  topic: string;
  level: string;
}

// Function to get topic from word meaning/context
const getTopicFromWord = (word: Word): string => {
  const meaning = word.meaning.toLowerCase();
  const term = word.term.toLowerCase();
  const example = word.example.toLowerCase();
  const combined = `${meaning} ${term} ${example}`;

  if (
    combined.includes("animal") ||
    combined.includes("pet") ||
    combined.includes("dog") ||
    combined.includes("cat") ||
    combined.includes("bird")
  )
    return "Animals";
  if (
    combined.includes("food") ||
    combined.includes("eat") ||
    combined.includes("drink") ||
    combined.includes("meal") ||
    combined.includes("fruit")
  )
    return "Food & Drink";
  if (
    combined.includes("family") ||
    combined.includes("parent") ||
    combined.includes("mother") ||
    combined.includes("father") ||
    combined.includes("child")
  )
    return "Family";
  if (
    combined.includes("work") ||
    combined.includes("job") ||
    combined.includes("office") ||
    combined.includes("business") ||
    combined.includes("career")
  )
    return "Work & Career";
  if (
    combined.includes("travel") ||
    combined.includes("trip") ||
    combined.includes("journey") ||
    combined.includes("vacation") ||
    combined.includes("hotel")
  )
    return "Travel";
  if (
    combined.includes("health") ||
    combined.includes("doctor") ||
    combined.includes("medicine") ||
    combined.includes("hospital") ||
    combined.includes("sick")
  )
    return "Health";
  if (
    combined.includes("school") ||
    combined.includes("study") ||
    combined.includes("learn") ||
    combined.includes("student") ||
    combined.includes("teacher")
  )
    return "Education";
  if (
    combined.includes("house") ||
    combined.includes("home") ||
    combined.includes("room") ||
    combined.includes("kitchen") ||
    combined.includes("bedroom")
  )
    return "Home";
  if (
    combined.includes("sport") ||
    combined.includes("game") ||
    combined.includes("play") ||
    combined.includes("football") ||
    combined.includes("exercise")
  )
    return "Sports";
  if (
    combined.includes("weather") ||
    combined.includes("rain") ||
    combined.includes("sun") ||
    combined.includes("cloud") ||
    combined.includes("wind")
  )
    return "Weather";

  return "General";
};

// Function to get level from word complexity
const getLevelFromWord = (word: Word): string => {
  const term = word.term;
  const meaning = word.meaning;

  // Basic words (short, common)
  if (
    term.length <= 4 &&
    [
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
    ].includes(term.toLowerCase())
  ) {
    return "Beginner";
  }

  // Intermediate words (moderate length, standard vocabulary)
  if (term.length <= 8 || meaning.split(" ").length <= 15) {
    return "Intermediate";
  }

  // Advanced words (long, complex meanings)
  return "Advanced";
};

export default function OxfordPage() {
  const { user } = useAuth(); // Add authentication hook
  const { oxfordWords, oxfordLoading, loadOxfordWords } = useWords(); // Use words context
  const prevUserRef = useRef(user); // Track previous user state
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [jumpToPage, setJumpToPage] = useState("");
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardSearchQuery, setFlashcardSearchQuery] = useState(""); // Separate search for flashcard

  // Dialog states
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Practice states
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState("");
  const [practiceResult, setPracticeResult] = useState<boolean | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(false);

  // Word learning status tracking
  const [wordStatuses, setWordStatuses] = useState<
    Record<string, "mastered" | "learning" | "not-started">
  >({});

  // Image loading tracking
  const [imageLoadingCount, setImageLoadingCount] = useState(0);

  // Auto-load image for a word
  const autoLoadImage = async (word: Word) => {
    if (word.image_url) return; // Already has image

    try {
      setImageLoadingCount((prev) => prev + 1);
      console.log(`🖼️ Loading image for word: ${word.term}`);

      const response = await fetch("/api/oxford/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: word.term }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.image_url) {
          console.log(`✅ Image loaded for ${word.term}: ${data.image_url}`);
          // Update filteredWords (since oxfordWords comes from context and is readonly)
          setFilteredWords((prevWords) =>
            prevWords.map((w) =>
              w.id === word.id ? { ...w, image_url: data.image_url } : w
            )
          );
        }
      }
    } catch (error) {
      console.error(`Failed to load image for ${word.term}:`, error);
    } finally {
      setImageLoadingCount((prev) => prev - 1);
    }
  };

  // Batch load images with delay to avoid rate limiting
  const batchLoadImages = async (words: Word[]) => {
    const wordsWithoutImages = words.filter((w) => !w.image_url);
    console.log(
      `Starting batch load for ${wordsWithoutImages.length} words without images`
    );

    for (let i = 0; i < wordsWithoutImages.length; i++) {
      const word = wordsWithoutImages[i];
      await autoLoadImage(word);

      // Delay between requests to avoid rate limiting
      if (i < wordsWithoutImages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      }
    }
  };

  // Simple word status loading - using string method
  const loadWordStatuses = async (wordsArray: Word[]) => {
    console.log(
      "� Loading word statuses using string method für",
      wordsArray.length,
      "words"
    );

    try {
      // Get auth token from Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        console.error("No access token available");
        return;
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      // Use string method - get all statuses in one call
      const response = await fetch("/api/word-status", {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📊 Received status data:", data);

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

        console.log("✅ Built status map:", statusMap);
        setWordStatuses(statusMap);
      } else {
        console.warn("Failed to load statuses from API, using fallback");
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
      console.error("Error loading word statuses:", error);
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
    console.log(`🔄 Updating word status: "${word}" to "${status}"`);
    console.log(`👤 User authenticated:`, !!user);

    // Update local state immediately for UI responsiveness
    setWordStatuses((prev) => {
      const newStatuses = {
        ...prev,
        [word]: status,
      };

      console.log(`📊 New wordStatuses:`, newStatuses);
      console.log(`⭐ Status for "${word}":`, newStatuses[word]);

      return newStatuses;
    });

    // Save to API database using string method
    try {
      // Get auth token from Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        console.error("No access token available for updating word status");
        return;
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      // Use string method - POST với format đúng cho API
      const response = await fetch("/api/word-status", {
        method: "POST",
        headers,
        body: JSON.stringify({
          word: word,
          source: "oxford", // Required by API
          isCorrect: status === "mastered", // Convert status to boolean
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          `💾 Updated word status for "${word}" to "${status}" using string method`,
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
        `🔄 Force re-render - wordStatuses["${word}"]:`,
        wordStatuses[word]
      );
    }, 100);
  };

  // Fetch words from API - now using context
  useEffect(() => {
    if (!oxfordWords.length && !oxfordLoading) {
      loadOxfordWords();
    }
  }, [oxfordWords.length, oxfordLoading, loadOxfordWords]);

  // Load word statuses when user authentication state changes
  useEffect(() => {
    const prevUser = prevUserRef.current;
    const currentUser = user;

    console.log(
      `🔄 User state check in Oxford - Previous:`,
      !!prevUser,
      `Current:`,
      !!currentUser,
      `Loading:`,
      oxfordLoading
    );

    // Update ref with current user
    prevUserRef.current = currentUser;

    // Load word statuses when:
    // 1. User state changes (login/logout)
    // 2. Oxford words become available (empty → loaded)
    // 3. User is authenticated and words are available
    if (currentUser && oxfordWords.length > 0 && !oxfordLoading) {
      console.log(
        `🔑 Loading word statuses for authenticated user with ${oxfordWords.length} words`
      );
      loadWordStatuses(oxfordWords);
    } else if (!currentUser && oxfordWords.length > 0) {
      // User not authenticated - set all to not-started
      console.log(
        `🚪 No user authentication, setting all words to not-started`
      );
      const clearedStatuses: Record<
        string,
        "mastered" | "learning" | "not-started"
      > = {};
      oxfordWords.forEach((word: Word) => {
        clearedStatuses[word.term] = "not-started";
      });
      setWordStatuses(clearedStatuses);
    }
  }, [user, oxfordWords, oxfordLoading]); // React when user or words change - fixed to include oxfordWords array

  // Auto-load images for words without images
  useEffect(() => {
    if (oxfordWords.length > 0) {
      const wordsWithoutImages = oxfordWords.filter((w: Word) => !w.image_url);
      if (wordsWithoutImages.length > 0) {
        console.log(
          `🖼️ Starting auto-load for ${wordsWithoutImages.length} words without images`
        );
        batchLoadImages(wordsWithoutImages);
      }
    }
  }, [oxfordWords.length]); // Only run when oxford words are loaded

  // Filter and search logic
  useEffect(() => {
    let filtered = oxfordWords;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (word: Word) =>
          word.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredWords(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [oxfordWords, searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Dialog keyboard shortcuts
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

      // Flashcard mode keyboard shortcuts
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

  // Navigation functions
  const navigateWord = (direction: number) => {
    if (!selectedWord) return;

    const currentIndex = filteredWords.findIndex(
      (word) => word.id === selectedWord.id
    );
    if (currentIndex === -1) return;

    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < filteredWords.length) {
      const newWord = filteredWords[newIndex];
      setSelectedWord(newWord);
      resetPractice(); // Reset practice when navigating to new word
    }
  };

  // Text-to-speech function
  const playPronunciation = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Handle practice submission - using string method
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
          source: "oxford",
          topic: selectedWord.topic,
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
          `✅ Updated word status for "${selectedWord.term}" to "${newStatus}" using string method`
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

  // Reset practice
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

  // Open word dialog
  const openWordDialog = (word: Word) => {
    setSelectedWord(word);
    setDialogOpen(true);
    const index = filteredWords.findIndex((w) => w.id === word.id);
    resetPractice(); // Reset practice when opening new word
  };

  // Handle jump to page
  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpToPage("");
      // Scroll to top after page change
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Navigate flashcard
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

  // Handle flashcard search - jump to exact match
  const handleFlashcardSearch = (query: string) => {
    setFlashcardSearchQuery(query);

    if (!query.trim()) return;

    // Find exact match first
    const exactMatch = filteredWords.findIndex(
      (word) => word.term.toLowerCase() === query.toLowerCase()
    );

    if (exactMatch !== -1) {
      setFlashcardIndex(exactMatch);
      return;
    }

    // Find word that starts with the query
    const startsWithMatch = filteredWords.findIndex((word) =>
      word.term.toLowerCase().startsWith(query.toLowerCase())
    );

    if (startsWithMatch !== -1) {
      setFlashcardIndex(startsWithMatch);
      return;
    }

    // Find word that contains the query
    const containsMatch = filteredWords.findIndex(
      (word) =>
        word.term.toLowerCase().includes(query.toLowerCase()) ||
        word.meaning.toLowerCase().includes(query.toLowerCase())
    );

    if (containsMatch !== -1) {
      setFlashcardIndex(containsMatch);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWords =
    itemsPerPage === 10000
      ? filteredWords
      : filteredWords.slice(startIndex, endIndex);

  if (oxfordLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Oxford 3000 Vocabulary
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              3000 từ vựng thiết yếu để thành thạo tiếng Anh
            </p>
          </div>

          {/* Loading skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <WordCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Banner - Asymmetric Layout for Diversity */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-800 dark:to-purple-900 py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-700"></div>
          <div className="absolute top-20 right-1/3 w-20 h-20 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left Side - Text Content (2/3 width) */}
            <div className="lg:col-span-2 text-white">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Oxford Vocabulary
                </div>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  Premium Quality
                </Badge>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Oxford
                <br />
                <span className="text-blue-200">Vocabulary</span>
              </h1>

              <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
                Khám phá{" "}
                {oxfordWords.length > 0
                  ? oxfordWords.length.toLocaleString()
                  : "3000+"}{" "}
                từ vựng tiếng Anh chất lượng cao với hình ảnh sinh động và phát
                âm chuẩn
              </p>

              {/* Feature List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center text-white/90">
                  <Star className="w-5 h-5 mr-3 text-blue-200" />
                  Từ vựng chất lượng cao
                </div>
                <div className="flex items-center text-white/90">
                  <Volume2 className="w-5 h-5 mr-3 text-blue-200" />
                  Phát âm chuẩn xác
                </div>
                <div className="flex items-center text-white/90">
                  <BookOpen className="w-5 h-5 mr-3 text-blue-200" />
                  Ví dụ thực tế
                </div>
                <div className="flex items-center text-white/90">
                  <Target className="w-5 h-5 mr-3 text-blue-200" />
                  Hình ảnh minh họa
                </div>
              </div>
            </div>

            {/* Right Side - Image (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl transition-transform duration-500">
                  <img
                    src="/3000_Vocab.png"
                    alt="3000 Vocabulary Collection"
                    className="w-full h-96 object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIxMS4wNDYgMTUwIDIyMCAxNDAuNDkzIDIyMCAxMjguNjM2QzIyMCAxMTYuNzc5IDIxMS4wNDYgMTA3LjI3MyAyMDAgMTA3LjI3M0MxODguOTU0IDEwNy4yNzMgMTgwIDExNi43NzkgMTgwIDEyOC42MzZDMTgwIDE0MC40OTMgMTg4Ljk1NCAxNTAgMjAwIDE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxODgiIHk9IjEzOCI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMlM2LjQ4IDIyIDEyIDIyIDIyIDE3LjUyIDIyIDEyIDE3LjUyIDIgMTIgMlpNMTMgMTdIMTFWMTVIMTNWMTdaTTEzIDEzSDExVjdIMTNWMTNaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo8L3N2Zz4K";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Floating Stats */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-gray-800">
                    <div className="text-2xl font-bold">3000+</div>
                    <div className="text-xs">Từ vựng</div>
                  </div>

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-gray-800">
                    <div className="text-xl font-bold">⭐</div>
                    <div className="text-xs">Oxford</div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -z-10 -top-4 -left-4 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl transform rotate-6"></div>
                <div className="absolute -z-20 -top-8 -left-8 w-full h-full bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-3xl transform rotate-12"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Image loading indicator */}
        {imageLoadingCount > 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-2 text-sm text-white/80 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Đang tải ảnh cho {imageLoadingCount} từ...</span>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Controls in flashcard mode */}
        {viewMode === "flashcard" && (
          <div className="mb-6">
            {/* Search and View Controls in flashcard mode */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
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

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={
                    (viewMode as ViewMode) === "card" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setViewMode("card" as ViewMode)}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={
                    (viewMode as ViewMode) === "list" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setViewMode("list" as ViewMode)}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={
                    (viewMode as ViewMode) === "flashcard"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setViewMode("flashcard" as ViewMode);
                    // Set flashcard index to first word of current page instead of 0
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    setFlashcardIndex(startIndex);
                  }}
                >
                  <CreditCard className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        {viewMode !== "flashcard" && (
          <div className="mb-6 space-y-4">
            {/* Search and View Controls */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm từ vựng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "card" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("card")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={
                    (viewMode as ViewMode) === "flashcard"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setViewMode("flashcard" as ViewMode);
                    // Set flashcard index to first word of current page instead of 0
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    setFlashcardIndex(startIndex);
                  }}
                >
                  <CreditCard className="h-4 w-4" />
                </Button>
              </div>

              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="10000">Tất cả</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Results Info */}
        {viewMode !== "flashcard" && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Hiển thị {paginatedWords.length} trong tổng số{" "}
            {filteredWords.length} từ vựng
          </div>
        )}

        {/* Words Display */}
        {viewMode === "flashcard" ? (
          // Flashcard Mode
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
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-3 border-l-4 border-blue-400 dark:border-blue-500">
                        <p className="text-base text-gray-700 dark:text-slate-200 italic leading-relaxed break-words">
                          "{filteredWords[flashcardIndex].example}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Keyboard Shortcuts Hint */}
                  <div className="text-sm text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-200 dark:border-slate-600">
                    Phím ← → để chuyển từ • Space để phát âm • ESC để thoát
                  </div>
                </div>
              )}
            </div>
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
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {word.term}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <StarStatus
                          key={`card-${word.term}-${
                            wordStatuses[word.term] || "not-started"
                          }`}
                          status={wordStatuses[word.term] || "not-started"}
                          size={18}
                          isAuthenticated={!!user}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            playPronunciation(word.term);
                          }}
                          className="p-1"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {word.meaning}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2 mb-8">
            {paginatedWords.map((word) => (
              <Card
                key={word.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500"
                onClick={() => openWordDialog(word)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {word.image_url && (
                        <img
                          src={word.image_url}
                          alt={word.term}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {word.term}
                          </h3>
                          <StarStatus
                            key={`list-${word.term}-${
                              wordStatuses[word.term] || "not-started"
                            }`}
                            status={wordStatuses[word.term] || "not-started"}
                            size={16}
                            isAuthenticated={!!user}
                          />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {word.meaning}
                        </p>
                        {word.pos && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {word.pos}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playPronunciation(word.term);
                      }}
                      className="p-1"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {viewMode !== "flashcard" &&
          itemsPerPage !== 10000 &&
          totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex items-center space-x-2">
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

                <span className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                  Trang {currentPage} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Đến trang:
                </span>
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

        {/* Word Detail Dialog - Responsive */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            className="!max-w-none !w-[96vw] sm:!w-[90vw] lg:!w-[85vw] !h-[95vh] sm:!h-[92vh] p-0 !fixed !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%] bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700"
            showCloseButton={false}
          >
            {selectedWord && (
              <div className="flex flex-col h-full">
                {/* Dialog Header - Responsive */}
                <DialogHeader className="p-2 sm:p-3 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                  <DialogTitle className="sr-only">
                    Chi tiết từ vựng
                  </DialogTitle>
                  <div className="flex justify-end items-center">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWord(-1)}
                        className="text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Trước</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWord(1)}
                        className="text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <span className="hidden sm:inline">Sau</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
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
                <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 lg:gap-8 min-h-0 max-h-full overflow-hidden">
                  {/* Left Panel - Word Information */}
                  <div className="w-full lg:w-1/2 p-3 sm:p-4 lg:p-6 overflow-y-auto flex flex-col items-center text-center relative min-w-0 max-h-full">
                    {/* Nút phát âm và ngôi sao ở góc */}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center space-x-1 sm:space-x-2">
                      <StarStatus
                        key={`${selectedWord.term}-${
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
                        <p className="text-xs sm:text-sm italic text-gray-600 dark:text-gray-300 break-words leading-relaxed">
                          "{selectedWord.example}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Practice Section */}
                  <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-slate-700 flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 min-w-0 min-h-0 max-h-full">
                    <div className="p-2 sm:p-3 lg:p-4 pb-2 sm:pb-3 flex-shrink-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                          <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 dark:text-yellow-400" />
                          AI Practice
                        </h3>
                        <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto">
                          <Button
                            onClick={handlePractice}
                            disabled={!practiceInput.trim() || practiceLoading}
                            size="sm"
                            className="text-xs sm:text-sm px-2 sm:px-3 flex-1 sm:flex-none"
                          >
                            {practiceLoading
                              ? "Phân tích..."
                              : "Gửi để phân tích"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetPractice}
                            className="text-xs sm:text-sm px-2 sm:px-3"
                          >
                            <RotateCcw className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                            <span className="hidden sm:inline">Reset</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 px-2 sm:px-3 lg:px-4 pb-3 sm:pb-4 lg:pb-6 min-h-0 flex flex-col max-h-full overflow-hidden">
                      <div className="h-full space-y-2 sm:space-y-3 flex flex-col min-h-0">
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <Textarea
                              placeholder={`Viết một câu tiếng Anh có từ "${selectedWord.term}"...`}
                              value={practiceInput}
                              onChange={(e) => setPracticeInput(e.target.value)}
                              className="min-h-[80px] sm:min-h-[100px] w-full resize-none pr-12 sm:pr-16 text-sm sm:text-base"
                              maxLength={200}
                            />
                            <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                              {practiceInput.length}/200
                            </span>
                          </div>
                        </div>

                        {practiceFeedback && (
                          <div
                            className={`p-3 sm:p-4 rounded-lg flex-1 min-h-0 flex flex-col ${
                              practiceResult === true
                                ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                            }`}
                          >
                            <h4
                              className={`font-medium mb-2 sm:mb-3 text-xs sm:text-sm flex-shrink-0 ${
                                practiceResult === true
                                  ? "text-yellow-900 dark:text-yellow-100"
                                  : "text-red-900 dark:text-red-100"
                              }`}
                            >
                              💬 Nhận xét từ AI:
                            </h4>
                            <div className="flex-1 overflow-y-auto min-h-0">
                              <div
                                className={`text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed ${
                                  practiceResult === true
                                    ? "text-yellow-800 dark:text-yellow-200"
                                    : "text-red-800 dark:text-red-200"
                                }`}
                              >
                                {practiceFeedback}
                              </div>
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
