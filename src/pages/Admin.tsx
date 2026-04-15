import { useState } from "react";
import { Shield, Users, Settings2 } from "lucide-react";

export default function Admin() {
  const [tab, setTab] = useState<"users" | "thresholds" | "logs">("users");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quản trị hệ thống</h1>
      <div className="flex gap-4 border-b">
        {[{ k: "users", l: "Người dùng", i: Users }, { k: "thresholds", l: "Ngưỡng cảnh báo", i: Settings2 }, { k: "logs", l: "Nhật ký", i: Shield }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)} className={`flex items-center gap-2 pb-2 px-1 font-medium ${tab === t.k ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}>
            <t.i size={16} /> {t.l}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="bg-white p-4 rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50"><tr><th className="p-3 text-left">Tên</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Vai trò</th></tr></thead>
            <tbody>
              {[{ name: "Admin", email: "admin@iot.vn", role: "admin" }, { name: "Operator", email: "op@iot.vn", role: "operator" }].map(u => (
                <tr key={u.email} className="border-b"><td className="p-3">{u.name}</td><td className="p-3">{u.email}</td><td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{u.role}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "thresholds" && (
        <div className="bg-white p-4 rounded-xl border space-y-3 max-w-lg">
          {[
            { l: "Offline Timeout (s)", v: 120 },
            { l: "Stale Data Timeout (s)", v: 300 },
            { l: "Ngưỡng HR cao (bpm)", v: 120 },
          ].map(t => (
            <div key={t.l} className="flex justify-between items-center">
              <span className="text-sm">{t.l}</span>
              <input type="number" defaultValue={t.v} className="border rounded px-2 py-1 w-20 text-center" />
            </div>
          ))}
          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm w-full">Lưu ngưỡng</button>
        </div>
      )}
      {tab === "logs" && <div className="bg-white p-4 rounded-xl border text-sm text-gray-500">Nhật ký thao tác sẽ hiển thị tại đây (API: /admin/audit-logs)</div>}
    </div>
  );
}