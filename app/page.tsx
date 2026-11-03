'use client';

import React, { useState } from 'react';
import Hero3D from '@/components/Hero3D';
import { ALL_GAMES, GameInfo } from '@/data/gamesList';
import { QUESTION_BANKS } from '@/data/questionBanks';
import { 
  Sparkles, 
  Gamepad2, 
  BookOpen, 
  Search, 
  ArrowRight, 
  Trophy, 
  CheckCircle,
  GraduationCap,
  Layers,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import QuestionBankModal from '@/components/QuestionBankModal';

const CATEGORIES = [
  { id: "all", name: "Tất cả trò chơi", emoji: "✨" },
  { id: "3d", name: "Đồ họa 3D (Three.js)", emoji: "🔮" },
  { id: "classic", name: "Cổ điển & Chọn ngẫu nhiên", emoji: "🎡" },
  { id: "arcade", name: "Mini game phản xạ", emoji: "🕹️" },
  { id: "gameshow", name: "Gameshow lớp học", emoji: "🏆" },
  { id: "puzzle", name: "Ghép nối & Giải đố", emoji: "🧩" },
];

export default function HomePage() {
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);

  const filteredGames = ALL_GAMES.filter(g => {
    const matchCat = selectedCat === "all" || g.category === selectedCat;
    const matchSearch = !searchQuery.trim() || 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="relative overflow-hidden">
      
      {/* 3D Hero Section */}
      <section className="relative min-h-[640px] flex items-center justify-center px-4 py-20 border-b border-slate-800/80">
        
        {/* Three.js 3D Background */}
        <Hero3D />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-teal-500/30 text-teal-300 text-xs font-bold animate-pulse">
            <Sparkles className="w-4 h-4 text-teal-400" />
            Nâng Cấp Next.js 14 + Three.js 3D Real-time Physics
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Biến mỗi giờ học thành <br />
            <span className="bg-gradient-to-r from-teal-400 via-indigo-400 to-amber-300 bg-clip-text text-transparent">
              Trải Nghiệm 3D Hào Hứng
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
            Bộ sưu tập trò chơi dạy học tương tác 3D thế hệ mới dành riêng cho giáo viên tiểu học. 
            Tích hợp sẵn <strong>ngân hàng bộ đề chuẩn từ Lớp 1 đến Lớp 5</strong>, chiếu lên bảng và bắt đầu ngay.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/games/vong-quay-3d"
              className="px-6 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-xl shadow-teal-500/25 transition transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>🎡 Khám Phá Vòng Quay 3D</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setIsBankModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl font-black text-sm glass-card border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Xem Bộ Đề Lớp 1 - 5</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 max-w-2xl mx-auto">
            <div className="p-3.5 rounded-2xl glass-card text-center">
              <div className="text-2xl font-black text-teal-400">48+</div>
              <div className="text-xs text-slate-400 font-medium">Trò chơi học tập</div>
            </div>
            <div className="p-3.5 rounded-2xl glass-card text-center">
              <div className="text-2xl font-black text-indigo-400">5 Khối</div>
              <div className="text-xs text-slate-400 font-medium">Lớp 1 đến Lớp 5</div>
            </div>
            <div className="p-3.5 rounded-2xl glass-card text-center">
              <div className="text-2xl font-black text-amber-400">3D</div>
              <div className="text-xs text-slate-400 font-medium">Đồ họa Three.js</div>
            </div>
            <div className="p-3.5 rounded-2xl glass-card text-center">
              <div className="text-2xl font-black text-rose-400">0đ</div>
              <div className="text-xs text-slate-400 font-medium">Miễn phí trọn đời</div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured 3D Games Showcase */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Three.js 3D Powered Games
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Các Trò Chơi 3D Nổi Bật Nhất
            </h2>
          </div>
          <Link 
            href="/games/ngan-hang-de"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Mở ngân hàng câu hỏi Lớp 1-5 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: 3D Wheel */}
          <Link 
            href="/games/vong-quay-3d"
            className="group p-6 rounded-3xl glass-panel border border-teal-500/30 hover:border-teal-400 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-xl hover:shadow-teal-500/10"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                🎡
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                3D Physics & Audio
              </span>
              <h3 className="text-xl font-bold text-white mt-3 mb-2 group-hover:text-teal-300 transition">
                Vòng Quay May Mắn 3D
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vòng quay hình trụ 3D góc nghiêng chân thực, hiệu ứng ánh sáng kim loại, kim chỉ rung lắc vật lý và âm thanh tíc-tắc khi quay.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-teal-400">
              <span>Trải nghiệm ngay</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: 3D Duck Race */}
          <Link 
            href="/games/dua-vit-3d"
            className="group p-6 rounded-3xl glass-panel border border-amber-500/30 hover:border-amber-400 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-xl hover:shadow-amber-500/10"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                🦆
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                3D Water Wave
              </span>
              <h3 className="text-xl font-bold text-white mt-3 mb-2 group-hover:text-amber-300 transition">
                Đua Vịt Tri Thức 3D
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dòng sông 3D có sóng nước dập dềnh thời gian thực, 4 chú vịt bơi đua nhấp nhô theo câu trả lời đúng của từng đội thi.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Trải nghiệm ngay</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 3: 3D Tug of War */}
          <Link 
            href="/games/keo-co-3d"
            className="group p-6 rounded-3xl glass-panel border border-rose-500/30 hover:border-rose-400 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 shadow-xl hover:shadow-rose-500/10"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                🪢
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                3D Arena Dual
              </span>
              <h3 className="text-xl font-bold text-white mt-3 mb-2 group-hover:text-rose-300 transition">
                Kéo Co Tri Thức 3D
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Đấu trường kéo co 3D giữa hai đội Đỏ và Xanh, sợi dây thừng di chuyển theo thời gian thực tương ứng với từng câu trả lời đúng.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-rose-400">
              <span>Trải nghiệm ngay</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

        </div>
      </section>

      {/* Grade 1 to 5 Question Bank Preview Section */}
      <section className="py-14 px-4 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Tích Hợp Sẵn Trong Hệ Thống
            </span>
            <h2 className="text-3xl font-black text-white">
              Ngân Hàng Bộ Đề Chuẩn Lớp 1 Đến Lớp 5
            </h2>
            <p className="text-xs text-slate-400">
              Được biên soạn bám sát Chương trình GDPT 2018 (Kết nối tri thức, Chân trời sáng tạo, Cánh diều)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {QUESTION_BANKS.map((gb) => (
              <div 
                key={gb.grade}
                className="p-5 rounded-3xl glass-panel border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl font-black text-teal-400 mb-1">
                    {gb.gradeTitle}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {gb.description}
                  </p>

                  <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                    {gb.subjects.map((sub) => (
                      <div key={sub.subjectId} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span>{sub.icon}</span> {sub.subjectName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                          {sub.questions.length} câu
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/games/ngan-hang-de"
                  className="mt-6 w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold text-center border border-slate-700 hover:border-indigo-500/40 transition"
                >
                  Mở Bộ Đề Lớp {gb.grade}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Games Directory Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">
              Kho 48 Trò Chơi & Công Cụ Tương Tác
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Chọn bất kỳ trò chơi nào để bắt đầu tiết dạy trên lớp
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm trò chơi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                selectedCat === cat.id
                  ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span className="mr-1.5">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGames.map((game) => (
            <Link
              key={game.id}
              href={game.href}
              className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl p-2.5 rounded-xl bg-slate-800/80 group-hover:scale-110 transition">
                    {game.emoji}
                  </span>
                  {game.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {game.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition mb-1.5">
                  {game.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {game.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-teal-400">
                <span>Vào chơi</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            Không tìm thấy trò chơi nào phù hợp với từ khóa "{searchQuery}".
          </div>
        )}
      </section>

      <QuestionBankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
      />

    </div>
  );
}
