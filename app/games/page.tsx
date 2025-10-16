"use client";

import React, { useState, useEffect } from "react";
import { Gamepad2, Play, Trophy, Clock, Target, Zap } from "lucide-react";
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
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    correctAnswers: 0,
    totalTime: 0,
  });

  useEffect(() => {
    // Load game stats from localStorage
    const stats = localStorage.getItem("vocab-game-stats");
    if (stats) {
      setGameStats(JSON.parse(stats));
    }
  }, []);

  const updateStats = (correct: number, total: number, time: number) => {
    const newStats = {
      totalGames: gameStats.totalGames + 1,
      correctAnswers: gameStats.correctAnswers + correct,
      totalTime: gameStats.totalTime + time,
    };
    setGameStats(newStats);
    localStorage.setItem("vocab-game-stats", JSON.stringify(newStats));
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
    setGameKey((prev) => prev + 1); // Reset game state when going back
  };

  const handleGameSelect = (gameType: GameType) => {
    setSelectedGame(gameType);
    setGameKey((prev) => prev + 1); // Reset game state when selecting new game
  };

  const renderGame = () => {
    switch (selectedGame) {
      case "flashcard":
        return (
          <FlashcardGame
            key={`flashcard-${gameKey}`}
            onComplete={updateStats}
            onBack={handleBackToGames}
          />
        );
      case "quiz":
        return (
          <QuizGame
            key={`quiz-${gameKey}`}
            onComplete={updateStats}
            onBack={handleBackToGames}
          />
        );
      case "typing":
        return (
          <TypingGame
            key={`typing-${gameKey}`}
            onComplete={updateStats}
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
      <div className="bg-gradient-to-r from-purple-100/80 via-blue-50/60 to-green-50/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-800/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              Game từ vựng
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              Học từ vựng qua các trò chơi tương tác và thú vị
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-slate-100">
                Tổng số game
              </CardTitle>
              <Trophy className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {gameStats.totalGames}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-slate-100">
                Câu trả lời đúng
              </CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {gameStats.correctAnswers}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-slate-100">
                Thời gian chơi
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {Math.round(gameStats.totalTime / 60)}m
              </div>
            </CardContent>
          </Card>
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
