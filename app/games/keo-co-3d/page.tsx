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
  RefreshCw, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Settings 
} from 'lucide-react';
import Link from 'next/link';

export default function KeoCo3DPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const ropeGroupRef = useRef<THREE.Group | null>(null);

  // Position: 0 = Team A wins, 50 = Center, 100 = Team B wins
  const [position, setPosition] = useState<number>(50);
  const positionRef = useRef<number>(50);

  // Team names
  const [teamA, setTeamA] = useState<string>("Đội A (Xanh)");
  const [teamB, setTeamB] = useState<string>("Đội B (Cam)");

  // Turn: "A" or "B"
  const [turn, setTurn] = useState<'A' | 'B'>('A');
  const [questions, setQuestions] = useState<Question[]>(QUESTION_BANKS[0].subjects[0].questions);
  const [quizQueue, setQuizQueue] = useState<Question[]>([]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [winnerTeam, setWinnerTeam] = useState<string | null>(null);
  const [answeredState, setAnsweredState] = useState<{ selectedIndex: number; isCorrect: boolean } | null>(null);

  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [customTeamA, setCustomTeamA] = useState<string>("Đội A (Xanh)");
  const [customTeamB, setCustomTeamB] = useState<string>("Đội B (Cam)");
  const [customQuizText, setCustomQuizText] = useState<string>('');

  // Setup Queue and First Question
  const startNewMatch = (customQs?: Question[]) => {
    const pool = customQs || questions;
    const shuffled = Storage.shuffle(pool);
    setQuizQueue(shuffled);
    setQuizIndex(0);
    setPosition(50);
    positionRef.current = 50;
    setTurn('A');
    setWinnerTeam(null);
    setAnsweredState(null);

    const firstQ = Storage.shuffleOptions(shuffled[0] || pool[0]);
    setCurrentQuestion(firstQ);
    setQuizIndex(1);
    sound.playTick();
  };

  useEffect(() => {
    startNewMatch();
  }, [questions]);

  // Three.js 3D Tug of War Arena
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    while (currentMount.firstChild) {
      currentMount.removeChild(currentMount.firstChild);
    }

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);

    // Stadium ground
    const groundGeo = new THREE.PlaneGeometry(16, 8);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Center divider
    const lineGeo = new THREE.PlaneGeometry(0.15, 8);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.01;
    scene.add(line);

    // Win Boundary marks at -4 (Team A win) and +4 (Team B win)
    const markA = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 8), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
    markA.rotation.x = -Math.PI / 2;
    markA.position.set(-3.6, 0.01, 0);
    scene.add(markA);

    const markB = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 8), new THREE.MeshBasicMaterial({ color: 0xf97316 }));
    markB.rotation.x = -Math.PI / 2;
    markB.position.set(3.6, 0.01, 0);
    scene.add(markB);

    // 3D Rope Group
    const ropeGroup = new THREE.Group();
    ropeGroupRef.current = ropeGroup;

    const ropeGeo = new THREE.CylinderGeometry(0.12, 0.12, 14, 16);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.rotation.z = Math.PI / 2;
    rope.position.y = 1;
    ropeGroup.add(rope);

    // Center Red Knot Ribbon
    const ribbonGeo = new THREE.SphereGeometry(0.26, 16, 16);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.2 });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.y = 1;
    ropeGroup.add(ribbon);
    scene.add(ropeGroup);

    // 3D Characters: Team A (Left / Blue) & Team B (Right / Orange)
    const createTeam = (isTeamA: boolean) => {
      const teamGroup = new THREE.Group();
      const color = isTeamA ? 0x3b82f6 : 0xf97316;
      const baseX = isTeamA ? -4 : 4;

      for (let i = 0; i < 3; i++) {
        const char = new THREE.Group();
        const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.2, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.6;
        char.add(body);

        const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.4;
        char.add(head);

        const offsetX = isTeamA ? -(i * 1.1) : (i * 1.1);
        char.position.set(baseX + offsetX, 0, (i % 2 === 0 ? 0.3 : -0.3));
        char.rotation.z = isTeamA ? 0.2 : -0.2;
        teamGroup.add(char);
      }
      return teamGroup;
    };

    const teamAGroup = createTeam(true);
    const teamBGroup = createTeam(false);
    scene.add(teamAGroup);
    scene.add(teamBGroup);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Position: 0 (Team A wins at X=-3.6), 50 (Center at X=0), 100 (Team B wins at X=+3.6)
      // targetX = ((position - 50) / 50) * 3.6
      const targetX = ((positionRef.current - 50) / 50) * 3.6;
      if (ropeGroupRef.current) {
        ropeGroupRef.current.position.x += (targetX - ropeGroupRef.current.position.x) * 0.1;
        ropeGroupRef.current.position.y = 1 + Math.sin(time * 6) * 0.04;
      }

      teamAGroup.children.forEach((c, idx) => {
        c.position.y = Math.sin(time * 5 + idx) * 0.05;
      });
      teamBGroup.children.forEach((c, idx) => {
        c.position.y = Math.sin(time * 5 + idx) * 0.05;
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
  }, []);

  // Answer checking adhering 100% to StudyAI keo-co mechanics!
  const handleAnswer = (optionIndex: number) => {
    if (!currentQuestion || answeredState !== null || winnerTeam) return;

    const isCorrect = optionIndex === currentQuestion.correct;
    setAnsweredState({ selectedIndex: optionIndex, isCorrect });

    let newPos = position;
    if (isCorrect) {
      sound.playCorrect();
      // Đúng: Đội A kéo về âm (-12), Đội B kéo về dương (+12)
      newPos += turn === 'A' ? -12 : 12;
    } else {
      sound.playWrong();
      // Sai: Giúp đội bạn kéo ngược lại 8%!
      newPos += turn === 'A' ? 8 : -8;
    }

    newPos = Math.max(0, Math.min(100, newPos));
    setPosition(newPos);
    positionRef.current = newPos;

    // Check Win Condition: position <= 4% or position >= 96%
    setTimeout(() => {
      if (newPos <= 4) {
        setWinnerTeam(teamA);
        sound.playFanfare();
        return;
      }
      if (newPos >= 96) {
        setWinnerTeam(teamB);
        sound.playFanfare();
        return;
      }

      // Switch turn to the other team
      const nextTurn = turn === 'A' ? 'B' : 'A';
      setTurn(nextTurn);

      // Present next question
      let nextIndex = quizIndex;
      let queue = quizQueue;
      if (nextIndex >= queue.length) {
        queue = Storage.shuffle(questions);
        setQuizQueue(queue);
        nextIndex = 0;
      }

      const nextRaw = queue[nextIndex];
      setCurrentQuestion(Storage.shuffleOptions(nextRaw));
      setQuizIndex(nextIndex + 1);
      setAnsweredState(null);
    }, 1000);
  };

  const handleOpenSettings = () => {
    setCustomTeamA(teamA);
    setCustomTeamB(teamB);
    setCustomQuizText(Storage.toStudyAiText(questions));
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    const newQuiz = Storage.parseStudyAiText(customQuizText);
    if (newQuiz.length < 1) {
      alert("Cần ít nhất 1 câu hỏi hợp lệ!");
      return;
    }
    setTeamA(customTeamA.trim() || "Đội A (Xanh)");
    setTeamB(customTeamB.trim() || "Đội B (Cam)");
    setQuestions(newQuiz);
    setIsSettingsOpen(false);
    startNewMatch(newQuiz);
  };

  const currentPlayingTeam = turn === 'A' ? teamA : teamB;

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
            <span>🪢 Kéo Co Tri Thức</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {teamA} vs {teamB}
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
            Soạn Tên Đội & Câu Hỏi
          </button>

          <button
            onClick={() => startNewMatch()}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:text-white text-slate-400 transition"
            title="Bắt đầu ván mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-7xl mx-auto w-full">
        
        {/* Left: 3D Tug Arena */}
        <div className="lg:col-span-7 rounded-3xl glass-panel border border-slate-800 p-4 relative flex flex-col items-center justify-center shadow-2xl">
          
          {winnerTeam && (
            <div className={`absolute top-6 z-20 px-8 py-3 rounded-2xl font-black text-xl shadow-2xl flex items-center gap-3 animate-bounce ${
              winnerTeam === teamA ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'
            }`}>
              <Trophy className="w-7 h-7" />
              CHÚC MỪNG {winnerTeam.toUpperCase()} ĐÃ CHIẾN THẮNG!
            </div>
          )}

          <div ref={mountRef} className="w-full aspect-[4/3] max-h-[480px]" />

          {/* Tug of War Tension Bar */}
          <div className="w-full max-w-md mt-3 pt-3 border-t border-slate-800">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-blue-400">🔵 {teamA} ({100 - position}%)</span>
              <span className="text-slate-400">THẾ TRẬN</span>
              <span className="text-orange-400">🟠 {teamB} ({position}%)</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-800 overflow-hidden flex relative border border-slate-700">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${100 - position}%` }}
              />
              <div 
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${position}%` }}
              />
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white -translate-x-1/2" />
            </div>
          </div>
        </div>

        {/* Right: Question Area */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Turn Banner */}
          <div className={`p-4 rounded-2xl glass-card flex items-center justify-between border transition-all ${
            turn === 'A' 
              ? 'border-blue-500/50 bg-blue-950/20 text-blue-300' 
              : 'border-orange-500/50 bg-orange-950/20 text-orange-300'
          }`}>
            <div>
              <div className="text-xs text-slate-400">Đang thi đấu:</div>
              <div className="text-lg font-black flex items-center gap-2">
                <span>{turn === 'A' ? '🔵' : '🟠'} Lượt của {currentPlayingTeam}</span>
              </div>
            </div>
            <div className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
              Đúng kéo +12% • Sai bị kéo -8%
            </div>
          </div>

          {/* Question Box */}
          <div className="flex-1 p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-center">
            {winnerTeam ? (
              <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="text-5xl">🏆</div>
                <h3 className="text-xl font-black text-white">{winnerTeam} đã chiến thắng!</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Đội đã xuất sắc kéo được sợi dây về phía mình. Bấm nút bên dưới để bắt đầu ván mới.
                </p>
                <button
                  onClick={() => startNewMatch()}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl transition"
                >
                  🔄 Bắt Đầu Ván Mới
                </button>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className={`font-bold uppercase tracking-wider ${turn === 'A' ? 'text-blue-400' : 'text-orange-400'}`}>
                    ❓ Câu hỏi cho {currentPlayingTeam}
                  </span>
                  <span className="text-slate-400">Câu {quizIndex}/{questions.length}</span>
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
                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    answeredState.isCorrect 
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}>
                    <span className="font-bold">
                      {answeredState.isCorrect 
                        ? `🎉 Chính xác! ${currentPlayingTeam} kéo dây +12%!` 
                        : `😢 Sai rồi! Bị đội bạn kéo dây 8%!`}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Đang chuyển lượt...
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

        </div>

      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl glass-panel p-6 border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Soạn Tên 2 Đội & Bộ Câu Hỏi Kéo Co
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-blue-400">Tên Đội A (Bên trái):</label>
                <input
                  type="text"
                  value={customTeamA}
                  onChange={(e) => setCustomTeamA(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-orange-400">Tên Đội B (Bên phải):</label>
                <input
                  type="text"
                  value={customTeamB}
                  onChange={(e) => setCustomTeamB(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">
                Bộ câu hỏi trắc nghiệm (Cú pháp: Câu hỏi | Đáp án đúng | Sai 1 | Sai 2):
              </label>
              <textarea
                value={customQuizText}
                onChange={(e) => setCustomQuizText(e.target.value)}
                rows={6}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 mt-1 font-mono"
              />
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
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white transition font-bold"
              >
                Lưu & Bắt Đầu Ván Mới
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
          startNewMatch(selectedQs);
        }}
      />

    </div>
  );
}
