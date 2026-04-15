// src/config.ts
export const CONFIG = {
    API_BASE: import.meta.env.VITE_API_URL || "/api",
    MQTT_URL: import.meta.env.VITE_MQTT_URL || "ws://192.168.1.100:8083",
    FRIGATE_BASE: import.meta.env.VITE_FRIGATE_URL || "/frigate",
    DEMO_MODE: import.meta.env.VITE_DEMO_MODE === "true"
  };