import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "../lib/api";
import { useMqttCache } from "../store/mqttCache";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";

export default function Alerts() {
  const [filters, setFilters] = useState({ status: "new", type: "" });
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const { data = [] } = useQuery({
    queryKey: ["alerts", filters],
    queryFn: () => alertsApi.list(filters as any),
    refetchInterval: 15000,
  });

  const ackMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => alertsApi.acknowledge(id, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    new: { label: "Mới", color: "bg-blue-100 text-blue-700" },
    acknowledged: { label: "Đã xác nhận", color: "bg-yellow-100 text-yellow-700" },
    processing: { label: "Đang xử lý", color: "bg-orange-100 text-orange-700" },
    closed: { label: "Đã đóng", color: "bg-green-100 text-green-700" },
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select className="border rounded px-3 py-2" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">Tất cả trạng thái</option>
          {Object.keys(statusMap).map(s => <option key={s} value={s}>{statusMap[s].label}</option>)}
        </select>
        <input placeholder="Loại cảnh báo..." className="border rounded px-3 py-2" onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} />
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["Thời gian", "Thiết bị", "Loại", "Mức độ", "Trạng thái", "Hành động"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(a => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(a.ts).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{a.deviceId}</td>
                <td className="px-4 py-3">{a.type}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${a.severity === "high" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                    {a.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${statusMap[a.status]?.color}`}>{statusMap[a.status]?.label}</span>
                </td>
                <td className="px-4 py-3">
                  {a.status === "new" && (
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(a.id)} className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                        <CheckCircle size={14} /> Xác nhận
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h3 className="font-semibold">Xác nhận cảnh báo</h3>
            <textarea
              className="w-full border rounded p-2 h-20 text-sm"
              placeholder="Ghi chú xử lý..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelected(null)} className="px-3 py-1.5 border rounded text-sm">Hủy</button>
              <button
                onClick={() => ackMutation.mutate({ id: selected, note })}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}