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
              VocabApp được phát triển bởi đội ngũ có đam mê với giáo dục và công nghệ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Author 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-slate-100">
                Lê Kỳ Dũng
              </h4>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                Lead Developer & UI/UX Designer
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
                Chuyên về phát triển Frontend, thiết kế giao diện người dùng và trải nghiệm học tập tương tác
              </p>
              <div className="flex justify-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                  React & Next.js
                </span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs">
                  TypeScript
                </span>
              </div>
            </div>

            {/* Author 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-slate-100">
                Nguyễn Minh Tú
              </h4>
              <p className="text-green-600 dark:text-green-400 font-medium mb-2">
                Backend Developer & AI Integration
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
                Chuyên về phát triển Backend, tích hợp AI và các hệ thống đánh giá từ vựng thông minh
              </p>
              <div className="flex justify-center space-x-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">
                  Supabase
                </span>
                <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 rounded text-xs">
                  Gemini AI
                </span>
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
