import React, { useState } from "react";
import { Star, Activity, Gift, RefreshCw } from "lucide-react";

export default function GamificationPanel({ gameState, onAward, onReset }: any) {
  const [busy, setBusy] = useState(false);

  const xp = (gameState && gameState.xp) || 0;
  const streak = (gameState && gameState.streak) || 0;
  const badges: string[] = (gameState && gameState.badges) || [];
  const hasRealProgress = Boolean((gameState && (gameState.xp > 0 || gameState.streak > 0 || gameState.lastActive)) || false);
  const level = Math.max(1, Math.floor(xp / 100) + 1);
  const progress = Math.min(100, Math.floor((xp % 100)));

  const claimMiniTask = () => {
    if (busy || !hasRealProgress) return;
    setBusy(true);
    setTimeout(() => {
      onAward?.(5, "Completed mini task");
      setBusy(false);
    }, 600);
  };

  const spinBonus = () => {
    if (busy || !hasRealProgress) return;
    setBusy(true);
    setTimeout(() => {
      const bonus = Math.floor(Math.random() * 26); // 0-25
      onAward?.(bonus, `Spin bonus ${bonus}`);
      setBusy(false);
    }, 900);
  };

  const reset = () => {
    if (!confirm("Reset gamification progress?")) return;
    onReset && onReset();
  };

  return (
    <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" /> Study Play & Streaks
        </h4>
        <div className="text-xs text-slate-400 font-mono">Level {level}</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-white/5">
          <div className="text-center">
            <div className="text-sm font-bold text-white">{streak}✦</div>
            <div className="text-[10px] text-slate-400">streak</div>
          </div>
        </div>

        <div className="flex-1">
          <div className="text-[10px] text-slate-400 uppercase font-mono">XP Progress</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs font-mono text-slate-300 mt-1">{xp} XP • {progress}% to next level</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={claimMiniTask}
          disabled={!hasRealProgress || busy}
          className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
        >
          {busy ? "Working..." : hasRealProgress ? "Claim Mini Task +5 XP" : "Complete something first"}
        </button>
        <button
          onClick={spinBonus}
          disabled={!hasRealProgress || busy}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
        >
          {hasRealProgress ? "Spin" : "Locked"}
        </button>
      </div>

      <div className="pt-2 space-y-2">
        <div className="text-[10px] text-slate-400 uppercase font-mono">Badges</div>
        <div className="flex flex-wrap gap-2">
          {badges.length === 0 ? (
            <div className="text-[11px] text-slate-500">No badges yet — keep going!</div>
          ) : (
            badges.map((b, i) => (
              <div key={i} className="px-2 py-0.5 bg-slate-950 rounded-full text-[10px] text-amber-300 border border-amber-400/10 font-mono">
                <Gift className="w-3 h-3 inline-block mr-1 align-middle" />{b}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <div className="text-[10px] text-slate-400">Playful reminders + human-in-loop nudges</div>
        <button onClick={reset} className="text-xs text-slate-400 hover:text-white flex items-center gap-1"><RefreshCw className="w-3 h-3" />Reset</button>
      </div>
    </div>
  );
}
