import React from "react";
import { X, Trash2 } from "lucide-react";

export default function ReviewRequestsModal({ open, onClose }: any) {
  const raw = localStorage.getItem("clarify_review_requests") || "[]";
  let list = [] as any[];
  try { list = JSON.parse(raw); } catch { list = []; }

  const clearAll = () => {
    if (!confirm("Clear all review requests?")) return;
    localStorage.removeItem("clarify_review_requests");
    window.location.reload();
  };

  const deleteOne = (id: string) => {
    const filtered = list.filter(r => r.id !== id);
    localStorage.setItem("clarify_review_requests", JSON.stringify(filtered));
    window.location.reload();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl bg-slate-900/80 rounded-2xl border border-white/5 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Human Review Requests</h3>
          <div className="flex items-center gap-2">
            <button onClick={clearAll} className="text-xs text-rose-400">Clear All</button>
            <button onClick={onClose} className="text-slate-400"><X className="w-5 h-5"/></button>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="text-sm text-slate-400">No review requests yet.</div>
        ) : (
          <div className="space-y-3">
            {list.map((r: any) => (
              <div key={r.id} className="p-3 bg-slate-950 rounded-md border border-white/5 flex justify-between items-start">
                <div>
                  <div className="text-xs text-slate-400">{new Date(r.timestamp).toLocaleString()}</div>
                  <div className="font-semibold text-white mt-1">{r.doubt}</div>
                  <div className="text-[12px] text-slate-400 mt-1">{r.note}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => deleteOne(r.id)} className="text-xs text-rose-400 flex items-center gap-1"><Trash2 className="w-4 h-4"/>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
