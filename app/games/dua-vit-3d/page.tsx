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
  Users
} from 'lucide-react';
import Link from 'next/link';

interface DuckCompetitor {
  id: string;
  name: string;
  color: number;
  pos: number; // 0 (Start) to 100 (Finish)
  speed: number;
  finished: boolean;
  mesh?: THREE.Group;
}

const DEFAULT_COMPETITORS = ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4", "Lan", "Huy", "An", "Bình"];
const DUCK_PALETTE = [
  0xfacc15, // Vàng chanh
  0x38bdf8, // Xanh da trời
  0xf97316, // Cam tươi
  0xec4899, // Hồng sen
  0x10b981, // Xanh lá
  0xa855f7, // Tím
  0xef4444, // Đỏ
  0x14b8a6, // Ngọc bích
];

export default function DuaVit3DPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Game states
  const [competitors, setCompetitors] = useState<string[]>(DEFAULT_COMPETITORS);
  const [questions, setQuestions] = useState<Question[]>(QUESTION_BANKS[0].subjects[0].questions);
  const [quizTitle, setQuizTitle] = useState<string>("Toán Lớp 1 - Cơ Bản");
  
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [winner, setWinner] = useState<DuckCompetitor | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [answeredState, setAnsweredState] = useState<{ selectedIndex: number; isCorrect: boolean } | null>(null);

  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [namesText, setNamesText] = useState<string>(DEFAULT_COMPETITORS.join('\n'));

  // Race Refs for Three.js
  const ducksRef = useRef<DuckCompetitor[]>([]);
  const isRacingRef = useRef<boolean>(false);

  // Initialize competitors list
  useEffect(() => {
    ducksRef.current = competitors.map((name, i) => ({
      id: `duck_${i}`,
      name,
      color: DUCK_PALETTE[i % DUCK_PALETTE.length],
      pos: 0,
      speed: 0,
      finished: false,
    }));
  }, [competitors]);

  // Build Three.js 3D River Scene
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

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

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(8, 14, 10);
    sun.castShadow = true;
    scene.add(sun);

    // 1. Water Plane (River)
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

    // 2. River Banks
    const bankGeo = new THREE.BoxGeometry(4, 1.2, riverLength);
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
    const leftBank = new THREE.Mesh(bankGeo, bankMat);
    leftBank.position.set(-riverWidth / 2 - 2, 0.3, 0);
    scene.add(leftBank);

    const rightBank = new THREE.Mesh(bankGeo, bankMat);
    rightBank.position.set(riverWidth / 2 + 2, 0.3, 0);
    scene.add(rightBank);

    // 3. Start & Finish Lines
    // Start line at Z = 10
    const startLine = new THREE.Mesh(
      new THREE.PlaneGeometry(riverWidth, 0.4),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    startLine.rotation.x = -Math.PI / 2;
    startLine.position.set(0, 0.02, 10);
    scene.add(startLine);

    // Finish line at Z = -10
    const finishLine = new THREE.Mesh(
      new THREE.PlaneGeometry(riverWidth, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.set(0, 0.02, -10);
    scene.add(finishLine);

    // Finish Arch / Banner
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

    // 4. Create 3D Duck Racers according to competitors
    const duckCount = ducksRef.current.length;
    const laneSpacing = (riverWidth - 4) / Math.max(1, duckCount - 1);
    const startX = -(riverWidth - 4) / 2;

    ducksRef.current.forEach((duck, idx) => {
      const duckGroup = new THREE.Group();

      // Duck Body
      const bodyGeo = new THREE.SphereGeometry(0.55, 16, 16);
      const bodyMat = new THREE.MeshStandardMaterial({ color: duck.color, roughness: 0.3 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.5;
      duckGroup.add(body);

      // Duck Head
      const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0, 1.0, -0.35);
      duckGroup.add(head);

      // Duck Beak
      const beakGeo = new THREE.ConeGeometry(0.16, 0.4, 16);
      const beakMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.rotation.x = -Math.PI / 2;
      beak.position.set(0, 0.95, -0.75);
      duckGroup.add(beak);

      // Lane X position
      const posX = duckCount === 1 ? 0 : startX + idx * laneSpacing;
      // Start Z position: 10
      duckGroup.position.set(posX, 0, 10);

      scene.add(duckGroup);
      duck.mesh = duckGroup;
    });

    // Animation Loop
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

      // Race Simulation: All ducks swim simultaneously with dynamic random impulses
      if (isRacingRef.current) {
        let firstFinished: DuckCompetitor | null = null;

        ducksRef.current.forEach(duck => {
          if (duck.finished) return;

          // Realistic random bursts: base speed + random acceleration pulses
          const impulse = 0.35 + Math.random() * 0.85 + (Math.random() > 0.85 ? 0.6 : 0);
          duck.pos = Math.min(100, duck.pos + impulse);

          if (duck.pos >= 100) {
            duck.pos = 100;
            duck.finished = true;
            if (!firstFinished) {
              firstFinished = duck;
            }
          }
        });

        // Trigger finish if someone won
        if (firstFinished) {
          isRacingRef.current = false;
          setIsRacing(false);
          const winnerDuck = firstFinished;
          setWinner(winnerDuck);
          sound.playFanfare();

          // Select question for this winner
          if (questions.length > 0) {
            const randQ = questions[Math.floor(Math.random() * questions.length)];
            setActiveQuestion(Storage.shuffleOptions(randQ));
            setAnsweredState(null);
          }
        }
      }

      // Update Duck 3D Positions & Bobbing
      ducksRef.current.forEach((duck, idx) => {
        if (duck.mesh) {
          // Z map: pos 0 -> Z=10, pos 100 -> Z=-10
          const currentZ = 10 - (duck.pos / 100) * 20;
          duck.mesh.position.z = currentZ;

          // Bobbing in water
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
  }, [competitors, questions]);

  // Start the duck race (All ducks swim together!)
  const startDuckRace = () => {
    if (isRacing) return;
    setIsRacing(true);
    isRacingRef.current = true;
    setWinner(null);
    setActiveQuestion(null);
    setAnsweredState(null);

    // Reset all ducks to start
    ducksRef.current.forEach(duck => {
      duck.pos = 0;
      duck.finished = false;
    });

    sound.playTick();
  };

  // Reset race
  const resetRace = () => {
    isRacingRef.current = false;
    setIsRacing(false);
    setWinner(null);
    setActiveQuestion(null);
    setAnsweredState(null);
    ducksRef.current.forEach(duck => {
      duck.pos = 0;
      duck.finished = false;
    });
    sound.playTick();
  };

  // Handle answering
  const handleAnswer = (optionIndex: number) => {
    if (!activeQuestion || answeredState !== null) return;

    const isCorrect = optionIndex === activeQuestion.correct;
    setAnsweredState({ selectedIndex: optionIndex, isCorrect });

    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  };

  // Save customized competitors list
  const handleSaveCompetitors = () => {
    const list = namesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (list.length < 2) {
      alert("Cần ít nhất 2 tên học sinh hoặc tổ để đua!");
      return;
    }

    setCompetitors(list.slice(0, 8)); // Tối đa 8 vịt cho đường đua đẹp
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
            <span>🦆 Đua Vịt Tri Thức 3D</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
              Đua Cả Đàn Chọn Ngẫu Nhiên
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            Danh Sách Vịt ({competitors.length})
          </button>

          <button
            onClick={() => setIsBankModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-600/50 transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            Đổi Bộ Đề (Lớp 1-5)
          </button>

          <button
            onClick={resetRace}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:text-white text-slate-400 transition"
            title="Làm mới cuộc đua"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-7xl mx-auto w-full">
        
        {/* Left Column: 3D River Race */}
        <div className="lg:col-span-7 rounded-3xl glass-panel border border-slate-800 p-4 relative flex flex-col items-center justify-center shadow-2xl">
          
          {/* Winner Banner */}
          {winner && (
            <div className="absolute top-4 z-20 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-base sm:text-lg shadow-2xl flex items-center gap-2.5 animate-bounce">
              <Trophy className="w-6 h-6" />
              VỊT CỦA "{winner.name.toUpperCase()}" VỀ ĐÍCH ĐẦU TIÊN!
            </div>
          )}

          {/* Three.js 3D Canvas */}
          <div ref={mountRef} className="w-full aspect-[4/3] max-h-[480px]" />

          {/* Race Controls */}
          <div className="mt-4 z-10 flex items-center gap-4">
            <button
              onClick={startDuckRace}
              disabled={isRacing}
              className={`px-8 py-3.5 rounded-2xl font-black text-base flex items-center gap-2.5 shadow-xl transition-all ${
                isRacing
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25 hover:scale-105 active:scale-95'
              }`}
            >
              <Play className={`w-5 h-5 ${isRacing ? 'animate-spin' : ''}`} />
              {isRacing ? 'Đang bơi đua...' : '🌊 BƠI NGAY!'}
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-2 text-center">
            Bấm <strong>"BƠI NGAY"</strong>: Cả đàn vịt sẽ bơi đua với tốc độ ngẫu nhiên. Chú vịt về nhất sẽ đại diện trả lời câu hỏi!
          </p>

          {/* Duck Lane Labels */}
          <div className="w-full flex items-center justify-between gap-1 mt-3 pt-3 border-t border-slate-800 text-[11px] font-bold text-slate-400 overflow-x-auto">
            {competitors.map((name, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800">
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: `#${DUCK_PALETTE[i % DUCK_PALETTE.length].toString(16).padStart(6, '0')}` }}
                />
                <span className="truncate max-w-[65px]">{name}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Winner Question Box */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          <div className="p-4 rounded-2xl glass-card flex items-center justify-between border border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Trạng thái:</div>
              <div className="text-base font-bold text-amber-400">
                {isRacing ? '🌊 Đang diễn ra cuộc đua...' : winner ? `🏆 Đã tìm ra người về nhất: ${winner.name}` : 'Sẵn sàng bấm Bơi!'}
              </div>
            </div>
            <div className="text-xs text-teal-300 bg-teal-500/10 px-3 py-1.5 rounded-xl border border-teal-500/20 font-bold">
              Đề: {quizTitle}
            </div>
          </div>

          {/* Question Box */}
          <div className="flex-1 p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-center">
            {winner && activeQuestion ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" /> CÂU HỎI THỬ THÁCH DÀNH CHO: {winner.name}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-relaxed">
                  {activeQuestion.question}
                </h3>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {activeQuestion.options.map((opt, idx) => {
                    let btnStyle = "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200";

                    if (answeredState !== null) {
                      if (idx === activeQuestion.correct) {
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

                        {answeredState !== null && idx === activeQuestion.correct && (
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
                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    answeredState.isCorrect 
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}>
                    <span className="font-bold">
                      {answeredState.isCorrect 
                        ? `🎉 Xuất sắc! ${winner.name} đã trả lời đúng!` 
                        : `😢 Tiếc quá! Hãy cùng xem lại câu hỏi nhé.`}
                    </span>
                    <button
                      onClick={startDuckRace}
                      className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 font-bold transition text-xs"
                    >
                      Bơi Ván Mới 🌊
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <div className="text-4xl animate-bounce">🦆</div>
                <div className="font-semibold text-slate-400">Chưa có người về nhất</div>
                <p className="text-xs max-w-xs mx-auto">
                  Hãy bấm nút <strong>"🌊 BƠI NGAY!"</strong> bên dòng sông. Chú vịt nào bơi về đích đầu tiên sẽ mở ra câu hỏi bài học!
                </p>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Settings Modal (Tùy chỉnh danh sách vịt đua) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl glass-panel p-6 border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Soạn Danh Sách Vịt Đua (Học sinh / Tổ)
            </h3>
            <p className="text-xs text-slate-400">
              Nhập tên học sinh hoặc tên tổ (mỗi dòng 1 tên, tối thiểu 2 và tối đa 8 vịt):
            </p>
            <textarea
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
              rows={8}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCompetitors}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition font-bold"
              >
                Lưu Danh Sách
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
          setActiveQuestion(null);
          setAnsweredState(null);
        }}
      />

    </div>
  );
}
