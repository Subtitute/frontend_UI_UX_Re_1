# 📡 RadarMonitor Frontend - Tài liệu tích hợp Backend
> Phiên bản: 1.0.0  
> Framework: React 18 + TypeScript + Vite + TailwindCSS  
> Mục tiêu: Giao diện giám sát cảm biến radar (fall detection, heartbeat) tích hợp backend có sẵn + Frigate + Mobile App

---

## 📋 Mục lục
- [🎯 Tổng quan](##tổng-quan)
- [📦 Cấu trúc dự án](##cấu-trúc-dự-án)
- [⚡ Quick Start](##quick-start)
- [🔌 Hướng dẫn tích hợp Backend](##hướng-dẫn-tích-hợp-backend)
- [📱 Lưu ý cho Mobile App](##lưu-ý-cho-mobile-app)
- [🎥 Tích hợp Frigate](##tích-hợp-frigate)
- [📡 MQTT Real-time](##mqtt-real-time)
- [🐳 Docker & Deployment](##docker--deployment)
- [🛠️ Troubleshooting](##troubleshooting)
- [✅ Checklist triển khai](##checklist-triển-khai)

--- 

## 🎯 Tổng quan
Frontend này được thiết kế để:
* ✅ Hiển thị dashboard giám sát cảm biến radar (fall detection, heartbeat, presence)
* ✅ Quản lý cảnh báo: ngã, mất kết nối, stale data, ngưỡng sinh tồn
* ✅ Cấu hình tham số kỹ thuật cảm biến từ xa
* ✅ Tích hợp real-time qua MQTT WebSocket
* ✅ Responsive hoàn toàn cho mobile app (Capacitor/React Native WebView)
* ✅ Proxy qua Nginx để tích hợp với backend port 5000 + Frigate
> Không phụ thuộc hardcode: Tất cả API endpoint, MQTT broker, Frigate URL đều cấu hình qua environment variables hoặc Nginx proxy.

---

## 📦 Cấu trúc dự án
```bash
frontend_UI_UX/
├── dist/                    # Build output (production)
├── src/
│   ├── api/                 # API adapter (REST)
│   │   └── api.ts           # Định nghĩa endpoints + mock mode
│   ├── components/          # Reusable UI components
│   │   ├── charts/          # Recharts wrappers
│   │   ├── layout/          # Sidebar, Header, MobileMenu
│   │   ├── realtime/        # MQTT hooks, status badges
│   │   └── tables/          # TanStack Table configs
│   ├── layouts/
│   │   └── DashboardLayout.tsx  # Responsive layout (desktop/mobile)
│   ├── lib/
│   │   ├── api.ts           # HTTP client + error handling
│   │   └── mqttClient.ts    # MQTT over WebSocket client
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Tổng quan hệ thống
│   │   ├── sensors/
│   │   │   ├── List.tsx     # Danh sách cảm biến (table/card responsive)
│   │   │   └── Detail.tsx   # Chi tiết + real-time metrics + config
│   │   ├── Alerts.tsx       # Quản lý cảnh báo + workflow
│   │   ├── History.tsx      # Biểu đồ + báo cáo thời gian
│   │   ├── Onboarding.tsx   # Thêm thiết bị mới (BLE/MQTT)
│   │   └── Admin.tsx        # Quản trị: user, thresholds, audit log
│   ├── store/
│   │   └── mqttCache.ts     # Zustand store cache MQTT messages
│   ├── types/               # TypeScript interfaces
│   ├── config.ts            # Runtime config (API_BASE, MQTT_URL, etc.)
│   ├── index.css            # Tailwind imports + mobile optimizations
│   ├── main.tsx             # Entry point + Router init
│   └── App.tsx              # Root component + Routes definition
├── public/                  # Static assets
├── docker-compose.yml       # Docker Compose config
├── Dockerfile               # Multi-stage build (Node → Nginx)
├── nginx.conf               # Reverse proxy: API/Frigate/MQTT + CORS + WS
├── package.json             # Dependencies + scripts
├── tailwind.config.js       # Tailwind + custom colors
├── tsconfig.json            # TypeScript config + path aliases
├── vite.config.ts           # Vite config + proxy dev server
└── README.md                # File này

```

---


## ⚡ Quick Start
### 🔹 Chạy Local Development (có mock data)

```bash
# 1. Cài dependencies
npm install

# 2. Bật DEMO_MODE trong src/lib/api.ts để không cần backend thật
#    const DEMO_MODE = true;

# 3. Chạy dev server
npm run dev

# 4. Truy cập
http://localhost:3000
```

### 🔹 Build & Chạy Docker (production)
```bash
# 1. Cập nhật nginx.conf với IP backend/Frigate thực tế

# 2. Build và chạy
docker compose up -d --build

# 3. Truy cập
http://localhost:3000

# 4. Xem log nếu cần debug
docker compose logs -f frontend
```

### 🔹 Test từ thiết bị khác trong LAN
```bash
# 1. Tìm IP máy chạy Docker
ipconfig  # Windows
ifconfig  # Mac/Linux

# 2. Truy cập từ browser điện thoại/máy khác
http://<IP-MAY-DOCKER>:3000
```

---

## 🔌 Hướng dẫn tích hợp Backend
### 📡 API REST Endpoint Requirements
Backend cần cung cấp các endpoint sau (JSON, Content-Type: application/json):

| Method  | Endpoint                    | Mô tả                                      | Request Body                                      | Response                                          |
|:--------|:----------------------------|:-------------------------------------------|:--------------------------------------------------|:--------------------------------------------------|
| `GET`   | `/api/sensors`              | List cảm biến (có filter)                  | Query params: `site`, `type`, `status`, `search`  | `Sensor[]`                                        |
| `GET`   | `/api/sensors/:id`          | Detail 1 cảm biến                          | `-`                                             | `SensorDetail`                                    |
| `PATCH` | `/api/sensors/:id/config`   | Cập nhật cấu hình fall detection           | `{ angleZ, height, duration, ... }`               | `{ success: boolean }`                            |
| `POST`  | `/api/sensors/:id/cmd`      | Gửi lệnh kỹ thuật                          | `{ cmd: "alive" \| "reset" \| "resetSetup" }`     | `{ success: boolean, result?: any }`              |
| `GET`   | `/api/alerts`               | List cảnh báo                              | Query params: `status`, `type`, `severity`, `dateFrom`, `dateTo` | `Alert[]`                                         |
| `PATCH` | `/api/alerts/:id/ack`       | Xác nhận cảnh báo                          | `{ note?: string }`                               | `{ success: boolean }`                            |
| `PATCH` | `/api/alerts/:id/close`     | Đóng cảnh báo                              | `{ note?: string }`                               | `{ success: boolean }`                            |
| `GET`   | `/api/history/metrics/:id`  | Time-series metrics                        | Query: `metric`, `range`, `aggregate`             | `{ labels: string[], values: number[] }`          |
| `GET`   | `/api/admin/users`          | List user (admin only)                     | `-`                                             | `User[]`                                          |
| `POST`  | `/api/admin/users`          | Tạo user mới                               | `{ email, role, name }`                           | `{ id: string }`                                  |

### 📦 Type Definitions (TypeScript)
```bash
interface Sensor {
  id: string;
  name: string;
  deviceId: string;
  type: "fall" | "heartbeat";
  site: string;
  room: string;
  status: "online" | "offline" | "error";
  lastSeen: string; // ISO timestamp hoặc "2m ago"
  model?: string;
  firmware?: string;
}

interface SensorDetail extends Sensor {
  topic: string;
  installLocation: string;
  config?: {
    angleZ: number;
    height: number;
    duration: number;
    standStillDuration: number;
    radarRange: number;
  };
  metrics?: {
    presence: boolean;
    distance: number;
    hr?: number;   // Heart rate (bpm)
    rr?: number;   // Respiration rate (rpm)
    fallState: "none" | "detecting" | "fallen";
    standStillState: "active" | "still" | "alert";
    [key: string]: any;
  };
}

interface Alert {
  id: string;
  deviceId: string;
  type: "fall" | "disconnect" | "stale" | "hr_high" | "rr_low" | "standstill";
  severity: "low" | "medium" | "high" | "critical";
  status: "new" | "acknowledged" | "processing" | "closed";
  ts: string; // ISO timestamp
  note?: string;
  acknowledgedBy?: string;
  closedAt?: string;
}
```
### 🔐 Authentication (nếu có)
* Frontend hỗ trợ Bearer Token qua header Authorization: Bearer <token>
* Token được lưu trong localStorage hoặc HttpOnly cookie (tùy backend)
* Nếu backend dùng JWT, frontend tự động attach token vào mọi request API

```bash
// src/lib/api.ts - ví dụ thêm token
const api = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });
  // ... handle response
};
```

### 🔄 CORS Configuration
Nginx đã cấu hình sẵn CORS headers cho /frigate/ và /frigate/ws. Nếu backend port 5000 cần hỗ trợ mobile app trực tiếp (không qua proxy), thêm headers sau:
```bash
# Trong backend server config hoặc middleware
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, PATCH, OPTIONS';
add_header Access-Control-Allow-Headers 'Content-Type, Authorization';
```

---

## 📱 Lưu ý cho Mobile App
### 🔹 Network Configuration

| Vấn đề                                      | Giải pháp                                                                 |
|:--------------------------------------------|:--------------------------------------------------------------------------|
| `localhost` trỏ về điện thoại               | Dùng IP LAN (`192.168.x.x`) hoặc domain public                           |
| `host.docker.internal` không có trên mobile | Thay bằng IP thực trong `nginx.conf`                                     |
| WebSocket bị chặn trên 4G/5G                | Đảm bảo port `8083`/`8084` mở, hoặc dùng WSS (SSL)                       |
| CORS error khi gọi API trực tiếp            | Luôn gọi qua Nginx proxy (`/api/`, `/frigate/`) để cùng origin           |

### 🔹 Runtime Config cho Mobile
Sử dụng file src/config.ts để inject config động khi build app:
```bash
// src/config.ts
export const CONFIG = {
  API_BASE: import.meta.env.VITE_API_URL || "/api",
  MQTT_URL: import.meta.env.VITE_MQTT_URL || "ws://192.168.1.100:8083",
  FRIGATE_BASE: import.meta.env.VITE_FRIGATE_URL || "/frigate",
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE === "true",
  APP_MODE: (import.meta.env.VITE_APP_MODE || "web") as "web" | "capacitor" | "react-native",
};
```

Khi build Capacitor/React Native app, truyền biến môi trường:
```bash
# Ví dụ build Capacitor với IP backend cụ thể
VITE_API_URL="https://api.mydomain.com" \
VITE_MQTT_URL="wss://mqtt.mydomain.com:8084" \
npm run build
```

### 🔹 Offline Support (tuỳ chọn)
Nếu app cần hoạt động khi mất mạng:
> 1. Bật DEMO_MODE để hiển thị data cache
> 2. Dùng localStorage lưu trạng thái cảnh báo đã xác nhận
> 3. Queue các lệnh cấu hình để gửi lại khi có mạng

## 🎥 Tích hợp Frigate
### 🔹 Nginx Proxy Configuration
File nginx.conf đã có sẵn 2 location cho Frigate:
```bash
# Frigate REST API + static assets
location /frigate/ {
    proxy_pass http://<FRIGATE_IP>:5000/;
    # ... headers, CORS, buffering off
}

# Frigate WebSocket (camera stream, events)
location ^~ /frigate/ws {
    proxy_pass http://<FRIGATE_IP>:5000/ws;
    # ... WebSocket headers, long timeouts
}
```

### 🔹 Thay <FRIGATE_IP> bằng giá trị thực

| Môi trường                        | Giá trị thay thế                                      |
|:----------------------------------|:------------------------------------------------------|
| Frigate cùng máy Windows/Mac      | `host.docker.internal`                                |
| Frigate máy khác trong LAN        | `192.168.1.50` (IP thực)                              |
| Frigate trong cùng docker-compose | `frigate` (tên service)                               |
| Frigate qua VPN/public            | `https://frigate.mydomain.com` (cần cấu hình SSL riêng) |

### 🔹 Test kết nối Frigate
```bash
# Test API
curl http://localhost:3000/frigate/api/version

# Test WebSocket (dùng wscat: npm install -g wscat)
wscat -c ws://localhost:3000/frigate/ws

# Test từ mobile browser
http://<IP-DOCKER>:3000/frigate/
```

### 🔹 Nhúng Frigate UI vào Radar App
Cách 1: Dùng <iframe> trong component React
```tsx
// Ví dụ trong trang History hoặc Dashboard
<iframe 
  src="/frigate/cameras" 
  className="w-full h-64 rounded-lg border"
  title="Frigate Cameras"
/>
```

Cách 2: Gọi API Frigate qua backend proxy để hiển thị events cùng radar alerts

```bash
// src/lib/frigate.ts
export const frigateApi = {
  getEvents: async (camera?: string, limit = 50) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (camera) params.append("camera", camera);
    return api<any[]>(`/frigate/api/events?${params}`);
  },
};
```

---

## 📡 MQTT Real-time
### 🔹 Broker Requirements
* Hỗ trợ WebSocket (port 8083 cho WS, 8084 cho WSS)
* ACL: Mỗi user chỉ subscribe được topic của thiết bị thuộc quyền
* QoS 1 cho messages quan trọng (fall detection)

### 🔹 Topic Convention
```bash
# Cảm biến publish state
sensors/{deviceId}/state

# Cảm biến publish events
sensors/{deviceId}/events

# Backend gửi lệnh xuống cảm biến
cmd/{deviceId}

# Cảm biến phản hồi lệnh
res/{deviceId}/{correlationId}
```

### 🔹 Payload Example
```bash
// sensors/DEV-001/state
{
  "ts": 1712345678901,
  "presence": true,
  "distance": 2.3,
  "hr": 72,
  "rr": 16,
  "fallState": "none",
  "standStillState": "active",
  "battery": 85,
  "rssi": -67
}

// sensors/DEV-001/events
{
  "ts": 1712345678901,
  "type": "fall_detected",
  "severity": "critical",
  "data": {
    "distance": 0.2,
    "impact": 3.5,
    "duration": 1200
  }
}
```

### 🔹 Frontend Subscription
```bash
// src/hooks/useDeviceRealtime.ts
import { useMqttCache } from "@/store/mqttCache";

export const useDeviceRealtime = (deviceId: string) => {
  return useMqttCache(s => 
    s.getLatest(`^sensors/${deviceId}/(state|events)$`)
  );
};
```

### 🔹 Demo Mode (không cần broker thật)
Bật DEMO_MODE trong src/lib/api.ts + mock MQTT messages:
```bash
// src/lib/mqttClient.ts
if (CONFIG.DEMO_MODE) {
  // Giả lập message mỗi 2s
  setInterval(() => {
    useMqttCache.getState().pushMessage(`sensors/${deviceId}/state`, {
      presence: Math.random() > 0.3,
      distance: +(Math.random() * 5).toFixed(1),
      hr: 60 + Math.floor(Math.random() * 40),
      // ...
    });
  }, 2000);
}
```

---

## 🐳 Docker & Deployment
### 🔹 docker-compose.yml (minimal)
```bash
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: radar-frontend
    ports:
      - "3000:80"
    restart: unless-stopped
    environment:
      - VITE_API_URL=/api
      - VITE_MQTT_URL=ws://host.docker.internal:8083
      - VITE_DEMO_MODE=false
    extra_hosts:
      - "host.docker.internal:host-gateway"  # Cho Linux
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

### 🔹 Deployment Checklist
* Cập nhật nginx.conf: thay <FRIGATE_IP> bằng IP thực
* Cấu hình extra_hosts trong docker-compose nếu chạy trên Linux
* Mở port firewall: 3000 (frontend), 8083 (MQTT WS), 5000 (backend nếu gọi trực tiếp)
* Test CORS từ mobile browser: http://<IP>:3000
* Test WebSocket: kết nối tới ws://<IP>:3000/mqtt/
* Backup nginx.conf + docker-compose.yml trước khi deploy production

### 🔹 HTTPS (tuỳ chọn)
Nếu cần HTTPS cho production:
>1. Dùng reverse proxy riêng (Traefik, Caddy) trước Nginx
>2. Hoặc cấu hình SSL trực tiếp trong nginx.conf:

```bash
server {
    listen 443 ssl http2;
    server_name radar.mydomain.com;
    
    ssl_certificate /certs/fullchain.pem;
    ssl_certificate_key /certs/privkey.pem;
    
    # ... các location như trên
}
```

---

## 🛠️ Troubleshooting
### ❌ Lỗi 502 Bad Gateway khi gọi /api/
```bash
# 1. Kiểm tra backend có chạy không
curl http://host.docker.internal:5000/health

# 2. Kiểm tra nginx logs
docker compose logs frontend | grep "502"

# 3. Test từ trong container
docker exec -it radar-frontend wget -qO- http://host.docker.internal:5000/api/sensors
```

### ❌ WebSocket không kết nối được
```bash
# 1. Kiểm tra port MQTT broker
telnet host.docker.internal 8083

# 2. Test WS trực tiếp
wscat -c ws://localhost:3000/mqtt/

# 3. Xem browser console: lỗi CORS hoặc mixed content (HTTP→WS trên HTTPS)
```

### ❌ Mobile app bị CORS error
* Đảm bảo gọi API qua /api/ (proxy qua Nginx), không gọi trực tiếp http://IP:5000
* Kiểm tra nginx.conf có Access-Control-Allow-Origin * cho route cần thiết
* Trên mobile, dùng http:// thay vì https:// nếu chưa cấu hình SSL

### ❌ Frigate stream không load trên mobile
* Kiểm tra location /frigate/ws có đủ WebSocket headers
* Đảm bảo proxy_buffering off để stream real-time
* Test trên WiFi trước, một số mạng di động chặn WebSocket port không chuẩn

### ❌ Build Docker fail
```bash
# 1. Xóa cache build
docker builder prune -f

# 2. Build lại với verbose log
docker compose build --no-cache --progress=plain

# 3. Kiểm tra Dockerfile có copy đúng file
docker run --rm -it radar-frontend ls -la /usr/share/nginx/html
```

---

## ✅ Checklist triển khai
### 🔹 Giai đoạn Development
* npm run dev chạy ổn, không lỗi console
* DEMO_MODE = true hiển thị mock data đầy đủ
* Responsive test: desktop/tablet/mobile (F12 → Device Toolbar)
* MQTT mock hoặc broker test kết nối thành công

### 🔹 Giai đoạn Staging
* Cập nhật nginx.conf với IP backend/Frigate staging
* docker compose up -d --build thành công
* Test API thật: curl http://staging-ip:3000/api/sensors
* Test WebSocket: kết nối từ browser staging
* Test từ mobile trong cùng LAN

### 🔹 Giai đoạn Production
* Bật HTTPS (reverse proxy hoặc cấu hình SSL)
* Tắt DEMO_MODE, bật logging/monitoring
* Cấu hình domain + DNS trỏ về server
* Backup config files + database (nếu có)
* Setup CI/CD (GitHub Actions, GitLab CI) để auto-deploy

### 🔹 Giai đoạn Mobile App
* Build frontend với VITE_APP_MODE=capacitor hoặc react-native
* Inject config runtime (IP backend, MQTT URL) qua build env hoặc remote config
* Test offline mode (nếu yêu cầu)
* Submit store (App Store/Google Play) với screenshots + privacy policy

---

## 📞 Hỗ trợ & Đóng góp
* Bug report: Tạo issue với log lỗi + steps to reproduce
* Feature request: Mô tả use case + priority
* Pull request: Đảm bảo test qua npm run build + mobile responsive
>💡 Mẹo nhanh: Khi tích hợp backend mới, chỉ cần sửa src/lib/api.ts + nginx.conf, không cần chạm vào UI components.

Document version: 1.0.0 • Last updated: 2026
© 2026 RadarMonitor Team • MIT License
