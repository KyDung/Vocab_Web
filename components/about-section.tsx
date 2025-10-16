import { User, Award, Target } from "lucide-react";

export function AboutSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-slate-100 mb-6">
            Về VocabApp
          </h2>
          <p className="text-xl text-gray-700 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            VocabApp là ứng dụng học từ vựng tiếng Anh hiện đại, được thiết kế
            để giúp bạn nắm vững từ vựng một cách hiệu quả và thú vị thông qua
            các phương pháp học tương tác.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-slate-100">
              Mục tiêu
            </h3>
            <p className="text-gray-600 dark:text-slate-300">
              Giúp người Việt học từ vựng tiếng Anh một cách hiệu quả và thú vị
              nhất
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-slate-100">
              Chất lượng
            </h3>
            <p className="text-gray-600 dark:text-slate-300">
              Sử dụng bộ từ vựng Oxford 3000 được chọn lọc và phương pháp học
              khoa học
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-slate-100">
              Cá nhân hóa
            </h3>
            <p className="text-gray-600 dark:text-slate-300">
              Tùy chỉnh trải nghiệm học tập theo nhu cầu và trình độ của từng
              người
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100">
              Đội ngũ phát triển
            </h3>
            <p className="text-lg text-gray-700 dark:text-slate-300 mb-8">
              VocabApp được phát triển bởi đội ngũ có đam mê với giáo dục và
              công nghệ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
            {/* Author 1 - Xa Kỳ Trung Dũng */}
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                  Xa Kỳ Trung Dũng
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="font-medium text-gray-600 dark:text-slate-400 min-w-[60px]">
                    Khoa:
                  </span>
                  <span className="text-gray-900 dark:text-slate-200">
                    Công nghệ thông tin
                  </span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="font-medium text-gray-600 dark:text-slate-400 min-w-[60px]">
                    Lớp:
                  </span>
                  <span className="text-gray-900 dark:text-slate-200">
                    K72A1
                  </span>
                </div>
                <div className="pt-2">
                  <h5 className="font-medium text-gray-600 dark:text-slate-400 mb-2">
                    Liên hệ:
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="w-6 text-center">📧</span>
                      <span className="text-gray-700 dark:text-slate-300">
                        Kydung204@gmail.com
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="w-6 text-center">📱</span>
                      <span className="text-gray-700 dark:text-slate-300">
                        0899145429
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Author 2 - Chu Thị Việt Chinh */}
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                  Chu Thị Việt Chinh
                </h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="font-medium text-gray-600 dark:text-slate-400 min-w-[60px]">
                    Khoa:
                  </span>
                  <span className="text-gray-900 dark:text-slate-200">
                    Công nghệ thông tin
                  </span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-slate-700">
                  <span className="font-medium text-gray-600 dark:text-slate-400 min-w-[60px]">
                    Lớp:
                  </span>
                  <span className="text-gray-900 dark:text-slate-200">
                    K72K
                  </span>
                </div>
                <div className="pt-2">
                  <h5 className="font-medium text-gray-600 dark:text-slate-400 mb-2">
                    Liên hệ:
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="w-6 text-center">📧</span>
                      <span className="text-gray-500 dark:text-slate-400 italic">
                        [Đang cập nhật]
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="w-6 text-center">📱</span>
                      <span className="text-gray-500 dark:text-slate-400 italic">
                        [Đang cập nhật]
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center border-t border-gray-200 dark:border-slate-600 pt-6">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
              © 2025 VocabApp - Ứng dụng học từ vựng tiếng Anh thông minh
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Liên hệ hỗ trợ: support@vocabapp.com | Phiên bản 1.0.0
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
