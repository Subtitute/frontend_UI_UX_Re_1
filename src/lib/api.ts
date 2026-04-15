/// <reference types="vite/client" />

export const API_BASE = import.meta.env.VITE_API_URL || "/api";

const api = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
};

export const sensorsApi = {
  list: async (params?: Record<string, string>) => 
    api<any[]>(`/sensors?${new URLSearchParams(params || {}).toString()}`),
  get: async (id: string) => api<any>(`/sensors/${id}`),
  updateConfig: async (id: string, data: any) => 
    api(`/sensors/${id}/config`, { method: "PATCH", body: JSON.stringify(data) }),
  sendCommand: async (id: string, cmd: string) => 
    api(`/sensors/${id}/cmd`, { method: "POST", body: JSON.stringify({ cmd }) }),
};

export const alertsApi = {
  list: async (params?: Record<string, string>) => 
    api<any[]>(`/alerts?${new URLSearchParams(params || {}).toString()}`),
  acknowledge: async (id: string, note?: string) => 
    api(`/alerts/${id}/ack`, { method: "PATCH", body: JSON.stringify({ note }) }),
  close: async (id: string, note?: string) => 
    api(`/alerts/${id}/close`, { method: "PATCH", body: JSON.stringify({ note }) }),
};