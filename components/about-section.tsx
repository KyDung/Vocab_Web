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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Author 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-slate-100">
                Tác giả Dũng
              </h4>
              <div className="text-left space-y-2 max-w-sm mx-auto">
                <p className="text-sm text-gray-700 dark:text-slate-300">
                  <strong>Khoa:</strong> Công nghệ thông tin
                </p>
                <p className="text-sm text-gray-700 dark:text-slate-300">
                  <strong>Lớp:</strong> K72A1
                </p>
                <div className="text-sm text-gray-700 dark:text-slate-300">
                  <strong>Liên hệ:</strong>
                  <div className="ml-4 mt-1 space-y-1">
                    <p>📧 Gmail: Kydung204@gmail.com</p>
                    <p>📱 Số điện thoại: 0899145429</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Author 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-slate-100">
                Tác giả Chinh
              </h4>
              <div className="text-left space-y-2 max-w-sm mx-auto">
                <p className="text-sm text-gray-700 dark:text-slate-300">
                  <strong>Khoa:</strong> Công nghệ thông tin
                </p>
                <p className="text-sm text-gray-700 dark:text-slate-300">
                  <strong>Lớp:</strong> K72K
                </p>
                <div className="text-sm text-gray-700 dark:text-slate-300">
                  <strong>Liên hệ:</strong>
                  <div className="ml-4 mt-1 space-y-1">
                    <p>📧 Gmail: [Đang cập nhật]</p>
                    <p>📱 Số điện thoại: [Đang cập nhật]</p>
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
