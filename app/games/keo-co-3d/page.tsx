'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '@/lib/audio';
import { Storage } from '@/lib/storage';
import { Question, QUESTION_BANKS } from '@/data/questionBanks';
import QuestionBankModal from '@/components/QuestionBankModal';
import GameSettingsModal from '@/components/GameSettingsModal';
import { GameSettingsManager } from '@/lib/gameSettings';
import { ArrowLeft, BookOpen, RefreshCw, Trophy, CheckCircle2, XCircle, Settings } from 'lucide-react';
import Link from 'next/link';

export default function KeoCo3DPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const ropeGroupRef = useRef<THREE.Group | null>(null);

  // Score balance: -50 (Team Red wins) to +50 (Team Blue wins). Center is 0.
  const [balance, setBalance] = useState<number>(0);
  const balanceRef = useRef<number>(0);

  const [teamRed, setTeamRed] = useState<string>("Đội Đỏ");
  const [teamBlue, setTeamBlue] = useState<string>("Đội Xanh");

  const [currentTurn, setCurrentTurn] = useState<'red' | 'blue'>('red');
  const [questions, setQuestions] = useState<Question[]>(QUESTION_BANKS[0].subjects[0].questions);
  const [quizTitle, setQuizTitle] = useState<string>("Toán Lớp 1 - Cơ Bản");
  const [activeQuestion, setActiveQuestion] = useState<Question>(QUESTION_BANKS[0].subjects[0].questions[0]);
  const [winner, setWinner] = useState<'red' | 'blue' | null>(null);
  const [answeredState, setAnsweredState] = useState<{ selectedIndex: number; isCorrect: boolean } | null>(null);

  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  const loadSettings = () => {
    const s = GameSettingsManager.getSettings();
    setTeamRed(s.teamRedName);
    setTeamBlue(s.teamBlueName);
  };

  useEffect(() => {
    loadSettings();
    const handleSettingsUpdated = () => loadSettings();
    window.addEventListener('smartstudy_settings_updated', handleSettingsUpdated);
    return () => window.removeEventListener('smartstudy_settings_updated', handleSettingsUpdated);
  }, []);

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

    const groundGeo = new THREE.PlaneGeometry(16, 8);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const lineGeo = new THREE.PlaneGeometry(0.15, 8);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.01;
    scene.add(line);

    const markRed = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    markRed.rotation.x = -Math.PI / 2;
    markRed.position.set(-3.5, 0.01, 0);
    scene.add(markRed);

    const markBlue = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 8), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
    markBlue.rotation.x = -Math.PI / 2;
    markBlue.position.set(3.5, 0.01, 0);
    scene.add(markBlue);

    const ropeGroup = new THREE.Group();
    ropeGroupRef.current = ropeGroup;

    const ropeGeo = new THREE.CylinderGeometry(0.12, 0.12, 12, 16);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.rotation.z = Math.PI / 2;
    rope.position.y = 1;
    ropeGroup.add(rope);

    const ribbonGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.2 });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.y = 1;
    ropeGroup.add(ribbon);
    scene.add(ropeGroup);

    const createTeam = (isRed: boolean) => {
      const teamGroup = new THREE.Group();
      const color = isRed ? 0xef4444 : 0x3b82f6;
      const baseX = isRed ? -4 : 4;

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

        const offsetX = isRed ? -(i * 1.1) : (i * 1.1);
        char.position.set(baseX + offsetX, 0, (i % 2 === 0 ? 0.3 : -0.3));
        char.rotation.z = isRed ? 0.2 : -0.2;
        teamGroup.add(char);
      }
      return teamGroup;
    };

    const teamRedGroup = createTeam(true);
    const teamBlueGroup = createTeam(false);
    scene.add(teamRedGroup);
    scene.add(teamBlueGroup);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      const targetX = (balanceRef.current / 50) * 3.5;
      if (ropeGroupRef.current) {
        ropeGroupRef.current.position.x += (targetX - ropeGroupRef.current.position.x) * 0.1;
        ropeGroupRef.current.position.y = 1 + Math.sin(time * 6) * 0.05;
      }

      teamRedGroup.children.forEach((c, idx) => {
        c.position.y = Math.sin(time * 5 + idx) * 0.06;
      });
      teamBlueGroup.children.forEach((c, idx) => {
        c.position.y = Math.sin(time * 5 + idx) * 0.06;
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

  const handleAnswer = (optionIndex: number) => {
    if (!activeQuestion || answeredState !== null || winner) return;

    const isCorrect = optionIndex === activeQuestion.correct;
    setAnsweredState({ selectedIndex: optionIndex, isCorrect });

    if (isCorrect) {
      sound.playCorrect();

      const pullAmount = currentTurn === 'red' ? -15 : 15;
      const newBal = Math.max(-50, Math.min(50, balance + pullAmount));
      setBalance(newBal);
      balanceRef.current = newBal;

      if (newBal <= -50) {
        setWinner('red');
        sound.playFanfare();
      } else if (newBal >= 50) {
        setWinner('blue');
        sound.playFanfare();
      }
    } else {
      sound.playWrong();
    }
  };

  const nextTurn = () => {
    if (winner) return;
    setCurrentTurn(prev => (prev === 'red' ? 'blue' : 'red'));
    if (questions.length > 0) {
      const randQ = questions[Math.floor(Math.random() * questions.length)];
      setActiveQuestion(Storage.shuffleOptions(randQ));
    }
    setAnsweredState(null);
  };

  const resetGame = () => {
    setBalance(0);
    balanceRef.current = 0;
    setWinner(null);
    setCurrentTurn('red');
    setAnsweredState(null);
    sound.playTick();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative">
      <header className="p-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span>🪢 Kéo Co Tri Thức 3D</span>
            <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
              {teamRed} vs {teamBlue}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            Cài Đặt Đội & Thời Gian
          </button>

          <button
            onClick={() => setIsBankModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-600/50 transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            Đổi Bộ Đề (Lớp 1-5)
          </button>

          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:text-white text-slate-400 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-7xl mx-auto w-full">
        <div className="lg:col-span-7 rounded-3xl glass-panel border border-slate-800 p-4 relative flex flex-col items-center justify-center">
          
          {winner && (
            <div className={`absolute top-6 z-20 px-8 py-3 rounded-2xl font-black text-xl shadow-2xl flex items-center gap-3 animate-bounce ${
              winner === 'red' ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              <Trophy className="w-7 h-7" />
              CHÚC MỪNG {winner === 'red' ? teamRed.toUpperCase() : teamBlue.toUpperCase()} CHIẾN THẮNG!
            </div>
          )}

          <div ref={mountRef} className="w-full aspect-[4/3] max-h-[500px]" />

          <div className="w-full max-w-md mt-3 pt-3 border-t border-slate-800">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-rose-400">{teamRed} ({50 - balance}%)</span>
              <span className="text-slate-400">THẾ TRẬN</span>
              <span className="text-blue-400">{teamBlue} ({50 + balance}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex relative">
              <div 
                className="h-full bg-rose-500 transition-all duration-300"
                style={{ width: `${50 - (balance / 50) * 50}%` }}
              />
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${50 + (balance / 50) * 50}%` }}
              />
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white -translate-x-1/2" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className={`p-4 rounded-2xl glass-card flex items-center justify-between border ${
            currentTurn === 'red' ? 'border-rose-500/50 bg-rose-950/20' : 'border-blue-500/50 bg-blue-950/20'
          }`}>
            <div>
              <div className="text-xs text-slate-400">Lượt kéo dây của:</div>
              <div className={`text-xl font-black ${currentTurn === 'red' ? 'text-rose-400' : 'text-blue-400'}`}>
                {currentTurn === 'red' ? `🚩 ${teamRed}` : `🔷 ${teamBlue}`}
              </div>
            </div>
            <div className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 font-bold">
              Đúng kéo dây +15% về phe mình
            </div>
          </div>

          <div className="flex-1 p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-center space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-teal-400">❓ CÂU HỎI THI ĐẤU</span>
              <span>{quizTitle}</span>
            </div>

            <h3 className="text-base font-bold text-white leading-relaxed">
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
                    disabled={answeredState !== null || !!winner}
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
              <div className="pt-2 flex items-center justify-between">
                <span className={`text-xs font-bold ${answeredState.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {answeredState.isCorrect ? '🎉 Trả lời đúng, đã kéo dây về phía mình!' : '❌ Sai rồi, không thể kéo dây!'}
                </span>
                <button
                  onClick={nextTurn}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
                >
                  Lượt Đội Kế Tiếp →
                </button>
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
          setActiveQuestion(selectedQs[0]);
          setAnsweredState(null);
        }}
      />
    </div>
  );
}
