import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Calendar } from "lucide-react";

export default function History() {
  const [range, setRange] = useState("24h");
  // Thay bằng useQuery gọi API time-series
  const data = Array.from({ length: 24 }, (_, i) => ({ t: `${i}h`, hr: 60 + Math.random()*20, rr: 14 + Math.random()*4 }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lịch sử & Báo cáo</h1>
        <div className="flex gap-2">
          {["24h", "7d", "30d"].map(r => (
            <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded text-sm ${range === r ? "bg-blue-600 text-white" : "bg-gray-100"}`}>{r}</button>
          ))}
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl border shadow-sm h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Area yAxisId="left" type="monotone" dataKey="hr" stroke="#3b82f6" fill="#3b82f622" name="Nhịp tim" />
            <Area yAxisId="right" type="monotone" dataKey="rr" stroke="#10b981" fill="#10b98122" name="Nhịp thở" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}