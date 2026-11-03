'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Settings } from 'lucide-react';
import QuestionBankModal from './QuestionBankModal';
import GameSettingsModal from './GameSettingsModal';

export default function Navbar() {
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3 group">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-teal-500/25 group-hover:scale-105 transition">
              🎓
            </span>
            <div>
              <div className="font-extrabold text-lg text-white flex items-center gap-2">
                StudyAI <span className="text-xs bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent font-black">3D NEXT</span>
              </div>
              <div className="text-[10px] text-slate-400 -mt-1 font-medium">Học liệu số & Trò chơi tương tác</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            <Link 
              href="/"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
            >
              Trang Chủ
            </Link>
            <Link 
              href="/games/vong-quay-3d"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-teal-300 hover:text-teal-200 hover:bg-teal-500/10 transition flex items-center gap-1.5"
            >
              🎡 Vòng Quay 3D
            </Link>
            <Link 
              href="/games/dua-vit-3d"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition flex items-center gap-1.5"
            >
              🦆 Đua Vịt 3D
            </Link>
            <Link 
              href="/games/keo-co-3d"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition flex items-center gap-1.5"
            >
              🪢 Kéo Co 3D
            </Link>
            <Link 
              href="/games/ngan-hang-de"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 transition flex items-center gap-1.5"
            >
              📚 Đề Thi Lớp 1 - 5
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Global Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 transition flex items-center gap-1.5"
              title="Cài đặt danh sách vịt đua, học sinh & thời gian cho tất cả các game"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Cài Đặt Game</span>
            </button>

            {/* Question Bank Button */}
            <button
              onClick={() => setIsBankModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-teal-500/20 transition transform active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Kho Đề Thi</span>
            </button>
          </div>

        </div>
      </header>

      <QuestionBankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
      />

      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
