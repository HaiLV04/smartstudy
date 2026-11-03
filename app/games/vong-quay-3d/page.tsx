'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '@/lib/audio';
import { Storage } from '@/lib/storage';
import { Question, QUESTION_BANKS } from '@/data/questionBanks';
import QuestionBankModal from '@/components/QuestionBankModal';
import { 
  RotateCw, 
  BookOpen, 
  Award, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  Settings,
  RefreshCw,
  Trophy
} from 'lucide-react';
import Link from 'next/link';

const DEFAULT_NAMES = ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4", "An", "Bình", "Chi", "Duy"];
const SLICE_COLORS = [
  0x0ea5a4, 0x2563eb, 0xf97316, 0xdb2777, 
  0x7c3aed, 0xeab308, 0x059669, 0x0284c7, 
  0xef4444, 0x14b8a6
];

export default function VongQuay3DPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const wheelMeshRef = useRef<THREE.Group | null>(null);

  // States
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES);
  const [questions, setQuestions] = useState<Question[]>(QUESTION_BANKS[0].subjects[0].questions);
  const [quizQueue, setQuizQueue] = useState<Question[]>([]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [classScore, setClassScore] = useState<number>(0);
  const [quizTitle, setQuizTitle] = useState<string>("Toán Lớp 1 - Cơ Bản");

  // Interaction States
  const [spinning, setSpinning] = useState<boolean>(false);
  const [pickedWinner, setPickedWinner] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answeredState, setAnsweredState] = useState<{ selectedIndex: number; isCorrect: boolean } | null>(null);

  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [customNamesText, setCustomNamesText] = useState<string>(DEFAULT_NAMES.join('\n'));
  const [customQuizText, setCustomQuizText] = useState<string>('');

  // Refs for 3D spin physics
  const spinSpeedRef = useRef<number>(0);
  const currentRotationRef = useRef<number>(0);
  const isSpinningRef = useRef<boolean>(false);
  const lastTickSliceRef = useRef<number>(-1);

  // Initialize Quiz Queue
  useEffect(() => {
    setQuizQueue(Storage.shuffle(questions));
    setQuizIndex(0);
  }, [questions]);

  // Build Three.js 3D Wheel
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
    currentMount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 8, 8);
    scene.add(dirLight);

    const wheelGroup = new THREE.Group();
    wheelMeshRef.current = wheelGroup;
    scene.add(wheelGroup);

    const radius = 3.2;
    const depth = 0.5;
    const sliceCount = names.length;
    const sliceAngle = (Math.PI * 2) / sliceCount;

    // Draw Texture with Labels
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

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      const label = names[i].length > 12 ? names[i].slice(0, 11) + '…' : names[i];
      ctx.fillText(label, canvasRadius - 30, 12);
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

    // Rim
    const rimGeo = new THREE.TorusGeometry(radius + 0.05, 0.12, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    wheelGroup.add(rimMesh);

    // Center Hub
    const hubGeo = new THREE.CylinderGeometry(0.65, 0.7, 0.6, 32);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
    const hubMesh = new THREE.Mesh(hubGeo, hubMat);
    hubMesh.rotation.x = Math.PI / 2;
    hubMesh.position.z = 0.05;
    wheelGroup.add(hubMesh);

    // Pointer Needle
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

        // Friction deceleration
        spinSpeedRef.current *= 0.988;

        const normAngle = ((currentRotationRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const currentSlice = Math.floor((normAngle / (Math.PI * 2)) * sliceCount);
        if (currentSlice !== lastTickSliceRef.current) {
          lastTickSliceRef.current = currentSlice;
          sound.playTick();
        }

        needleGroup.rotation.z = Math.sin(Date.now() * 0.05) * (spinSpeedRef.current * 0.5);

        // Stopped
        if (spinSpeedRef.current < 0.002) {
          isSpinningRef.current = false;
          setSpinning(false);
          spinSpeedRef.current = 0;

          // Determine Winner
          const finalAngle = ((currentRotationRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const topAngle = (Math.PI / 2 - finalAngle + Math.PI * 2) % (Math.PI * 2);
          const winnerIndex = Math.floor((topAngle / (Math.PI * 2)) * sliceCount) % sliceCount;

          const winnerName = names[winnerIndex] || names[0];
          setPickedWinner(winnerName);
          sound.playFanfare();

          // Immediately present next question
          triggerNextQuestion();
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
  }, [names]);

  // Trigger Next Question according to Original queue
  const triggerNextQuestion = () => {
    let currentQueue = quizQueue;
    let nextIdx = quizIndex;

    if (nextIdx >= currentQueue.length || currentQueue.length === 0) {
      currentQueue = Storage.shuffle(questions);
      setQuizQueue(currentQueue);
      nextIdx = 0;
    }

    const raw = currentQueue[nextIdx];
    const preparedQ = Storage.shuffleOptions(raw);
    setCurrentQuestion(preparedQ);
    setQuizIndex(nextIdx + 1);
    setAnsweredState(null);
  };

  // Spin
  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    isSpinningRef.current = true;
    setPickedWinner(null);
    setCurrentQuestion(null);
    setAnsweredState(null);

    // Initial angular velocity impulse
    spinSpeedRef.current = 0.38 + Math.random() * 0.22;
    sound.playTick();
  };

  // Answer
  const handleAnswer = (optionIndex: number) => {
    if (!currentQuestion || answeredState !== null) return;
    const isCorrect = optionIndex === currentQuestion.correct;
    setAnsweredState({ selectedIndex: optionIndex, isCorrect });

    if (isCorrect) {
      sound.playCorrect();
      setClassScore(prev => prev + 1);
    } else {
      sound.playWrong();
    }
  };

  // Reset for next spin
  const handleNextTurn = () => {
    setCurrentQuestion(null);
    setPickedWinner(null);
    setAnsweredState(null);
  };

  // Restart Game
  const restartGame = () => {
    setClassScore(0);
    setQuizIndex(0);
    setQuizQueue(Storage.shuffle(questions));
    setCurrentQuestion(null);
    setPickedWinner(null);
    setAnsweredState(null);
    sound.playTick();
  };

  // Open settings
  const handleOpenSettings = () => {
    setCustomNamesText(names.join('\n'));
    setCustomQuizText(Storage.toStudyAiText(questions));
    setIsSettingsOpen(true);
  };

  // Save settings
  const handleSaveSettings = () => {
    const parsedNames = customNamesText.split('\n').map(s => s.trim()).filter(Boolean);
    const parsedQuestions = Storage.parseStudyAiText(customQuizText);

    if (parsedNames.length < 2) {
      alert("Cần ít nhất 2 tên trong danh sách quay!");
      return;
    }
    if (parsedQuestions.length < 1) {
      alert("Cần ít nhất 1 câu hỏi hợp lệ!");
      return;
    }

    setNames(parsedNames);
    setQuestions(parsedQuestions);
    setQuizTitle("Đề Soạn Tùy Chỉnh");
    setIsSettingsOpen(false);
    restartGame();
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
            <span>🎡 Vòng Quay May Mắn</span>
            <span className="text-xs bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-500/30">
              {names.length} Người Chơi
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
            onClick={restartGame}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:text-white text-slate-400 transition"
            title="Chơi lại từ đầu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-7xl mx-auto w-full">
        
        {/* Left: 3D Wheel */}
        <div className="lg:col-span-7 rounded-3xl glass-panel border border-slate-800 p-4 relative flex flex-col items-center justify-center shadow-2xl">
          
          {pickedWinner && (
            <div className="absolute top-4 z-20 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 text-white font-extrabold text-base shadow-2xl flex items-center gap-2 animate-bounce">
              <Award className="w-5 h-5 text-yellow-300" />
              🎉 Xin mời "{pickedWinner}" trả lời câu hỏi!
            </div>
          )}

          <div ref={mountRef} className="w-full aspect-square max-w-[500px] max-h-[500px]" />

          <div className="mt-4 z-10 flex items-center gap-4">
            <button
              onClick={spinWheel}
              disabled={spinning}
              className={`px-8 py-3.5 rounded-2xl font-black text-base flex items-center gap-2.5 shadow-xl transition-all ${
                spinning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-teal-500/25 hover:scale-105 active:scale-95'
              }`}
            >
              <RotateCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
              {spinning ? 'Đang quay...' : 'QUAY! 🎲'}
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-2 text-center">
            Bấm <strong>QUAY</strong> để chọn ngẫu nhiên học sinh, sau đó câu hỏi sẽ hiện ra bên cạnh.
          </p>
        </div>

        {/* Right: Question Area */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Stats Bar */}
          <div className="p-4 rounded-2xl glass-card flex items-center justify-between border border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Điểm số lớp học</div>
              <div className="text-2xl font-black text-teal-400 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span>{classScore} điểm</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Tiến độ câu hỏi</div>
              <div className="text-sm font-bold text-indigo-300">
                {quizIndex}/{questions.length} câu
              </div>
            </div>
          </div>

          {/* Question Box */}
          <div className="flex-1 p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-center">
            {currentQuestion ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="font-bold text-teal-400 uppercase tracking-wider">
                    ❓ Câu hỏi {quizIndex}/{questions.length} dành cho {pickedWinner}
                  </span>
                  <span className="text-slate-400">{quizTitle}</span>
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
                      {answeredState.isCorrect ? '🎉 Chính xác! Cộng 1 điểm cho lớp.' : '😢 Chưa đúng rồi, cùng xem đáp án đúng nhé.'}
                    </span>
                    <button
                      onClick={handleNextTurn}
                      className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
                    >
                      🎡 Quay Tiếp →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <div className="text-4xl animate-spin-slow">🎡</div>
                <div className="font-semibold text-slate-400">Chưa chọn học sinh</div>
                <p className="text-xs max-w-xs mx-auto">
                  Hãy quay vòng quay để chọn học sinh, sau đó câu hỏi thử thách sẽ hiện ra ở đây.
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
              <Settings className="w-5 h-5 text-teal-400" />
              Soạn Tên Học Sinh & Bộ Câu Hỏi
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">
                  Danh sách học sinh trên vòng quay (mỗi dòng 1 tên):
                </label>
                <textarea
                  value={customNamesText}
                  onChange={(e) => setCustomNamesText(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500 mt-1 font-mono"
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
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500 mt-1 font-mono"
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
                className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition font-bold"
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
          restartGame();
        }}
      />

    </div>
  );
}
