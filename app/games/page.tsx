"use client";

import React, { useState, useEffect } from "react";
import { Gamepad2, Play, Trophy, Clock, Target, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlashcardGame } from "@/components/games/flashcard-game";
import { QuizGame } from "@/components/games/quiz-game";
import { TypingGame } from "@/components/games/typing-game";
import { GodotGame } from "@/components/games/godot-game";
import { CapyrunGame } from "@/components/games/capyrun-game";

type GameType = "flashcard" | "quiz" | "typing" | "godot" | "capyrun" | null;

const games = [
  {
    id: "flashcard",
    title: "Flashcard nhanh",
    description: "Lật thẻ để xem nghĩa, kiểm tra khả năng ghi nhớ từ vựng",
    icon: Target,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    difficulty: "Dễ",
    time: "5-10 phút",
    image: "/flashcard.png",
  },
  {
    id: "quiz",
    title: "Quiz trắc nghiệm",
    description: "Chọn đáp án đúng trong các câu hỏi về từ vựng",
    icon: Trophy,
    color: "bg-gradient-to-br from-green-500 to-green-600",
    difficulty: "Trung bình",
    time: "10-15 phút",
    image: "/quiz_game.png",
  },
  {
    id: "typing",
    title: "Gõ từ nhanh",
    description: "Gõ từ tiếng Anh tương ứng với nghĩa tiếng Việt",
    icon: Zap,
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    difficulty: "Khó",
    time: "15-20 phút",
    image: "/typing_game.png",
  },
  {
    id: "godot",
    title: "Candy Catcher Vocab",
    description: "Game thu thập kẹo và học từ vựng được tạo bằng Godot Engine",
    icon: Gamepad2,
    color: "bg-gradient-to-br from-pink-500 to-orange-500",
    difficulty: "Trung bình",
    time: "10-20 phút",
    image: "/godot_game.png",
  },
  {
    id: "capyrun",
    title: "Capyrun Adventure",
    description:
      "Cuộc phiêu lưu của Capybara với nhiều thử thách và từ vựng mới",
    icon: Gamepad2,
    color: "bg-gradient-to-br from-green-500 to-blue-500",
    difficulty: "Trung bình",
    time: "15-25 phút",
    image: "/Capybara_adventure.png",
  },
];

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  const [gameKey, setGameKey] = useState(0); // Add key to force reset
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerSlides = [
    {
      id: "flashcard",
      title: "Flashcard nhanh",
      description: "Lật thẻ để xem nghĩa, kiểm tra khả năng ghi nhớ từ vựng",
      image: "/flashcard.png",
      gradient: "from-blue-500 to-purple-600",
      badge: "Phổ biến nhất"
    },
    {
      id: "typing", 
      title: "Gõ từ nhanh",
      description: "Gõ từ tiếng Anh tương ứng với nghĩa tiếng Việt",
      image: "/typing_game.png", 
      gradient: "from-purple-500 to-pink-600",
      badge: "Thử thách"
    },
    {
      id: "godot",
      title: "Candy Catcher Vocab", 
      description: "Game thu thập kẹo và học từ vựng được tạo bằng Godot Engine",
      image: "/godot_game.png",
      gradient: "from-pink-500 to-orange-500",
      badge: "Mới nhất"
    }
  ];

  const handleBackToGames = () => {
    setSelectedGame(null);
    setGameKey((prev) => prev + 1); // Reset game state when going back
  };

  const handleGameSelect = (gameType: GameType) => {
    setSelectedGame(gameType);
    setGameKey((prev) => prev + 1); // Reset game state when selecting new game
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  // Auto slide
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, []);

  // Simple completion handler - just go back to games
  const handleGameComplete = (correct: number, total: number, time: number) => {
    console.log(`Game completed: ${correct}/${total} in ${time}s`);
    handleBackToGames();
  };

  const renderGame = () => {
    switch (selectedGame) {
      case "flashcard":
        return (
          <FlashcardGame
            key={`flashcard-${gameKey}`}
            onComplete={handleGameComplete}
            onBack={handleBackToGames}
          />
        );
      case "quiz":
        return (
          <QuizGame
            key={`quiz-${gameKey}`}
            onComplete={handleGameComplete}
            onBack={handleBackToGames}
          />
        );
      case "typing":
        return (
          <TypingGame
            key={`typing-${gameKey}`}
            onComplete={handleGameComplete}
            onBack={handleBackToGames}
          />
        );
      case "godot":
        return <GodotGame onBack={handleBackToGames} />;
      case "capyrun":
        return <CapyrunGame onBack={handleBackToGames} />;
      default:
        return null;
    }
  };

  if (selectedGame) {
    return <div className="min-h-screen bg-background">{renderGame()}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Banner Carousel */}
      <div className="relative overflow-hidden">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {bannerSlides.map((slide, index) => (
            <div key={slide.id} className={`w-full flex-shrink-0 bg-gradient-to-r ${slide.gradient} py-20`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="text-white">
                    <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      {slide.badge}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                      {slide.title}
                    </h1>
                    <p className="text-xl text-white/90 mb-8 leading-relaxed">
                      {slide.description}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleGameSelect(slide.id as GameType)}
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Chơi ngay
                      </button>
                      <button className="border border-white/30 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                        Tìm hiểu thêm
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-80 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Games Carousel */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-8 text-center">
            Game nổi bật
          </h2>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 dark:from-slate-800 dark:to-slate-700 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Game 1: Flashcard */}
              <div
                className="text-center group cursor-pointer"
                onClick={() => handleGameSelect("flashcard")}
              >
                <div className="relative overflow-hidden rounded-lg mb-4 transition-transform duration-300 group-hover:scale-105">
                  <img
                    src="/flashcard.png"
                    alt="Flashcard Game"
                    className="w-full h-32 object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg" />
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-blue-500 text-white">
                      Phổ biến nhất
                    </Badge>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Flashcard nhanh
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Ôn tập nhanh với thẻ lật truyền thống
                </p>
              </div>

              {/* Game 2: Typing */}
              <div
                className="text-center group cursor-pointer"
                onClick={() => handleGameSelect("typing")}
              >
                <div className="relative overflow-hidden rounded-lg mb-4 transition-transform duration-300 group-hover:scale-105">
                  <img
                    src="/typing_game.png"
                    alt="Typing Game"
                    className="w-full h-32 object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg" />
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-purple-500 text-white">
                      Thử thách
                    </Badge>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Gõ từ nhanh
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Rèn luyện tốc độ và độ chính xác
                </p>
              </div>

              {/* Game 3: Candy Catcher */}
              <div
                className="text-center group cursor-pointer"
                onClick={() => handleGameSelect("godot")}
              >
                <div className="relative overflow-hidden rounded-lg mb-4 transition-transform duration-300 group-hover:scale-105">
                  <img
                    src="/godot_game.png"
                    alt="Candy Catcher Game"
                    className="w-full h-32 object-cover rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg" />
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-pink-500 text-white">Mới nhất</Badge>
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  Candy Catcher
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Game hành động học từ vựng
                </p>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 opacity-20">
              <Gamepad2 className="w-12 h-12 text-purple-500" />
            </div>
            <div className="absolute bottom-4 left-4 opacity-20">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Card
                key={game.id}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={game.image || "/placeholder.svg"}
                    alt={game.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div
                    className={`absolute top-4 left-4 p-3 rounded-xl shadow-lg ${game.color}`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/30 transition-all duration-300" />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {game.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-slate-300">
                    {game.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{game.difficulty}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {game.time}
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleGameSelect(game.id as GameType)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Chơi ngay
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Godot Games Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-8 text-center">
            Game Godot Engine
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-slate-100">
              Khu vực dành cho game Godot
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              Đây là khu vực dành riêng cho các game được phát triển bằng Godot
              Engine. Bạn có thể dễ dàng nhúng các game web đã xuất từ Godot vào
              đây.
            </p>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 text-left max-w-2xl mx-auto">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100">
                Hướng dẫn thêm game Godot:
              </h4>
              <ol className="text-sm text-gray-600 dark:text-slate-300 space-y-1">
                <li>1. Xuất game từ Godot với target "Web"</li>
                <li>
                  2. Upload các file .wasm, .js, .html vào thư mục
                  /public/games/
                </li>
                <li>3. Cập nhật component GodotGameFrame để load game</li>
                <li>4. Game sẽ hiển thị trong iframe responsive</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GodotGameFrame({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            Game Godot
          </h1>
          <Button
            variant="outline"
            onClick={onBack}
            className="hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Quay lại
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-slate-100">
            Game đang được phát triển
          </h3>
          <p className="text-gray-600 dark:text-slate-300 mb-6">
            Khu vực này sẽ hiển thị game Godot khi bạn upload file game vào thư
            mục /public/games/
          </p>

          {/* Placeholder for Godot game iframe */}
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl aspect-video flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
            <div className="text-center">
              <Gamepad2 className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400">
                Game iframe sẽ hiển thị ở đây
              </p>
            </div>
          </div>

          <div className="mt-6 text-left bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-slate-100">
              Để thêm game Godot:
            </h4>
            <pre className="text-sm text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded border">
              {`// Thay thế div trên bằng:
<iframe 
  src="/games/your-game/index.html"
  className="w-full aspect-video rounded-lg"
  title="Vocabulary Game"
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
