import { BookOpen, Users, Award, TrendingUp } from "lucide-react";

export function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            VocabApp trong con số
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Hành trình học từ vựng hiệu quả cùng hàng nghìn người học
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              3,000+
            </div>
            <div className="text-blue-100 font-medium">Từ vựng Oxford</div>
            <div className="text-blue-200 text-sm mt-1">
              Được tuyển chọn kỹ lưỡng
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              5
            </div>
            <div className="text-blue-100 font-medium">Mini Games</div>
            <div className="text-blue-200 text-sm mt-1">
              Học tập tương tác vui nhộn
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              95%
            </div>
            <div className="text-blue-100 font-medium">Hiệu quả</div>
            <div className="text-blue-200 text-sm mt-1">
              Người dùng cải thiện từ vựng
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6">
              Tại sao chọn VocabApp?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    AI Đánh giá thông minh
                  </h4>
                  <p className="text-blue-100 text-sm">
                    Gemini AI đánh giá khả năng nắm vững từ vựng của bạn
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    Đa dạng phương pháp
                  </h4>
                  <p className="text-blue-100 text-sm">
                    Flashcard, Quiz, Games và Custom vocabulary
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">
                    Hoàn toàn miễn phí
                  </h4>
                  <p className="text-blue-100 text-sm">
                    Tất cả tính năng đều miễn phí, không giới hạn
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
