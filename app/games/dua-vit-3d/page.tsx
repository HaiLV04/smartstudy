'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '@/lib/audio';
import { Storage } from '@/lib/storage';
import { Question, QUESTION_BANKS } from '@/data/questionBanks';
import QuestionBankModal from '@/components/QuestionBankModal';
import GameSettingsModal from '@/components/GameSettingsModal';
import { 
  GameSettingsManager, 
  Participant 
} from '@/lib/gameSettings';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RefreshCw,
  Play,
  Settings,
  Timer,
  Users
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

export default function DuaVit3DPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Game states from settings
  const [activeDucks, setActiveDucks] = useState<Participant[]>([]);
  const [raceDuration, setRaceDuration] = useState<number>(8); // default 8s
  const [questions, setQuestions] = useState<Question[]>(QUESTION_BANKS[0].subjects[0].questions);
  const [quizTitle, setQuizTitle] = useState<string>("Toán Lớp 1 - Cơ Bản");
  
  // Race runtime states
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(8);
  const [winner, setWinner] = useState<DuckCompetitor | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [answeredState, setAnsweredState] = useState<{ selectedIndex: number; isCorrect: boolean } | null>(null);

  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Race Refs for Three.js
  const ducksRef = useRef<DuckCompetitor[]>([]);
  const isRacingRef = useRef<boolean>(false);
  const raceDurationRef = useRef<number>(8);
  const raceStartTimeRef = useRef<number>(0);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load global settings
  const loadSettings = () => {
    const s = GameSettingsManager.getSettings();
    const active = s.participants.filter(p => p.enabled);
    const chosen = active.length >= 2 ? active : s.participants.slice(0, 4);
    setActiveDucks(chosen);
    setRaceDuration(s.raceDurationSec);
    raceDurationRef.current = s.raceDurationSec;
    setTimeLeft(s.raceDurationSec);

    // Map to 3D competitor format
    ducksRef.current = chosen.map((p, i) => ({
      id: p.id,
      name: p.name,
      color: parseInt((p.color || '#facc15').replace('#', '0x'), 16),
      pos: 0,
      finished: false,
    }));
  };

  useEffect(() => {
    loadSettings();

    const handleSettingsUpdated = () => {
      loadSettings();
    };

    window.addEventListener('smartstudy_settings_updated', handleSettingsUpdated);
    return () => window.removeEventListener('smartstudy_settings_updated', handleSettingsUpdated);
  }, []);

  // Build Three.js 3D River Scene
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount || activeDucks.length === 0) return;

    // Clean previous children if any
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

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(8, 14, 10);
    sun.castShadow = true;
    scene.add(sun);

    // 1. Water River
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

    // 3. Lines
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

    // 4. Duck Meshes
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

      // Race Physics: calibrated to finish precisely within raceDurationSec!
      if (isRacingRef.current) {
        let firstFinished: DuckCompetitor | null = null;
        const targetDuration = raceDurationRef.current || 8;
        // 60 fps * targetDuration = total frames
        // Base rate per frame to reach 100 in targetDuration seconds
        const baseRate = 100 / (60 * targetDuration);

        ducksRef.current.forEach(duck => {
          if (duck.finished) return;

          // Randomized burst fluctuations around baseRate
          const variance = 0.6 + Math.random() * 0.8;
          duck.pos = Math.min(100, duck.pos + baseRate * variance);

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
          setIsRacing(false);
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setTimeLeft(0);
          
          const winnerDuck = firstFinished;
          setWinner(winnerDuck);
          sound.playFanfare();

          if (questions.length > 0) {
            const randQ = questions[Math.floor(Math.random() * questions.length)];
            setActiveQuestion(Storage.shuffleOptions(randQ));
            setAnsweredState(null);
          }
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
  }, [activeDucks, questions]);

  // Start Duck Race with Live Countdown Timer
  const startDuckRace = () => {
    if (isRacing) return;
    setIsRacing(true);
    isRacingRef.current = true;
    setWinner(null);
    setActiveQuestion(null);
    setAnsweredState(null);

    // Reset ducks
    ducksRef.current.forEach(duck => {
      duck.pos = 0;
      duck.finished = false;
    });

    // Start Countdown
    setTimeLeft(raceDuration);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    sound.playTick();
  };

  const resetRace = () => {
    isRacingRef.current = false;
    setIsRacing(false);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setTimeLeft(raceDuration);
    setWinner(null);
    setActiveQuestion(null);
    setAnsweredState(null);
    ducksRef.current.forEach(duck => {
      duck.pos = 0;
      duck.finished = false;
    });
    sound.playTick();
  };

  const handleAnswer = (optionIndex: number) => {
    if (!activeQuestion || answeredState !== null) return;
    const isCorrect = optionIndex === activeQuestion.correct;
    setAnsweredState({ selectedIndex: optionIndex, isCorrect });
    if (isCorrect) sound.playCorrect();
    else sound.playWrong();
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
              ⏱️ {raceDuration}s Đua Cả Đàn
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Cài Đặt Chung */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition flex items-center gap-1.5 shadow-md shadow-amber-500/10"
          >
            <Settings className="w-4 h-4" />
            Cài Đặt Vịt & Thời Gian ({activeDucks.length} vịt)
          </button>

          {/* Đổi Bộ Đề */}
          <button
            onClick={() => setIsBankModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-600/50 transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            Bộ Đề (Lớp 1-5)
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

          {/* Live Countdown Badge during race */}
          {isRacing && (
            <div className="absolute top-4 left-6 z-20 px-4 py-2 rounded-xl bg-rose-500/90 text-white font-black text-sm flex items-center gap-2 animate-pulse shadow-lg">
              <Timer className="w-4 h-4" />
              Thời gian đua: 0{timeLeft}s
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
              {isRacing ? `Đang bơi đua (0${timeLeft}s)...` : `🌊 BƠI NGAY (${raceDuration}s)!`}
            </button>
          </div>

          <div className="flex items-center justify-between w-full text-xs text-slate-400 mt-2 px-4">
            <span>Đang tham gia: <strong>{activeDucks.length} vịt</strong></span>
            <span>Thời gian đua: <strong>{raceDuration} giây</strong></span>
          </div>

          {/* Duck Lane Badges */}
          <div className="w-full flex items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-bold text-slate-400 overflow-x-auto">
            {activeDucks.map((duck) => (
              <div key={duck.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: duck.color || '#facc15' }}
                />
                <span className="truncate max-w-[75px]">{duck.name}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Question Area */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          <div className="p-4 rounded-2xl glass-card flex items-center justify-between border border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Trạng thái:</div>
              <div className="text-base font-bold text-amber-400">
                {isRacing ? `🌊 Đang bơi đua (còn ${timeLeft}s)...` : winner ? `🏆 Về nhất: ${winner.name}` : 'Bấm Bơi để chọn người trả lời!'}
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
                        ? `🎉 Xuất sắc! ${winner.name} đã ghi điểm!` 
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

      {/* Cài Đặt Chung Modal */}
      <GameSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaved={() => loadSettings()}
      />

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
