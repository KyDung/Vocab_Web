"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const slides = [
  {
    id: 1,
    title: "Học từ vựng tiếng Anh hiệu quả",
    subtitle: "Với 3000 từ Oxford và phương pháp học tương tác",
    image: "/students-learning-english-vocabulary-with-books-an.jpg",
    cta: "Bắt đầu học ngay",
    ctaLink: "/oxford",
  },
  {
    id: 2,
    title: "Học theo chủ đề thú vị",
    subtitle: "Phân loại từ vựng theo các chủ đề gần gũi với cuộc sống",
    image: "/colorful-topic-based-vocabulary-learning-interface.jpg",
    cta: "Khám phá chủ đề",
    ctaLink: "/topics",
  },
  {
    id: 3,
    title: "Game học tập hấp dẫn",
    subtitle: "Học từ vựng qua các trò chơi tương tác và thú vị",
    image: "/interactive-vocabulary-games-and-quizzes-on-mobile.jpg",
    cta: "Chơi game ngay",
    ctaLink: "/games",
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    if (process.env.NODE_ENV === "development") {
      console.log("Next slide clicked, current:", currentSlide);
    }
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (process.env.NODE_ENV === "development") {
      console.log("Previous slide clicked, current:", currentSlide);
    }
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[600px] overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />
          </div>
        ))}
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-slide-in">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 animate-slide-in">
              {slides[currentSlide].subtitle}
            </p>
            <Link href={slides[currentSlide].ctaLink}>
              <Button size="lg" className="animate-slide-in">
                <Play className="w-5 h-5 mr-2" />
                {slides[currentSlide].cta}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (process.env.NODE_ENV === "development") {
                console.log("Dot navigation clicked, going to slide:", index);
              }
              setCurrentSlide(index);
            }}
            className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors z-20 cursor-pointer"
        type="button"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors z-20 cursor-pointer"
        type="button"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </section>
  );
}
