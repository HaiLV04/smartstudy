'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '@/lib/audio';
import { Storage } from '@/lib/storage';
import { Question, QUESTION_BANKS } from '@/data/questionBanks';
import QuestionBankModal from '@/components/QuestionBankModal';
import GameSettingsModal from '@/components/GameSettingsModal';
import { GameSettingsManager } from '@/lib/gameSettings';
import { 
  RotateCw, 
  Sparkles, 
  BookOpen, 
  Award, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  Settings,
  Users
} from 'lucide-react';
import Link from 'next/link';

const SLICE_COLORS = [
  0x0ea5a4, 0x3b82f6, 0xf59e0b, 0xec4899, 
  0x8b5cf6, 0x10b981, 0xef4444, 0x06b6d4, 
  0xf97316, 0x84cc16, 0x6366f1, 0xf43f5e
];

export default function VongQuay3DPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const wheelMeshRef = useRef<THREE.Group | null>(null);

  // Game States
  const [names, setNames] = useState<string[]>([]);
  const [spinDuration, setSpinDuration] = useState<number>(5);
  const [questions, setQuestions] = useState<Question[]>(QUESTION_BANKS[0].subjects[0].questions);
  const [quizTitle, setQuizTitle] = useState<string>("Toán Lớp 1 - Cơ Bản");
  
  const [spinning, setSpinning] = useState<boolean>(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [answeredState, setAnsweredState] = useState<{ selectedIndex: number; isCorrect: boolean } | null>(null);

  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Refs for animation
  const spinSpeedRef = useRef<number>(0);
  const currentRotationRef = useRef<number>(0);
  const isSpinningRef = useRef<boolean>(false);
  const lastTickSliceRef = useRef<number>(-1);
  const frictionRef = useRef<number>(0.988);

  const loadSettings = () => {
    const s = GameSettingsManager.getSettings();
    const active = s.participants.filter(p => p.enabled);
    const chosenNames = active.length >= 2 ? active.map(p => p.name) : s.participants.slice(0, 4).map(p => p.name);
    setNames(chosenNames);
    setSpinDuration(s.spinDurationSec);
    // friction: 3s -> 0.978, 5s -> 0.988, 8s -> 0.993
    frictionRef.current = s.spinDurationSec <= 3 ? 0.978 : s.spinDurationSec >= 8 ? 0.993 : 0.988;
  };

  useEffect(() => {
    loadSettings();
    const handleSettingsUpdated = () => loadSettings();
    window.addEventListener('smartstudy_settings_updated', handleSettingsUpdated);
    return () => window.removeEventListener('smartstudy_settings_updated', handleSettingsUpdated);
  }, []);

  // Build Three.js 3D Wheel Scene
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount || names.length === 0) return;

    while (currentMount.firstChild) {
      currentMount.removeChild(currentMount.firstChild);
    }

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 8, 8);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 3, 20);
    blueLight.position.set(-6, -4, 4);
    scene.add(blueLight);

    // Wheel Main Group
    const wheelGroup = new THREE.Group();
    wheelMeshRef.current = wheelGroup;
    scene.add(wheelGroup);

    // Build 3D Slices with Canvas Texture
    const radius = 3.2;
    const depth = 0.5;
    const sliceCount = names.length;
    const sliceAngle = (Math.PI * 2) / sliceCount;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    const centerX = 512;
    const centerY = 512;
    const canvasRadius = 490;

    for (let i = 0; i < sliceCount; i++) {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = (i + 1) * sliceAngle - Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, canvasRadius, startAngle, endAngle);
      ctx.closePath();

      const hexColor = SLICE_COLORS[i % SLICE_COLORS.length].toString(16).padStart(6, '0');
      ctx.fillStyle = `#${hexColor}`;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      ctx.fillText(names[i], canvasRadius - 30, 12);
      ctx.restore();
    }

    const wheelTexture = new THREE.CanvasTexture(canvas);
    wheelTexture.colorSpace = THREE.SRGBColorSpace;

    const wheelGeo = new THREE.CylinderGeometry(radius, radius, depth, 64);
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ map: wheelTexture, roughness: 0.3, metalness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    ];
    const wheelCylinder = new THREE.Mesh(wheelGeo, materials);
    wheelCylinder.rotation.x = Math.PI / 2;
    wheelGroup.add(wheelCylinder);

    const rimGeo = new THREE.TorusGeometry(radius + 0.05, 0.12, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    wheelGroup.add(rimMesh);

    const hubGeo = new THREE.CylinderGeometry(0.65, 0.7, 0.6, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
    const hubMesh = new THREE.Mesh(hubGeo, hubMat);
    hubMesh.rotation.x = Math.PI / 2;
    hubMesh.position.z = 0.05;
    wheelGroup.add(hubMesh);

    const needleGroup = new THREE.Group();
    needleGroup.position.set(0, radius + 0.35, 0.4);

    const needleGeo = new THREE.ConeGeometry(0.35, 0.85, 4);
    const needleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.2 });
    const needleMesh = new THREE.Mesh(needleGeo, needleMat);
    needleMesh.rotation.z = Math.PI;
    needleGroup.add(needleMesh);
    scene.add(needleGroup);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isSpinningRef.current && wheelMeshRef.current) {
        currentRotationRef.current += spinSpeedRef.current;
        wheelMeshRef.current.rotation.z = currentRotationRef.current;

        // Friction based on configured duration
        spinSpeedRef.current *= frictionRef.current;

        const normAngle = ((currentRotationRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const currentSlice = Math.floor((normAngle / (Math.PI * 2)) * sliceCount);
        if (currentSlice !== lastTickSliceRef.current) {
          lastTickSliceRef.current = currentSlice;
          sound.playTick();
        }

        needleGroup.rotation.z = Math.sin(Date.now() * 0.05) * (spinSpeedRef.current * 0.5);

        if (spinSpeedRef.current < 0.002) {
          isSpinningRef.current = false;
          setSpinning(false);
          spinSpeedRef.current = 0;

          const finalAngle = ((currentRotationRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const topAngle = (Math.PI / 2 - finalAngle + Math.PI * 2) % (Math.PI * 2);
          const winnerIndex = Math.floor((topAngle / (Math.PI * 2)) * sliceCount) % sliceCount;

          const winnerName = names[winnerIndex] || names[0];
          setSelectedWinner(winnerName);
          sound.playFanfare();

          if (questions.length > 0) {
            const randomQ = questions[Math.floor(Math.random() * questions.length)];
            setActiveQuestion(Storage.shuffleOptions(randomQ));
            setAnsweredState(null);
          }
        }
      }

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
  }, [names, questions]);

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    isSpinningRef.current = true;
    setSelectedWinner(null);
    setActiveQuestion(null);
    setAnsweredState(null);

    spinSpeedRef.current = 0.38 + Math.random() * 0.22;
    sound.playTick();
  };

  const handleAnswer = (optionIndex: number) => {
    if (!activeQuestion || answeredState !== null) return;
    const isCorrect = optionIndex === activeQuestion.correct;
    setAnsweredState({ selectedIndex: optionIndex, isCorrect });

    if (isCorrect) {
      sound.playCorrect();
      setCurrentScore(prev => prev + 10);
    } else {
      sound.playWrong();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative overflow-hidden">
      
      {/* Top Navbar */}
      <header className="p-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span className="text-teal-400">🎡 Vòng Quay May Mắn 3D</span>
            <span className="text-xs bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/30">
              Quay {spinDuration}s
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            Cài Đặt Người Chơi ({names.length})
          </button>

          <button
            onClick={() => setIsBankModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-600/50 transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            Đổi Bộ Đề (Lớp 1-5)
          </button>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-7xl mx-auto w-full">
        
        {/* Left Column: 3D Wheel Stage */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative rounded-3xl glass-panel p-4 overflow-hidden border border-slate-800 shadow-2xl">
          
          {selectedWinner && (
            <div className="absolute top-6 z-10 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold text-lg shadow-xl animate-bounce flex items-center gap-2">
              <Award className="w-5 h-5" />
              Đến lượt: {selectedWinner}!
            </div>
          )}

          <div 
            ref={mountRef} 
            className="w-full aspect-square max-w-[520px] max-h-[520px] cursor-grab active:cursor-grabbing"
          />

          <div className="mt-4 z-10 flex items-center gap-4">
            <button
              onClick={spinWheel}
              disabled={spinning}
              className={`px-8 py-3.5 rounded-2xl font-extrabold text-base flex items-center gap-2.5 transition-all shadow-xl ${
                spinning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-teal-500/25 hover:scale-105 active:scale-95'
              }`}
            >
              <RotateCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
              {spinning ? 'Đang quay...' : 'QUAY NGAY 🎲'}
            </button>
          </div>

          <div className="text-xs text-slate-500 mt-2">
            Đang gồm {names.length} ô quay: {names.join(', ')}
          </div>
        </div>

        {/* Right Column: Question Card & Scoreboard */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          <div className="p-4 rounded-2xl glass-card flex items-center justify-between border border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Điểm số lớp học</div>
              <div className="text-2xl font-black text-teal-400">{currentScore} Điểm</div>
            </div>
            <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Sparkles className="w-4 h-4 text-amber-400" />
              +10 điểm / câu đúng
            </div>
          </div>

          <div className="flex-1 p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-center">
            {activeQuestion ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                    ❓ Câu Hỏi Dành Cho {selectedWinner || 'Học Sinh'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {quizTitle}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-relaxed">
                  {activeQuestion.question}
                </h3>

                <div className="grid grid-cols-1 gap-2.5 pt-2">
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
                    <span>
                      {answeredState.isCorrect ? '🎉 Hoan hô! Câu trả lời chính xác!' : '❌ Chưa chính xác, hãy cố gắng ở lượt sau!'}
                    </span>
                    <button
                      onClick={spinWheel}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 font-bold transition text-xs"
                    >
                      Lượt tiếp theo →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <div className="text-4xl">🎡</div>
                <div className="font-semibold text-slate-400">Chưa có câu hỏi nào</div>
                <p className="text-xs max-w-xs mx-auto">
                  Hãy bấm nút <strong>QUAY NGAY</strong> bên trái để vòng quay chọn học sinh và mở câu hỏi bài học!
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
