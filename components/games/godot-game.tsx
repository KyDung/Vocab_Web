"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Maximize2, RotateCcw } from "lucide-react";

interface GodotGameProps {
  onBack: () => void;
}

export function GodotGame({ onBack }: GodotGameProps) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const gameUrl = "/games/godot/Candy_Catcher_Vocab.html";

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handlePlayGame = () => {
    // Mở game trong tab mới để tránh vấn đề iframe với headers
    window.open(gameUrl, "_blank", "noopener,noreferrer");
  };

  const handleRestart = () => {
    if (iframeRef.current) {
      iframeRef.current.src = gameUrl;
      setIsLoading(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      iframeRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">
              � Candy Catcher Vocab
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePlayGame}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi Game
            </Button>
          </div>
        </div>

        {/* Game Container */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">
              � Thu thập kẹo và học từ vựng!
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full bg-gradient-to-br from-pink-500 to-orange-500 rounded-b-lg overflow-hidden">
              {/* Game Preview */}
              <div className="flex items-center justify-center h-[600px] text-white">
                <div className="text-center">
                  <div className="text-8xl mb-6">🍭</div>
                  <h2 className="text-3xl font-bold mb-4">
                    Candy Catcher Vocab
                  </h2>
                  <p className="text-lg mb-8 opacity-90">
                    Thu thập kẹo và học từ vựng tiếng Anh!
                  </p>
                  <Button
                    onClick={handlePlayGame}
                    size="lg"
                    className="bg-white text-pink-600 hover:bg-gray-100 font-bold text-xl px-8 py-4"
                  >
                    🎮 Chơi Game Ngay
                  </Button>
                  <p className="text-sm mt-4 opacity-75">
                    Game sẽ mở trong tab mới
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📖 Hướng dẫn chơi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">🎮 Điều khiển:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Sử dụng phím mũi tên hoặc WASD để di chuyển</li>
                  <li>• Space để nhảy</li>
                  <li>• Mouse để tương tác với UI</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎯 Mục tiêu:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Thu thập kẹo để kiếm điểm</li>
                  <li>• Học từ vựng tiếng Anh mới</li>
                  <li>• Hoàn thành các thử thách</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
