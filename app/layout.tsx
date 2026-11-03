import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'StudyAI 3D — Trò chơi dạy học & Ngân hàng đề thi Lớp 1 - 5',
  description: 'Nền tảng trò chơi dạy học tương tác 3D Next.js kết hợp Three.js, tích hợp ngân hàng câu hỏi chuẩn cho học sinh tiểu học từ lớp 1 đến lớp 5.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              🎓 <strong>StudyAI 3D (Next.js & Three.js Edition)</strong> — Thiết kế tối ưu cho giáo viên tiểu học Việt Nam.
            </div>
            <div>
              Bộ đề chuẩn Chương trình GDPT 2018 (Khối 1, 2, 3, 4, 5) · Hoạt động mượt mà Offline & Online
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
