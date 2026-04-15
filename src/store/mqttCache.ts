import { create } from "zustand";

export type MqttMessage = { topic: string; payload: any; ts: number };

interface MqttState {
  messages: Record<string, MqttMessage>;
  isConnected: boolean;
  pushMessage: (topic: string, payload: any) => void;
  setConnected: (v: boolean) => void;
  getLatest: (pattern: string) => MqttMessage | null;
}

export const useMqttCache = create<MqttState>((set, get) => ({
  messages: {},
  isConnected: false,
  pushMessage: (topic, payload) => set((s) => ({
    messages: { ...s.messages, [topic]: { topic, payload, ts: Date.now() } }
  })),
  setConnected: (v) => set({ isConnected: v }),
  getLatest: (pattern) => {
    const { messages } = get();
    return Object.values(messages).find(m => new RegExp(pattern).test(m.topic)) || null;
  },
}));