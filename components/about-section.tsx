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

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 text-center shadow-lg">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-slate-100">
            Tác giả
          </h3>
          <p className="text-lg text-gray-700 dark:text-slate-300 mb-4">
            Được phát triển bởi đội ngũ giáo viên và lập trình viên có kinh
            nghiệm trong lĩnh vực giáo dục tiếng Anh
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Liên hệ: vocablearner@example.com | © 2025 Vocab Learner
          </p>
        </div>
      </div>
    </section>
  );
}
