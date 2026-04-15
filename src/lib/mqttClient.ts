import mqtt from 'mqtt';
import { useMqttCache } from '@/store/mqttCache';

let client: mqtt.MqttClient | null = null;

export const connectMqtt = (wsUrl: string, username: string, password: string) => {
  if (client?.connected) return client;
  
  client = mqtt.connect(wsUrl, { 
    username, 
    password, 
    reconnectPeriod: 3000,
    clean: true 
  });
  
  client.on('connect', () => useMqttCache.getState().setConnected(true));
  client.on('close', () => useMqttCache.getState().setConnected(false));
  client.on('message', (topic, payload) => {
    try {
      useMqttCache.getState().pushMessage(topic, JSON.parse(payload.toString()));
    } catch (e) {
      console.warn('MQTT parse error:', e);
    }
  });
  
  return client;
};

// Hook dùng cho component
export const useMqttSubscribe = (topicPattern: string, callback?: (data: any) => void) => {
  const push = useMqttCache(s => s.pushMessage);
  
  // Nếu cần auto-subscribe khi mount, có thể thêm useEffect ở đây
  return { push, isConnected: useMqttCache(s => s.isConnected) };
};