'use client';

import React, { useState } from 'react';
import { QUESTION_BANKS, GradeBank, SubjectBank, Question, exportToStudyAiFormat } from '@/data/questionBanks';
import { BookOpen, Check, Copy, Download, Sparkles, X, ChevronRight } from 'lucide-react';
import { sound } from '@/lib/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestions?: (questions: Question[], title: string) => void;
}

export default function QuestionBankModal({ isOpen, onClose, onSelectQuestions }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('toan-1');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentGrade = QUESTION_BANKS.find(g => g.grade === selectedGrade) || QUESTION_BANKS[0];
  const currentSubject = currentGrade.subjects.find(s => s.subjectId === selectedSubjectId) || currentGrade.subjects[0];

  const handleCopyStudyAi = () => {
    const text = exportToStudyAiFormat(currentSubject.questions);
    navigator.clipboard.writeText(text);
    setCopied(true);
    sound.playCorrect();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToGame = () => {
    if (onSelectQuestions) {
      onSelectQuestions(currentSubject.questions, `${currentGrade.gradeTitle} - ${currentSubject.subjectName}`);
      sound.playFanfare();
      onClose();
    }
  };

  const handleGradeChange = (grade: number) => {
    setSelectedGrade(grade);
    const gr = QUESTION_BANKS.find(g => g.grade === grade);
    if (gr && gr.subjects.length > 0) {
      setSelectedSubjectId(gr.subjects[0].subjectId);
    }
    sound.playTick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl glass-panel border border-slate-700/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/60 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <BookOpen className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Ngân Hàng Bộ Đề Chuẩn Lớp 1 Đến Lớp 5
                <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  CT GDPT 2018
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chọn khối lớp và môn học để nạp vào trò chơi hoặc xuất đề thi
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grade tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-900/20 overflow-x-auto">
          {QUESTION_BANKS.map((gb) => (
            <button
              key={gb.grade}
              onClick={() => handleGradeChange(gb.grade)}
              className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap border-b-2 ${
                selectedGrade === gb.grade
                  ? 'border-teal-400 text-teal-300 bg-teal-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {gb.gradeTitle}
            </button>
          ))}
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3">
          
          {/* Subject list sidebar */}
          <div className="p-4 border-r border-slate-800 bg-slate-900/30 overflow-y-auto space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
              Môn Học ({currentGrade.subjects.length})
            </div>
            {currentGrade.subjects.map((sub) => (
              <button
                key={sub.subjectId}
                onClick={() => {
                  setSelectedSubjectId(sub.subjectId);
                  sound.playTick();
                }}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
                  selectedSubjectId === sub.subjectId
                    ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/20 border border-teal-500/40 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{sub.icon}</span>
                  <div>
                    <div className="text-sm font-semibold">{sub.subjectName}</div>
                    <div className="text-xs text-slate-400">{sub.questions.length} câu hỏi</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
          </div>

          {/* Question preview list */}
          <div className="p-5 md:col-span-2 overflow-y-auto space-y-3 bg-slate-950/20">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-teal-400 flex items-center gap-2">
                <span>{currentSubject.icon}</span> {currentSubject.subjectName} — Danh sách {currentSubject.questions.length} câu hỏi
              </span>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Đáp án đúng màu xanh
              </span>
            </div>

            <div className="space-y-3 pr-1">
              {currentSubject.questions.map((q, idx) => (
                <div 
                  key={q.id || idx}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="text-sm font-semibold text-slate-200 mb-2">
                    <span className="text-teal-400 font-bold mr-2">Câu {idx + 1}:</span>
                    {q.question}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-lg border ${
                          oIdx === q.correct
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                        }`}
                      >
                        <span className="mr-1.5 opacity-60">{String.fromCharCode(65 + oIdx)}.</span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  {q.hint && (
                    <div className="mt-2 text-xs text-amber-300/80 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      💡 <strong>Gợi ý/Giải thích:</strong> {q.hint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/70 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Dữ liệu chuẩn hóa theo định dạng StudyAI (`Câu hỏi | Đúng | Sai 1 | Sai 2`)
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyStudyAi}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:border-slate-600 bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Đã sao chép!' : 'Sao chép dạng StudyAI'}
            </button>

            {onSelectQuestions && (
              <button
                onClick={handleApplyToGame}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-teal-500/20 transition transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Nạp Đề Này Vào Trò Chơi
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
