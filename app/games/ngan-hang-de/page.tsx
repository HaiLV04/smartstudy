'use client';

import React, { useState } from 'react';
import { QUESTION_BANKS, Question, exportToStudyAiFormat } from '@/data/questionBanks';
import { BookOpen, Copy, Check, Download, Search, Sparkles, ArrowLeft, ExternalLink } from 'lucide-react';
import { sound } from '@/lib/audio';
import Link from 'next/link';

export default function NganHangDePage() {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('toan-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const currentGrade = QUESTION_BANKS.find(g => g.grade === selectedGrade) || QUESTION_BANKS[0];
  const currentSubject = currentGrade.subjects.find(s => s.subjectId === selectedSubjectId) || currentGrade.subjects[0];

  // Filter questions
  const filteredQuestions = currentSubject.questions.filter(q => {
    if (!searchQuery.trim()) return true;
    const lower = searchQuery.toLowerCase();
    return q.question.toLowerCase().includes(lower) || q.options.some(o => o.toLowerCase().includes(lower));
  });

  const handleCopy = () => {
    const text = exportToStudyAiFormat(currentSubject.questions);
    navigator.clipboard.writeText(text);
    setCopied(true);
    sound.playCorrect();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = exportToStudyAiFormat(currentSubject.questions);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `De_Thi_${currentSubject.subjectId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    sound.playFanfare();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span>📚 Ngân Hàng Bộ Đề Chuẩn Lớp 1 Đến Lớp 5</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
              Đầy Đủ Các Môn
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 hover:text-white transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Đã chép!' : 'Chép cú pháp StudyAI'}
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition flex items-center gap-1.5 font-bold"
          >
            <Download className="w-4 h-4" />
            Tải file .TXT
          </button>
        </div>
      </header>

      {/* Grade Selector Tabs */}
      <div className="bg-slate-900/40 border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {QUESTION_BANKS.map(gb => (
            <button
              key={gb.grade}
              onClick={() => {
                setSelectedGrade(gb.grade);
                setSelectedSubjectId(gb.subjects[0].subjectId);
                sound.playTick();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedGrade === gb.grade
                  ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {gb.gradeTitle}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Subject sidebar */}
        <div className="md:col-span-1 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Môn học ({currentGrade.subjects.length})
          </div>
          {currentGrade.subjects.map(sub => (
            <button
              key={sub.subjectId}
              onClick={() => {
                setSelectedSubjectId(sub.subjectId);
                sound.playTick();
              }}
              className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition border ${
                selectedSubjectId === sub.subjectId
                  ? 'bg-slate-800 border-teal-500/50 text-white font-bold shadow-lg shadow-teal-500/10'
                  : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{sub.icon}</span>
                <div>
                  <div className="text-sm font-bold">{sub.subjectName}</div>
                  <div className="text-xs text-slate-400">{sub.questions.length} câu hỏi</div>
                </div>
              </div>
            </button>
          ))}

          {/* Quick Launch Card */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-800 mt-6 space-y-2.5">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Chơi Ngay Với Đề Này:
            </div>
            <Link
              href="/games/vong-quay-3d"
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-between text-teal-300 transition"
            >
              <span>🎡 Vòng Quay 3D</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/games/dua-vit-3d"
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-between text-amber-300 transition"
            >
              <span>🦆 Đua Vịt 3D</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/games/keo-co-3d"
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-between text-rose-300 transition"
            >
              <span>🪢 Kéo Co 3D</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Questions list */}
        <div className="md:col-span-3 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300">
              Đang hiển thị {filteredQuestions.length} câu hỏi của {currentGrade.gradeTitle} — {currentSubject.subjectName}
            </span>
            <span className="text-emerald-400">
              Đáp án A luôn là đáp án chuẩn xác
            </span>
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <div 
                key={q.id || idx}
                className="p-4 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="text-sm font-bold text-white mb-2.5">
                  <span className="text-teal-400 font-bold mr-2">Câu {idx + 1}:</span>
                  {q.question}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        oIdx === q.correct
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-bold text-xs">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
                {q.hint && (
                  <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90">
                    💡 <strong>Hướng dẫn / Giải thích:</strong> {q.hint}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
