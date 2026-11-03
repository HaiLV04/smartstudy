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
  Award
} from 'lucide-react';
import Link from 'next/link';

interface DuckRacer {
  id: number;
  name: string;
  color: number;
  progress: number; // 0 to 100
  mesh?: THREE.Group;
}

const INITIAL_DUCKS: DuckRacer[] = [
  { id: 1, name: "Vịt Vàng (Đội 1)", color: 0xfacc15, progress: 0 },
  { id: 2, name: "Vịt Xanh (Đội 2)", color: 0x38bdf8, progress: 0 },
  { id: 3, name: "Vịt Cam (Đội 3)", color: 0xf97316, progress: 0 },
  { id: 4, name: "Vịt Hồng (Đội 4)", color: 0xec4899, progress: 0 },
];

export default function DuaVit3DPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const ducksRef = useRef<DuckRacer[]>(INITIAL_DUCKS);

  // States
  const [ducks, setDucks] = useState<DuckRacer[]>(INITIAL_DUCKS);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>(QUESTION_BANKS[0].subjects[0].questions);
  const [quizTitle, setQuizTitle] = useState<string>("Toán Lớp 1 - Cơ Bản");
  const [activeQuestion, setActiveQuestion] = useState<Question>(QUESTION_BANKS[0].subjects[0].questions[0]);
  const [winner, setWinner] = useState<DuckRacer | null>(null);
  const [answeredState, setAnsweredState] = useState<{ selectedIndex: number; isCorrect: boolean } | null>(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);

  // Three.js 3D River Scene
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.03);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 7, 14);
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
    sun.position.set(10, 15, 10);
    sun.castShadow = true;
    scene.add(sun);

    // 1. Water Plane (River)
    const waterGeo = new THREE.PlaneGeometry(16, 24, 64, 64);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.3,
      wireframe: false,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    scene.add(waterMesh);

    // 2. River Banks (Grass)
    const bankGeo = new THREE.BoxGeometry(4, 1, 24);
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    
    const leftBank = new THREE.Mesh(bankGeo, bankMat);
    leftBank.position.set(-10, 0.2, 0);
    scene.add(leftBank);

    const rightBank = new THREE.Mesh(bankGeo, bankMat);
    rightBank.position.set(10, 0.2, 0);
    scene.add(rightBank);

    // 3. Finish Line Banner
    const finishLineGroup = new THREE.Group();
    finishLineGroup.position.set(0, 1.5, -9);

    const bannerGeo = new THREE.BoxGeometry(16, 0.5, 0.2);
    const bannerMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    finishLineGroup.add(banner);

    const poleGeo = new THREE.CylinderGeometry(0.15, 0.15, 4);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const poleL = new THREE.Mesh(poleGeo, poleMat);
    poleL.position.set(-7.5, -1.5, 0);
    finishLineGroup.add(poleL);

    const poleR = new THREE.Mesh(poleGeo, poleMat);
    poleR.position.set(7.5, -1.5, 0);
    finishLineGroup.add(poleR);
    scene.add(finishLineGroup);

    // 4. Create 3D Duck Racers
    const duckLaneX = [-4.5, -1.5, 1.5, 4.5];
    const createdDuckMeshes: THREE.Group[] = [];

    ducksRef.current.forEach((duck, idx) => {
      const duckGroup = new THREE.Group();

      // Body (Sphere)
      const bodyGeo = new THREE.SphereGeometry(0.65, 16, 16);
      const bodyMat = new THREE.MeshStandardMaterial({ color: duck.color, roughness: 0.3 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.5;
      duckGroup.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const head = new THREE.Mesh(headGeo, bodyMat);
      head.position.set(0, 1.1, -0.4);
      duckGroup.add(head);

      // Beak (Cone)
      const beakGeo = new THREE.ConeGeometry(0.18, 0.45, 16);
      const beakMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.rotation.x = -Math.PI / 2;
      beak.position.set(0, 1.05, -0.85);
      duckGroup.add(beak);

      // Eyes
      const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(0.25, 1.2, -0.6);
      duckGroup.add(eyeL);

      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(-0.25, 1.2, -0.6);
      duckGroup.add(eyeR);

      // Initial placement (Z from 9 start to -9 finish)
      const startZ = 9 - (duck.progress / 100) * 18;
      duckGroup.position.set(duckLaneX[idx], 0, startZ);

      scene.add(duckGroup);
      duck.mesh = duckGroup;
      createdDuckMeshes.push(duckGroup);
    });

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Water wave animation
      const pos = waterGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        pos.setZ(i, Math.sin(u * 1.5 + time * 3) * 0.12 + Math.cos(v * 1.2 + time * 2) * 0.08);
      }
      pos.needsUpdate = true;

      // Ducks bobbing on water and moving towards target
      ducksRef.current.forEach((duck, idx) => {
        if (duck.mesh) {
          const targetZ = 9 - (duck.progress / 100) * 18;
          duck.mesh.position.z += (targetZ - duck.mesh.position.z) * 0.1;
          duck.mesh.position.y = Math.sin(time * 4 + idx) * 0.08;
          duck.mesh.rotation.y = Math.sin(time * 3 + idx) * 0.05;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix;
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

  // Answer handler
  const handleAnswer = (optionIndex: number) => {
    if (!activeQuestion || answeredState !== null || winner) return;

    const isCorrect = optionIndex === activeQuestion.correct;
    setAnsweredState({ selectedIndex: optionIndex, isCorrect });

    if (isCorrect) {
      sound.playCorrect();

      // Advance current duck
      setDucks(prev => {
        const updated = [...prev];
        const currentDuck = updated[currentTurn];
        const newProgress = Math.min(100, currentDuck.progress + 25);
        currentDuck.progress = newProgress;
        ducksRef.current = updated;

        // Check winner
        if (newProgress >= 100 && !winner) {
          setWinner(currentDuck);
          sound.playFanfare();
        }

        return updated;
      });
    } else {
      sound.playWrong();
    }
  };

  const nextTurn = () => {
    if (winner) return;
    const nextIdx = (currentTurn + 1) % ducks.length;
    setCurrentTurn(nextIdx);

    // Pick a new question
    if (questions.length > 0) {
      const randQ = questions[Math.floor(Math.random() * questions.length)];
      setActiveQuestion(Storage.shuffleOptions(randQ));
    }
    setAnsweredState(null);
  };

  const resetGame = () => {
    const reset = ducks.map(d => ({ ...d, progress: 0 }));
    setDucks(reset);
    ducksRef.current = reset;
    setCurrentTurn(0);
    setWinner(null);
    setAnsweredState(null);
    sound.playTick();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative">
      
      {/* Header */}
      <header className="p-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Trang chủ
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span>🦆 Đua Vịt Tri Thức 3D</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              Đua Thuyền Sông Nước
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-7xl mx-auto w-full">
        
        {/* Left: 3D River */}
        <div className="lg:col-span-7 rounded-3xl glass-panel border border-slate-800 p-4 relative flex flex-col items-center justify-center">
          
          {winner && (
            <div className="absolute top-6 z-20 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xl shadow-2xl flex items-center gap-3 animate-bounce">
              <Trophy className="w-7 h-7" />
              CHÚC MỪNG {winner.name.toUpperCase()} VỀ ĐÍCH!
            </div>
          )}

          {/* Canvas */}
          <div ref={mountRef} className="w-full aspect-[4/3] max-h-[500px]" />

          {/* Duck Progress Bars */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-800">
            {ducks.map((duck, idx) => (
              <div 
                key={duck.id} 
                className={`p-2.5 rounded-xl border transition ${
                  currentTurn === idx 
                    ? 'bg-slate-800 border-teal-500 shadow-md shadow-teal-500/20' 
                    : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold truncate">{duck.name}</span>
                  <span className="text-amber-400 font-bold">{duck.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${duck.progress}%`,
                      backgroundColor: `#${duck.color.toString(16).padStart(6, '0')}`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Question Arena */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          <div className="p-4 rounded-2xl glass-card flex items-center justify-between border border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Đến lượt thi đấu:</div>
              <div className="text-lg font-bold text-teal-400 flex items-center gap-2">
                <span>🦆 {ducks[currentTurn].name}</span>
              </div>
            </div>
            <div className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 font-bold">
              Đúng tiến +25% vạch đích
            </div>
          </div>

          {/* Active Question Box */}
          <div className="flex-1 p-6 rounded-3xl glass-panel border border-slate-800 flex flex-col justify-center space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-teal-400">❓ CÂU HỎI VƯỢT SÔNG</span>
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
                  {answeredState.isCorrect ? '🎉 Trả lời đúng, vịt đã bơi lên trước!' : '❌ Chưa chính xác, nhường lượt cho đội bạn!'}
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
