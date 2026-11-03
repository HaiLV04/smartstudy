export interface Participant {
  id: string;
  name: string;
  color?: string;
  enabled: boolean;
}

export interface GlobalGameSettings {
  participants: Participant[];
  raceDurationSec: number; // Thời gian đua vịt (giây): 5, 8, 10, 15, 20...
  spinDurationSec: number; // Thời gian quay vòng quay (giây): 3, 5, 8
  questionTimerSec: number; // Thời gian trả lời câu hỏi (giây): 0 = Không giới hạn, 10, 15, 20, 30
  teamRedName: string;
  teamBlueName: string;
}

export const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: "p1", name: "Tổ 1", color: "#facc15", enabled: true },
  { id: "p2", name: "Tổ 2", color: "#38bdf8", enabled: true },
  { id: "p3", name: "Tổ 3", color: "#f97316", enabled: true },
  { id: "p4", name: "Tổ 4", color: "#ec4899", enabled: true },
  { id: "p5", name: "Lan", color: "#10b981", enabled: true },
  { id: "p6", name: "Huy", color: "#a855f7", enabled: true },
  { id: "p7", name: "An", color: "#ef4444", enabled: true },
  { id: "p8", name: "Bình", color: "#14b8a6", enabled: true },
];

export const DEFAULT_SETTINGS: GlobalGameSettings = {
  participants: DEFAULT_PARTICIPANTS,
  raceDurationSec: 8,
  spinDurationSec: 5,
  questionTimerSec: 20,
  teamRedName: "Đội Đỏ (Tổ 1 & 2)",
  teamBlueName: "Đội Xanh (Tổ 3 & 4)",
};

const STORAGE_KEY = "smartstudy_global_settings";

export const GameSettingsManager = {
  getSettings(): GlobalGameSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<GlobalGameSettings>) {
    if (typeof window === "undefined") return;
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("smartstudy_settings_updated"));
    } catch (e) {
      console.error(e);
    }
  },

  getActiveParticipants(): Participant[] {
    const s = this.getSettings();
    const active = s.participants.filter(p => p.enabled);
    return active.length > 0 ? active : DEFAULT_PARTICIPANTS.slice(0, 4);
  }
};
