import React from "react";
import { SavedDoubt } from "../types";
import { 
  BarChart, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Award, 
  Layers, 
  Globe2 
} from "lucide-react";

interface StatsDashboardProps {
  savedDoubts: SavedDoubt[];
  onSelectDoubt: (doubt: SavedDoubt) => void;
}

export default function StatsDashboard({ savedDoubts, onSelectDoubt }: StatsDashboardProps) {
  if (savedDoubts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-white/5 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 animate-bounce">
          <BarChart className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Performance Session Data</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Rewrite a few doubts using the workspace to unlock continuous metrics, subject summaries, and query strength ratios.
        </p>
      </div>
    );
  }

  // Calculate stats
  const total = savedDoubts.length;
  const starred = savedDoubts.filter((d) => d.starred).length;
  const multilingual = savedDoubts.filter((d) => d.result.isMultilingual).length;
  
  // Average Doubt Quality
  const avgInitialQuality = Math.round(
    savedDoubts.reduce((acc, curr) => acc + curr.result.doubtQualityScore, 0) / total
  );

  // Subject counters
  const subjects: { [key: string]: number } = {};
  savedDoubts.forEach((d) => {
    const s = d.result.subject || "General";
    subjects[s] = (subjects[s] || 0) + 1;
  });

  const sortedSubjects = Object.entries(subjects)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);

  // High score
  const highestClarityImprovement = 100 - avgInitialQuality;

  return (
    <div className="space-y-6">
      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Doubts Rephrased</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white">{total}</span>
            <span className="text-xs text-slate-400">queries</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Average Quality Growth</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white">+{highestClarityImprovement}%</span>
            <span className="text-xs text-slate-400">to 100% Academic Grade</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Original Clarity Average</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white">{avgInitialQuality}%</span>
            <span className="text-xs text-slate-400">needs enhancement</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 hover:border-rose-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Multilingual / Hinglish</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-mono text-white">{multilingual}</span>
            <span className="text-xs text-slate-400">detected & translated</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject analytics (Custom SVGs for visual excitement!) */}
        <div className="lg:col-span-5 bg-slate-900/60 p-6 rounded-2xl border border-white/5 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Subject Matter Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-1">Automatic classification ratios of submitted doubts.</p>
          </div>

          <div className="space-y-4">
            {sortedSubjects.map((sub, idx) => (
              <div key={sub.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block" 
                      style={{
                        backgroundColor: `hsl(${idx * 70 + 200}, 80%, 65%)`
                      }}
                    />
                    {sub.name}
                  </span>
                  <span className="font-mono text-slate-400">{sub.count} {sub.count === 1 ? 'doubt' : 'doubts'} ({sub.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${sub.pct}%`,
                      backgroundColor: `hsl(${idx * 70 + 200}, 80%, 65%)`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Simple Donut SVG preview layout for extra design points */}
          <div className="relative pt-2 flex justify-center">
            <svg width="120" height="120" viewBox="0 0 36 36" className="w-28 h-28 transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e293b" strokeWidth="3" />
              {sortedSubjects.reduce((acc: { cumOffset: number; elements: React.ReactNode[] }, sub, idx) => {
                const strokeValue = (sub.count / total) * 100;
                const strokeDashArray = `${strokeValue} ${100 - strokeValue}`;
                const strokeDashOffset = 100 - acc.cumOffset;
                
                acc.elements.push(
                  <circle
                    key={sub.name}
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke={`hsl(${idx * 70 + 200}, 80%, 65%)`}
                    strokeWidth="3.2"
                    strokeDasharray={strokeDashArray}
                    strokeDashoffset={strokeDashOffset}
                  />
                );
                
                return {
                  cumOffset: acc.cumOffset + strokeValue,
                  elements: acc.elements
                };
              }, { cumOffset: 0, elements: [] }).elements}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="text-xl font-bold font-mono text-white">{Object.keys(subjects).length}</span>
              <span className="text-[10px] uppercase text-slate-400 tracking-wider">Subjects</span>
            </div>
          </div>
        </div>

        {/* Timeline / Recent list */}
        <div className="lg:col-span-7 bg-slate-900/60 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Recent Academic Timeline
            </h3>
            <p className="text-xs text-slate-400 mt-1">Quick-access historic rewrites.</p>
          </div>

          <div className="space-y-3 mt-4 overflow-y-auto max-h-[280px] pr-1">
            {savedDoubts.slice(0, 5).map((doubt) => (
              <div 
                key={doubt.id}
                onClick={() => onSelectDoubt(doubt)}
                className="p-3 bg-slate-800/40 rounded-xl hover:bg-slate-800/80 transition-all border border-white/5 hover:border-slate-700/50 cursor-pointer flex items-center justify-between"
              >
                <div className="min-w-0 pr-3 space-y-1">
                  <p className="text-xs text-slate-200 font-medium truncate">
                    {doubt.result.rewrittenDoubt}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span className="font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-[9px]">
                      {doubt.result.subject}
                    </span>
                    <span>Q-Score: {doubt.result.doubtQualityScore}%</span>
                  </p>
                </div>
                <div className="text-[10px] text-right text-slate-500 shrink-0 font-mono">
                  {new Date(doubt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 text-center pt-4 border-t border-white/5 mt-4">
            Protip: Click any recent entry above to instantly parse its full step-by-step summary and followups.
          </p>
        </div>
      </div>
    </div>
  );
}
