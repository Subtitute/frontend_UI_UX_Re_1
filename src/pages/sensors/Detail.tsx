import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { sensorsApi } from "@/lib/api";
import { useMqttCache } from "@/store/mqttCache";
import { RefreshCw, AlertOctagon } from "lucide-react";

export default function SensorDetail() {
  const { id } = useParams<{ id: string }>()!;
  if (!id) return <div className="p-8 text-center text-red-500">ID thiết bị không hợp lệ</div>;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"info" | "realtime" | "config">("info");
  
  const { data, isLoading } = useQuery({ 
    queryKey: ["sensor", id], 
    queryFn: () => sensorsApi.get(id) 
  });
  
  const realtime = useMqttCache(s => s.getLatest(`sensors/${id}/state`));

  const cmdMutation = useMutation({
    mutationFn: (cmd: string) => sensorsApi.sendCommand(id, cmd),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sensor", id] }),
  });

  if (isLoading) return <div className="p-8 text-center">Đang tải...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Không tìm thấy thiết bị</div>;

  const metrics = realtime?.payload || data.metrics || {};

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold">{data.name}</h1>
          <p className="text-gray-500 text-sm">{data.deviceId} • {data.site}/{data.room}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => cmdMutation.mutate("alive")} 
            className="flex-1 sm:flex-none px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center justify-center gap-1"
          >
            <RefreshCw size={14} /> Alive
          </button>
          <button 
            onClick={() => cmdMutation.mutate("reset")} 
            className="flex-1 sm:flex-none px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm flex items-center justify-center gap-1"
          >
            <AlertOctagon size={14} /> Reset
          </button>
        </div>
      </div>

      <div className="border-b overflow-x-auto">
        <div className="flex gap-2 sm:gap-4 min-w-max">
          {(["info", "realtime", "config"] as const).map(t => (
            <button 
              key={t} 
              onClick={() => setTab(t)} 
              className={`pb-2 px-1 font-medium text-sm sm:text-base whitespace-nowrap
                ${tab === t ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
            >
              {t === "info" ? "Thông tin" : t === "realtime" ? "Real-time" : "Cấu hình"}
            </button>
          ))}
        </div>
      </div>

      {tab === "info" && (
        <div className="bg-white p-4 sm:p-6 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><span className="text-gray-500 text-sm">Model:</span> <p className="font-medium">{data.model}</p></div>
          <div><span className="text-gray-500 text-sm">Firmware:</span> <p className="font-medium">{data.firmware}</p></div>
          <div><span className="text-gray-500 text-sm">MQTT Topic:</span> <p className="font-medium text-xs break-all">{data.topic}</p></div>
          <div><span className="text-gray-500 text-sm">Vị trí lắp đặt:</span> <p className="font-medium">{data.installLocation}</p></div>
        </div>
      )}

      {tab === "realtime" && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Presence", val: metrics.presence ? "Yes" : "No", color: metrics.presence ? "text-green-600" : "text-red-600" },
            { label: "Distance", val: `${metrics.distance || 0}m` },
            { label: "Heart Rate", val: `${metrics.hr || "--"} bpm` },
            { label: "Breathing", val: `${metrics.rr || "--"} rpm` },
            { label: "Fall State", val: metrics.fallState || "None" },
            { label: "StandStill", val: metrics.standStillState || "Active" },
          ].map(m => (
            <div key={m.label} className="bg-white p-4 rounded-xl border text-center">
              <div className="text-xs text-gray-500 mb-1">{m.label}</div>
              <div className={`text-lg sm:text-xl font-bold ${m.color || ""}`}>{m.val}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "config" && (
        <form className="bg-white p-4 sm:p-6 rounded-xl border space-y-4">
          <h3 className="font-semibold text-base sm:text-lg">Tham số Fall Detection</h3>
          {[
            { k: "angleZ", l: "Góc Z (°)" },
            { k: "height", l: "Chiều cao (cm)" },
            { k: "duration", l: "Thời gian phát hiện (ms)" },
          ].map(f => (
            <div key={f.k} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-medium w-full sm:w-32">{f.l}</label>
              <input 
                type="number" 
                className="border rounded-lg px-3 py-2 w-full sm:w-32 text-sm" 
                defaultValue={data.config?.[f.k] || 0} 
              />
            </div>
          ))}
          <button type="button" className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Lưu cấu hình
          </button>
        </form>
      )}
    </div>
  );
}