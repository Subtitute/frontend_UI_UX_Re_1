import { useState } from "react";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ deviceId: "", wifi: "", mqttUrl: "", name: "", site: "" });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Thêm thiết bị mới</h1>
      <div className="flex justify-between mb-6">
        {["Quét/ID", "Kết nối", "Gán vị trí", "Kiểm tra"].map((s, i) => (
          <div key={s} className={`flex-1 text-center ${i + 1 <= step ? "text-blue-600 font-medium" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center border ${i + 1 <= step ? "border-blue-600 bg-blue-50" : "border-gray-300"}`}>
              {i + 1 < step ? <Check size={16} /> : i + 1}
            </div>
            <span className="text-xs">{s}</span>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        {step === 1 && <input placeholder="Device ID / MAC" className="w-full border rounded p-2" value={form.deviceId} onChange={e => setForm({...form, deviceId: e.target.value})} />}
        {step === 2 && <>
          <input placeholder="Wi-Fi SSID" className="w-full border rounded p-2 mb-2" />
          <input placeholder="MQTT WS URL" className="w-full border rounded p-2" value={form.mqttUrl} onChange={e => setForm({...form, mqttUrl: e.target.value})} />
        </>}
        {step === 3 && <>
          <input placeholder="Tên hiển thị" className="w-full border rounded p-2 mb-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="Site / Khu vực" className="w-full border rounded p-2" value={form.site} onChange={e => setForm({...form, site: e.target.value})} />
        </>}
        {step === 4 && <div className="p-4 bg-green-50 rounded text-green-700 text-center">✅ Thiết bị đã kết nối & sẵn sàng hoạt động</div>}
      </div>

      <div className="flex justify-between">
        <button disabled={step === 1} onClick={() => setStep(s => s - 1)} className="px-4 py-2 border rounded flex items-center gap-1 disabled:opacity-50"><ArrowLeft size={16} /> Trước</button>
        <button onClick={() => setStep(s => Math.min(s + 1, 4))} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-1">
          {step === 4 ? "Hoàn tất" : "Tiếp"} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}