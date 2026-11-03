'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Users, 
  Clock, 
  Check, 
  Trash2, 
  Plus, 
  RotateCcw,
  Sparkles,
  Timer
} from 'lucide-react';
import { 
  GameSettingsManager, 
  GlobalGameSettings, 
  Participant, 
  DEFAULT_PARTICIPANTS, 
  DEFAULT_SETTINGS 
} from '@/lib/gameSettings';
import { sound } from '@/lib/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (settings: GlobalGameSettings) => void;
}

const COLOR_PRESETS = [
  "#facc15", "#38bdf8", "#f97316", "#ec4899", 
  "#10b981", "#a855f7", "#ef4444", "#14b8a6",
  "#6366f1", "#84cc16", "#f43f5e", "#06b6d4"
];

export default function GameSettingsModal({ isOpen, onClose, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState<'participants' | 'timer' | 'teams'>('participants');
  const [settings, setSettings] = useState<GlobalGameSettings>(DEFAULT_SETTINGS);
  const [bulkText, setBulkText] = useState<string>('');
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const current = GameSettingsManager.getSettings();
      setSettings(current);
      setBulkText(current.participants.map(p => p.name).join('\n'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle participant active
  const toggleParticipant = (id: string) => {
    setSettings(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === id ? { ...p, enabled: !p.enabled } : p
      )
    }));
    sound.playTick();
  };

  // Change participant name
  const updateName = (id: string, name: string) => {
    setSettings(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === id ? { ...p, name } : p
      )
    }));
  };

  // Change participant color
  const updateColor = (id: string, color: string) => {
    setSettings(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === id ? { ...p, color } : p
      )
    }));
  };

  // Delete participant
  const removeParticipant = (id: string) => {
    setSettings(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }));
    sound.playTick();
  };

  // Add participant
  const addParticipant = () => {
    const newId = `p_${Date.now()}`;
    const nextColor = COLOR_PRESETS[settings.participants.length % COLOR_PRESETS.length];
    setSettings(prev => ({
      ...prev,
      participants: [
        ...prev.participants,
        { id: newId, name: `Học sinh ${prev.participants.length + 1}`, color: nextColor, enabled: true }
      ]
    }));
    sound.playTick();
  };

  // Bulk parse
  const applyBulkText = () => {
    const names = bulkText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (names.length === 0) return;

    const newParticipants: Participant[] = names.map((name, i) => ({
      id: `p_bulk_${i}_${Date.now()}`,
      name,
      color: COLOR_PRESETS[i % COLOR_PRESETS.length],
      enabled: true
    }));

    setSettings(prev => ({ ...prev, participants: newParticipants }));
    setIsBulkMode(false);
    sound.playCorrect();
  };

  // Presets
  const selectQuickPreset = (type: 'all' | 'none' | 'groups' | 'first4') => {
    if (type === 'all') {
      setSettings(prev => ({
        ...prev,
        participants: prev.participants.map(p => ({ ...p, enabled: true }))
      }));
    } else if (type === 'none') {
      setSettings(prev => ({
        ...prev,
        participants: prev.participants.map(p => ({ ...p, enabled: false }))
      }));
    } else if (type === 'first4') {
      setSettings(prev => ({
        ...prev,
        participants: prev.participants.map((p, idx) => ({ ...p, enabled: idx < 4 }))
      }));
    } else if (type === 'groups') {
      const groups = ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4"].map((g, i) => ({
        id: `group_${i}`,
        name: g,
        color: COLOR_PRESETS[i],
        enabled: true
      }));
      setSettings(prev => ({ ...prev, participants: groups }));
    }
    sound.playTick();
  };

  // Save all settings
  const handleSave = () => {
    // Ensure at least 2 active participants
    const active = settings.participants.filter(p => p.enabled);
    if (active.length < 2) {
      alert("Cần bật ít nhất 2 học sinh / đội tham gia để các trò chơi hoạt động công bằng!");
      return;
    }

    GameSettingsManager.saveSettings(settings);
    sound.playFanfare();
    if (onSaved) onSaved(settings);
    onClose();
  };

  const activeCount = settings.participants.filter(p => p.enabled).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl glass-panel border border-slate-700/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Cài Đặt Trò Chơi & Người Tham Gia
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Áp Dụng Cho Tất Cả Các Game
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tùy chỉnh danh sách vịt đua / học sinh, thời gian đua và đếm ngược câu hỏi
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/30">
          <button
            onClick={() => { setActiveTab('participants'); sound.playTick(); }}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition border-b-2 ${
              activeTab === 'participants'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Học Sinh / Vịt Đua ({activeCount}/{settings.participants.length} bật)
          </button>

          <button
            onClick={() => { setActiveTab('timer'); sound.playTick(); }}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition border-b-2 ${
              activeTab === 'timer'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Cấu Hình Thời Gian (Đua & Đếm Ngược)
          </button>

          <button
            onClick={() => { setActiveTab('teams'); sound.playTick(); }}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition border-b-2 ${
              activeTab === 'teams'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Tên Đội Kéo Co
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* TAB 1: Participants / Ducks */}
          {activeTab === 'participants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs text-slate-400">
                  Tick chọn học sinh / tổ sẽ tham gia vào các trò chơi (Đua vịt, Vòng quay):
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <button 
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {isBulkMode ? "Quản lý chi tiết" : "Dán nhanh từ danh sách"}
                  </button>
                  <button 
                    onClick={() => selectQuickPreset('all')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    Bật tất cả
                  </button>
                  <button 
                    onClick={() => selectQuickPreset('groups')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    4 Tổ
                  </button>
                </div>
              </div>

              {isBulkMode ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Dán danh sách tên học sinh trong lớp (mỗi dòng 1 tên):
                  </p>
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    rows={8}
                    className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="Tổ 1&#10;Tổ 2&#10;Lan&#10;Huy&#10;An&#10;Bình..."
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={applyBulkText}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                    >
                      Cập nhật danh sách này
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {settings.participants.map((p) => (
                    <div 
                      key={p.id}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                        p.enabled 
                          ? 'bg-slate-900/80 border-slate-700' 
                          : 'bg-slate-950/40 border-slate-900 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={p.enabled}
                          onChange={() => toggleParticipant(p.id)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />

                        {/* Color Picker / Preset */}
                        <div className="relative group">
                          <span 
                            className="w-6 h-6 rounded-lg block cursor-pointer border border-white/20 shadow-sm"
                            style={{ backgroundColor: p.color || '#facc15' }}
                          />
                        </div>

                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => updateName(p.id, e.target.value)}
                          className="bg-transparent border-b border-slate-700 hover:border-slate-500 focus:border-amber-400 text-sm font-semibold text-white px-1.5 py-0.5 focus:outline-none flex-1 max-w-[220px]"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => removeParticipant(p.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addParticipant}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-800 hover:border-amber-500/40 text-slate-400 hover:text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm một người chơi / chú vịt mới
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Timer & Duration */}
          {activeTab === 'timer' && (
            <div className="space-y-6">
              
              {/* Race Duration Setting */}
              <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Timer className="w-4 h-4 text-amber-400" />
                      Thời Gian Đua Vịt (Giây)
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Độ dài thời gian cả đàn vịt bơi đua từ vạch xuất phát đến đích
                    </p>
                  </div>
                  <span className="text-xl font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                    {settings.raceDurationSec} giây
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {[3, 5, 8, 10, 15, 20, 30].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        setSettings(prev => ({ ...prev, raceDurationSec: sec }));
                        sound.playTick();
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        settings.raceDurationSec === sec
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-black'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Wheel Spin Duration */}
              <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🎡</span> Thời Gian Quay Vòng Quay
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Thời gian bánh xe xoay tíc-tắc trước khi dừng lại ở người trúng
                    </p>
                  </div>
                  <span className="text-lg font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-xl border border-teal-500/20">
                    {settings.spinDurationSec} giây
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {[
                    { sec: 3, label: "3s (Nhanh)" },
                    { sec: 5, label: "5s (Chuẩn)" },
                    { sec: 8, label: "8s (Kịch tính)" },
                  ].map((item) => (
                    <button
                      key={item.sec}
                      onClick={() => {
                        setSettings(prev => ({ ...prev, spinDurationSec: item.sec }));
                        sound.playTick();
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        settings.spinDurationSec === item.sec
                          ? 'bg-teal-500 text-slate-950 border-teal-400 font-black shadow-md shadow-teal-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Think Timer */}
              <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>⏳</span> Thời Gian Suy Nghĩ Trả Lời Câu Hỏi
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Đồng hồ đếm ngược khi học sinh đang đứng trả lời
                    </p>
                  </div>
                  <span className="text-lg font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20">
                    {settings.questionTimerSec === 0 ? "Không giới hạn" : `${settings.questionTimerSec}s`}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {[
                    { sec: 0, label: "Vô hạn" },
                    { sec: 10, label: "10s" },
                    { sec: 15, label: "15s" },
                    { sec: 20, label: "20s" },
                    { sec: 30, label: "30s" },
                  ].map((item) => (
                    <button
                      key={item.sec}
                      onClick={() => {
                        setSettings(prev => ({ ...prev, questionTimerSec: item.sec }));
                        sound.playTick();
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        settings.questionTimerSec === item.sec
                          ? 'bg-indigo-500 text-white border-indigo-400 font-black shadow-md shadow-indigo-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Tug of War Teams */}
          {activeTab === 'teams' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Tùy chỉnh tên của 2 phe đối đầu trong trò chơi Kéo Co 3D:
              </p>

              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <label className="text-xs font-bold text-rose-400 uppercase">Tên Đội 1 (Phe Đỏ):</label>
                <input
                  type="text"
                  value={settings.teamRedName}
                  onChange={(e) => setSettings(prev => ({ ...prev, teamRedName: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-rose-500/50 text-white text-sm font-bold focus:outline-none focus:border-rose-400"
                  placeholder="Ví dụ: Đội Đỏ, Tổ 1, Nam..."
                />
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                <label className="text-xs font-bold text-blue-400 uppercase">Tên Đội 2 (Phe Xanh):</label>
                <input
                  type="text"
                  value={settings.teamBlueName}
                  onChange={(e) => setSettings(prev => ({ ...prev, teamBlueName: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-blue-500/50 text-white text-sm font-bold focus:outline-none focus:border-blue-400"
                  placeholder="Ví dụ: Đội Xanh, Tổ 2, Nữ..."
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={() => {
              setSettings(DEFAULT_SETTINGS);
              sound.playTick();
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-4 h-4" /> Khôi phục mặc định
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 transition transform active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Lưu & Áp Dụng Cho Tất Cả Các Game
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
