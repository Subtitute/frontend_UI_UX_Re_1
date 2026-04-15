import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { sensorsApi } from "@/lib/api";
import { Search, ArrowUpDown, Wifi, WifiOff } from "lucide-react";

export default function SensorsList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ site: "", type: "", status: "", search: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["sensors", filters],
    queryFn: () => sensorsApi.list(filters as any),
    refetchInterval: 30000,
  });

  // Desktop Table View
  const DesktopTable = () => (
    <div className="hidden sm:block bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Tên", "Loại", "Site/Phòng", "Trạng thái", "Last Seen"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8">Đang tải...</td></tr>
            ) : (data || []).map(s => (
              <tr key={s.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/sensors/${s.id}`)}>
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.type}</td>
                <td className="px-4 py-3">{s.site} / {s.room}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 w-fit
                    ${s.status === "online" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {s.status === "online" ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{s.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Mobile Card View
  const MobileCards = () => (
    <div className="sm:hidden space-y-3">
      {isLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (data || []).map(s => (
        <div 
          key={s.id} 
          onClick={() => navigate(`/sensors/${s.id}`)}
          className="bg-white p-4 rounded-xl border shadow-sm active:scale-95 transition-transform"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-base">{s.name}</h3>
              <p className="text-sm text-gray-500">{s.type} • {s.deviceId}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs flex items-center gap-1
              ${s.status === "online" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {s.status === "online" ? <Wifi size={12} /> : <WifiOff size={12} />}
              {s.status}
            </span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>📍 Vị trí:</span>
              <span className="font-medium">{s.site} / {s.room}</span>
            </div>
            <div className="flex justify-between">
              <span>🕐 Cập nhật:</span>
              <span className="text-gray-500">{s.lastSeen}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filter Bar - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            placeholder="Tìm theo tên, MAC, phòng..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {["site", "type", "status"].map(k => (
            <select
              key={k}
              className="border rounded-lg px-3 py-2 bg-white text-sm capitalize min-w-[120px]"
              value={filters[k as keyof typeof filters]}
              onChange={e => setFilters(f => ({ ...f, [k]: e.target.value }))}
            >
              <option value="">{k}</option>
              <option value="a">A</option>
              <option value="b">B</option>
            </select>
          ))}
        </div>
      </div>

      {/* Content */}
      <DesktopTable />
      <MobileCards />
    </div>
  );
}