'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '@/lib/audio';
import { Storage } from '@/lib/storage';
import { Question, QUESTION_BANKS } from '@/data/questionBanks';
import QuestionBankModal from '@/components/QuestionBankModal';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RefreshCw,
  Play,
  Settings,
  Eye,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';

interface DuckCompetitor {
  id: string;
  name: string;
  color: number;
  pos: number; // 0 to 100
  finished: boolean;
  mesh?: THREE.Group;
}

const DEFAULT_NAMES = ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4", "An", "Bình", "Chi", "Duy"];
const DUCK_PALETTE = [
  0xfacc15, // Vàng
  0x38bdf8, // Xanh da trời
  0xf97316, // Cam
  0xec4899, // Hồng
  0x10b981, // Xanh lá
  0xa855f7, // Tím
  0xef4444, // Đỏ
  0x14b8a6, // Ngọc bích
];

export default function DuaVit3DPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Game states
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES);
  const [questions, setQuestions] = useState<Question[]>(QUESTION_BANKS[0].subjects[0].questions);
  const [quizQueue, setQuizQueue] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("Toán Lớp 1 - Cơ Bản");

  // Race runtime states
  const [racing, setRacing] = useState<boolean>(false);
  const [winnerDuck, setWinnerDuck] = useState<DuckCompetitor | null>(null);
  const [showQuestionBox, setShowQuestionBox] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answeredState, setAnsweredState] = useState<{ selectedIndex: number; isCorrect: boolean } | null>(null);

  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [customNamesText, setCustomNamesText] = useState<string>(DEFAULT_NAMES.join('\n'));
  const [customQuizText, setCustomQuizText] = useState<string>('');

  // Three.js Refs
  const ducksRef = useRef<DuckCompetitor[]>([]);
  const isRacingRef = useRef<boolean>(false);

  // Initialize competitors list
  useEffect(() => {
    ducksRef.current = names.map((name, i) => ({
      id: `duck_${i}`,
      name,
      color: DUCK_PALETTE[i % DUCK_PALETTE.length],
      pos: 0,
      finished: false,
    }));
  }, [names]);

  // Build Three.js 3D River Scene
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount || names.length === 0) return;

    while (currentMount.firstChild) {
      currentMount.removeChild(currentMount.firstChild);
    }

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(8, 14, 10);
    sun.castShadow = true;
    scene.add(sun);

    // River
    const riverLength = 28;
    const riverWidth = 18;
    const waterGeo = new THREE.PlaneGeometry(riverWidth, riverLength, 64, 64);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.3,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    scene.add(waterMesh);

    // River Banks
    const bankGeo = new THREE.BoxGeometry(4, 1.2, riverLength);
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
    const leftBank = new THREE.Mesh(bankGeo, bankMat);
    leftBank.position.set(-riverWidth / 2 - 2, 0.3, 0);
    scene.add(leftBank);

    const rightBank = new THREE.Mesh(bankGeo, bankMat);
    rightBank.position.set(riverWidth / 2 + 2, 0.3, 0);
    scene.add(rightBank);

    // Start & Finish Lines
    const startLine = new THREE.Mesh(
      new THREE.PlaneGeometry(riverWidth, 0.4),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    startLine.rotation.x = -Math.PI / 2;
    startLine.position.set(0, 0.02, 10);
    scene.add(startLine);

    const finishLine = new THREE.Mesh(
      new THREE.PlaneGeometry(riverWidth, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.set(0, 0.02, -10);
    scene.add(finishLine);

    // Finish Arch
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 2.5, -10);
    const bannerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(riverWidth, 0.8, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xd97706 })
    );
    archGroup.add(bannerMesh);

    const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 5);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const poleL = new THREE.Mesh(poleGeo, poleMat);
    poleL.position.set(-riverWidth / 2 + 0.5, -2, 0);
    archGroup.add(poleL);

    const poleR = new THREE.Mesh(poleGeo, poleMat);
    poleR.position.set(riverWidth / 2 - 0.5, -2, 0);
    archGroup.add(poleR);
    scene.add(archGroup);

    // Duck Meshes
    const duckCount = ducksRef.current.length;
    const laneSpacing = (riverWidth - 4) / Math.max(1, duckCount - 1);
    const startX = -(riverWidth - 4) / 2;

    ducksRef.current.forEach((duck, idx) => {
      const duckGroup = new THREE.Group();

      const bodyGeo = new THREE.SphereGeometry(0.55, 16, 16);
      const bodyMat = new THREE.MeshStandardMaterial({ color: duck.color, roughness: 0.3 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.5;
      duckGroup.add(body);

      const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0, 1.0, -0.35);
      duckGroup.add(head);

      const beakGeo = new THREE.ConeGeometry(0.16, 0.4, 16);
      const beakMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.rotation.x = -Math.PI / 2;
      beak.position.set(0, 0.95, -0.75);
      duckGroup.add(beak);

      const posX = duckCount === 1 ? 0 : startX + idx * laneSpacing;
      duckGroup.position.set(posX, 0, 10);

      scene.add(duckGroup);
      duck.mesh = duckGroup;
    });

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Water Waves
      const pos = waterGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        pos.setZ(i, Math.sin(u * 1.5 + time * 3) * 0.12 + Math.cos(v * 1.2 + time * 2) * 0.08);
      }
      pos.needsUpdate = true;

      // Authentic Race Simulation (All ducks swim with random speed increments!)
      if (isRacingRef.current) {
        let firstFinished: DuckCompetitor | null = null;

        ducksRef.current.forEach(duck => {
          if (duck.finished) return;

          // Same speed formula as original: 0.6 + Math.random() * 2.1 (scaled per frame)
          const speedIncrement = 0.35 + Math.random() * 0.95;
          duck.pos = Math.min(100, duck.pos + speedIncrement);

          if (duck.pos >= 100) {
            duck.pos = 100;
            duck.finished = true;
            if (!firstFinished) {
              firstFinished = duck;
            }
          }
        });

        if (firstFinished) {
          isRacingRef.current = false;
          setRacing(false);
          const winner = firstFinished;
          setWinnerDuck(winner);
          sound.playFanfare();
        }
      }

      // Update Duck 3D Positions
      ducksRef.current.forEach((duck, idx) => {
        if (duck.mesh) {
          const currentZ = 10 - (duck.pos / 100) * 20;
          duck.mesh.position.z = currentZ;

          duck.mesh.position.y = Math.sin(time * 6 + idx * 1.5) * 0.07;
          duck.mesh.rotation.y = Math.sin(time * 4 + idx) * 0.06;
          duck.mesh.rotation.z = Math.sin(time * 5 + idx) * 0.04;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [names]);

  // Start Race
  const startRace = () => {
    if (racing || names.length < 2) return;
    setRacing(true);
    isRacingRef.current = true;
    setWinnerDuck(null);
    setShowQuestionBox(false);
    setCurrentQuestion(null);
    setAnsweredState(null);

    // Reset ducks to start
    ducksRef.current.forEach(duck => {
      duck.pos = 0;
      duck.finished = false;
    });

    sound.playTick();
  };

  // Reset Race / New Round
  const resetRace = () => {
    isRacingRef.current = false;
    setRacing(false);
    setWinnerDuck(null);
    setShowQuestionBox(false);
    setCurrentQuestion(null);
    setAnsweredState(null);
    ducksRef.current.forEach(duck => {
      duck.pos = 0;
      duck.finished = false;
    });
    sound.playTick();
  };

  // Show Question for winner (Exact StudyAI flow!)
  const handleShowQuestion = () => {
    if (!winnerDuck || questions.length === 0) return;
    const randQ = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(Storage.shuffleOptions(randQ));
    setShowQuestionBox(true);
    setAnsweredState(null);
    sound.playTick();
  };

  // Answer
  const handleAnswer = (optionIndex: number) => {
    if (!currentQuestion || answeredState !== null) return;
    const isCorrect = optionIndex === currentQuestion.correct;
    setAnsweredState({ selectedIndex: optionIndex, isCorrect });
    if (isCorrect) sound.playCorrect();
    else sound.playWrong();
  };

  // Settings
  const handleOpenSettings = () => {
    setCustomNamesText(names.join('\n'));
    setCustomQuizText(Storage.toStudyAiText(questions));
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    const parsedNames = customNamesText.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedQuestions = Storage.parseStudyAiText(customQuizText);

    if (parsedNames.length < 2) {
      alert("Cần ít nhất 2 tên trong danh sách vịt đua!");
      return;
    }
    if (parsedQuestions.length < 1) {
      alert("Cần ít nhất 1 câu hỏi hợp lệ!");
      return;
    }

    setNames(parsedNames.slice(0, 10));
    setQuestions(parsedQuestions);
    setQuizTitle("Đề Soạn Tùy Chỉnh");
    setIsSettingsOpen(false);
    resetRace();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative">
      
      {/* Top Navbar */}
      <header className="p-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span>🦆 Đua Vịt</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              {names.length} Vịt Đua
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBankModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-600/50 transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            Đổi Bộ Đề (Lớp 1-5)
          </button>

          <button
            onClick={handleOpenSettings}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            Soạn Tên & Câu Hỏi
          </button>

          <button
            onClick={resetRace}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:text-white text-slate-400 transition"
            title="Bắt đầu lại"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-7xl mx-auto w-full">
        
        {/* Left: 3D River Race */}
        <div className="lg:col-span-7 rounded-3xl glass-panel border border-slate-800 p-4 relative flex flex-col items-center justify-center shadow-2xl">
          
          {/* Winner Banner */}
          {winnerDuck && (
            <div className="absolute top-4 z-20 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-base shadow-2xl flex items-center gap-2 animate-bounce">
              <Trophy className="w-6 h-6" />
              🏆 Vịt của "{winnerDuck.name}" về đích đầu tiên!
            </div>
          )}

          <div ref={mountRef} className="w-full aspect-[4/3] max-h-[480px]" />

          {/* Action button */}
          <div className="mt-4 z-10 flex items-center gap-4">
            <button
              onClick={startRace}
              disabled={racing}
              className={`px-8 py-3.5 rounded-2xl font-black text-base flex items-center gap-2.5 shadow-xl transition-all ${
                racing
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25 hover:scale-105 active:scale-95'
              }`}
            >
              <Play className={`w-5 h-5 ${racing ? 'animate-spin' : ''}`} />
              {racing ? 'Đang bơi đua...' : '🌊 BƠI!'}
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-2 text-center">
            💡 Bấm <strong>"Bơi!"</strong> để cả đàn vịt cùng bơi về đích với tốc độ ngẫu nhiên. Chú vịt về nhất sẽ đại diện học sinh/tổ đó trả lời câu hỏi thử thách!
          </p>

          {/* Duck Lane Badges */}
          <div className="w-full flex items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-bold text-slate-400 overflow-x-auto">
            {names.map((name, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: `#${DUCK_PALETTE[i % DUCK_PALETTE.length].toString(16).padStart(6, '0')}` }}
                />
                <span className="truncate max-w-[75px]">{name}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Right: Question Area (Adhering 100% to Original StudyAI Step Flow!) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          <div className="p-4 rounded-2xl glass-card flex items-center justify-between border border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Trạng thái:</div>
              <div className="text-base font-bold text-amber-400">
                {racing ? '🌊 Đang diễn ra cuộc đua...' : winnerDuck ? `🏆 Về nhất: ${winnerDuck.name}` : 'Bấm Bơi để chọn người trả lời!'}
              </div>
            </div>
            <div className="text-xs text-teal-300 bg-teal-500/10 px-3 py-1.5 rounded-xl border border-teal-500/20 font-bold">
              Đề: {quizTitle}
            </div>
          </div>

          {/* Question Box */}
          <div className="flex-1 p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-center">
            
            {/* Step 1: Winner Announcement & Show Question Button (Exact StudyAI logic) */}
            {winnerDuck && !showQuestionBox && (
              <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="text-5xl animate-bounce">🙋</div>
                <h3 className="text-xl font-black text-white">
                  {winnerDuck.name} hãy trả lời câu hỏi thử thách!
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Chú vịt của {winnerDuck.name} đã bơi về đích đầu tiên. Bấm nút bên dưới để mở câu hỏi trắc nghiệm.
                </p>
                <button
                  onClick={handleShowQuestion}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl transition transform hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <Eye className="w-5 h-5" />
                  👀 Hiện Câu Hỏi
                </button>
              </div>
            )}

            {/* Step 2: The Question Box when revealed */}
            {winnerDuck && showQuestionBox && currentQuestion && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" /> CÂU HỎI THỬ THÁCH DÀNH CHO: {winnerDuck.name}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-relaxed">
                  {currentQuestion.question}
                </h3>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {currentQuestion.options.map((opt, idx) => {
                    let btnStyle = "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200";

                    if (answeredState !== null) {
                      if (idx === currentQuestion.correct) {
                        btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold";
                      } else if (idx === answeredState.selectedIndex) {
                        btnStyle = "bg-rose-600/30 border-rose-500 text-rose-200";
                      } else {
                        btnStyle = "opacity-40 bg-slate-800/40 border-slate-800 text-slate-500";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={answeredState !== null}
                        className={`w-full p-3.5 rounded-xl text-left text-sm border flex items-center justify-between transition-all ${btnStyle}`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                        </span>

                        {answeredState !== null && idx === currentQuestion.correct && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                        {answeredState !== null && idx === answeredState.selectedIndex && !answeredState.isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {answeredState !== null && (
                  <div className="pt-2 flex items-center justify-between">
                    <span className={`text-xs font-bold ${answeredState.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {answeredState.isCorrect 
                        ? `🎉 Chính xác! ${winnerDuck.name} ghi điểm cho lớp.` 
                        : `😢 Chưa đúng rồi, cùng xem đáp án đúng nhé.`}
                    </span>
                    <button
                      onClick={resetRace}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      🌊 Bơi Ván Mới
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State before any race */}
            {!winnerDuck && (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <div className="text-4xl animate-bounce">🦆</div>
                <div className="font-semibold text-slate-400">Chưa bắt đầu cuộc đua</div>
                <p className="text-xs max-w-xs mx-auto">
                  Hãy bấm nút <strong>"🌊 BƠI!"</strong> bên dòng sông. Chú vịt nào bơi về đích đầu tiên sẽ đại diện học sinh đó trả lời câu hỏi!
                </p>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl glass-panel p-6 border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              Soạn Tên Vịt Đua & Bộ Câu Hỏi
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">
                  Danh sách vịt đua (mỗi dòng 1 tên học sinh/tổ):
                </label>
                <textarea
                  value={customNamesText}
                  onChange={(e) => setCustomNamesText(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 mt-1 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Bộ câu hỏi trắc nghiệm (Cú pháp: Câu hỏi | Đáp án đúng | Sai 1 | Sai 2):
                </label>
                <textarea
                  value={customQuizText}
                  onChange={(e) => setCustomQuizText(e.target.value)}
                  rows={6}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition font-bold"
              >
                Lưu Lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Bank Modal */}
      <QuestionBankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onSelectQuestions={(selectedQs, title) => {
          setQuestions(selectedQs);
          setQuizTitle(title);
          resetRace();
        }}
      />

    </div>
  );
}
