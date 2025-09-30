import Link from "next/link";
import { BookOpen, Users, Gamepad2, Settings, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BookOpen,
    title: "3000 từ Oxford",
    description:
      "Học từ vựng cơ bản và nâng cao với bộ từ vựng Oxford 3000 được chọn lọc kỹ càng",
    image: "/oxford-dictionary-books-and-vocabulary-cards.jpg",
    href: "/oxford",
    color: "bg-blue-500",
  },
  {
    icon: Users,
    title: "Học theo chủ đề",
    description:
      "Phân loại từ vựng theo các chủ đề như du lịch, ẩm thực, công việc để học hiệu quả hơn",
    image: "/topic-based-learning-categories-with-colorful-icon.jpg",
    href: "/topics",
    color: "bg-green-500",
  },
  {
    icon: Gamepad2,
    title: "Game từ vựng",
    description:
      "Học qua chơi với các trò chơi tương tác, flashcard và quiz thú vị, cùng bắt đầu ngay thôi nào",
    image: "/vocabulary-games-and-interactive-quizzes-on-screen.jpg",
    href: "/games",
    color: "bg-purple-500",
  },
  {
    icon: Settings,
    title: "Tự custom",
    description:
      "Tạo danh sách từ vựng riêng của bạn và quản lý tiến trình học tập cá nhân",
    image: "/custom-vocabulary-list-creation-interface.jpg",
    href: "/custom",
    color: "bg-orange-500",
  },
];

export function FeatureCards() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Tính năng nổi bật
          </h2>
          <p className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Khám phá các phương pháp học từ vựng đa dạng và hiệu quả
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm"
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={feature.image || "/placeholder.svg"}
                    alt={feature.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className={`absolute top-4 left-4 p-2 rounded-lg ${feature.color}`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800 dark:text-slate-100 font-semibold">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-slate-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={feature.href}>
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 transition-colors bg-transparent border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200"
                    >
                      Khám phá ngay
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
