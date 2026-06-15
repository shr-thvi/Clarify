import React, { useEffect, useState } from "react";

export default function AnalyticsPanel() {
  const [events, setEvents] = useState<any[]>([]);
  const [source, setSource] = useState('local');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch('/api/analytics?limit=50');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.events) && data.events.length > 0) {
            setEvents(data.events);
            setSource('server');
            return;
          }
        }
      } catch (e) {
        console.warn('Server analytics fetch failed', e);
      }

      try {
        const raw = localStorage.getItem('clarify_analytics_events') || '[]';
        const parsed = JSON.parse(raw);
        setEvents(parsed.slice(0, 200));
      } catch (e) {
        setEvents([]);
      }
    };

    loadEvents();
  }, []);

  const counts = events.reduce((acc, ev) => {
    const type = typeof ev?.type === 'string' ? ev.type : 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-white">Analytics</div>
        <div className="text-xs text-slate-400">{source === 'server' ? 'Server events' : 'Local events'}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
        {Object.keys(counts).length === 0 ? (
          <div className="col-span-2 text-slate-500">No events yet</div>
        ) : (
          Object.entries(counts).map(([k, v]) => (
            <div key={k} className="p-2 bg-slate-950 rounded">{k}: <span className="font-mono">{v as number}</span></div>
          ))
        )}
      </div>

      <div className="pt-2">
        <details className="text-xs text-slate-400">
          <summary className="cursor-pointer">Recent events</summary>
          <div className="max-h-40 overflow-auto mt-2 space-y-2">
            {events.map((e, i) => (
              <div key={i} className="text-[12px] bg-slate-950 p-2 rounded">{new Date(e.timestamp).toLocaleString()} — {e.type} {e.format ? `(${e.format})` : ''}</div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
