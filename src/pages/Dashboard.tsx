import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { sensorsApi, alertsApi } from "@/lib/api";
import { useMqttCache } from "@/store/mqttCache";

// Định nghĩa type tạm để TS không báo unknown
interface Sensor { id: string; name: string; status: string; [key: string]: any }
interface Alert { id: string; type: string; status: string; ts: string | number; deviceId: string }

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) => (
  <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}><Icon size={20} className="text-white" /></div>
    <div>
      <div className="text-xs text-gray-500 sm:text-sm">{title}</div>
      <div className="text-xl sm:text-2xl font-bold">{value}</div>
    </div>
  </div>
);

export default function Dashboard() {
  // Bọc API call trong arrow function để khớp signature của React Query v5
  const { data: sensors = [] } = useQuery<Sensor[]>({ 
    queryKey: ["sensors"], 
    queryFn: () => sensorsApi.list({}) 
  });
  
  const { data: alerts = [] } = useQuery<Alert[]>({ 
    queryKey: ["alerts"], 
    queryFn: () => alertsApi.list({}) 
  });
  
  const isConnected = useMqttCache((s) => s.isConnected);

  const online = sensors.filter(s => s.status === "online").length;
  const offline = sensors.filter(s => s.status === "offline").length;
  const openAlerts = alerts.filter(a => a.status === "new" || a.status === "acknowledged").length;

  const chartData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`, events: Math.floor(Math.random() * 15)
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">Tổng quan hệ thống</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          MQTT {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Tổng cảm biến" value={sensors.length} icon={Activity} color="bg-blue-500" />
        <StatCard title="Online" value={online} icon={Wifi} color="bg-green-500" />
        <StatCard title="Offline" value={offline} icon={WifiOff} color="bg-red-500" />
        <StatCard title="Cảnh báo mở" value={openAlerts} icon={AlertTriangle} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white p-3 sm:p-4 rounded-xl border shadow-sm">
          <h2 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Sự kiện theo giờ (24h)</h2>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip contentStyle={{fontSize: 12}} />
                <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-4 rounded-xl border shadow-sm">
          <h2 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Sự kiện mới nhất</h2>
          <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-auto">
            {alerts.slice(0, 5).map(a => (
              <div key={a.id} className="p-2 sm:p-3 bg-gray-50 rounded-lg text-xs sm:text-sm flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="font-medium">{a.type}</span>
                <span className="text-gray-500 text-xs">{new Date(a.ts).toLocaleTimeString()}</span>
              </div>
            ))}
            {alerts.length === 0 && <p className="text-gray-400 text-center py-4 text-sm">Không có sự kiện</p>}
          </div>
        </div>
      </div>
    </div>
  );
}