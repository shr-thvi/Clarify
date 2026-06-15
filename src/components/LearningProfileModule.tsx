import React, { useState } from "react";
import {
  Brain,
  TrendingUp,
  Clock,
  Target,
  Award,
  BarChart3,
  Lightbulb,
  Zap,
  Heart,
  Activity,
  CheckCircle2,
  AlertCircle,
  Flame,
  Wind,
  BookOpen,
} from "lucide-react";
import { User as UserType } from "../types";

interface LearningMetrics {
  topicsLearned: string[];
  totalDoubts: number;
  correctRewriteCount: number;
  averageConfidence: number;
  learningStyle: "visual" | "auditory" | "kinesthetic" | "reading-writing";
  optimalLearningTime: string;
  retentionRate: number;
  cognitiveLoadLevel: "low" | "medium" | "high";
  lastActivityTime: string;
  streakDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
  motivationScore: number;
  focusRating: number;
}

interface LearningProfileModuleProps {
  user: UserType | null;
  onClose: () => void;
}

export default function LearningProfileModule({
  user,
  onClose,
}: LearningProfileModuleProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "psychology" | "recommendations">("overview");

  const [metrics, setMetrics] = useState<LearningMetrics>({
    topicsLearned: ["Calculus", "Physics", "Chemistry", "Biology", "Algebra"],
    totalDoubts: 42,
    correctRewriteCount: 38,
    averageConfidence: 78,
    learningStyle: "visual",
    optimalLearningTime: "14:00 - 16:00",
    retentionRate: 85,
    cognitiveLoadLevel: "medium",
    lastActivityTime: "2 hours ago",
    streakDays: 7,
    weeklyGoal: 10,
    weeklyProgress: 8,
    motivationScore: 82,
    focusRating: 79,
  });

  const learningStyleDescriptions = {
    visual: "You learn best through diagrams, charts, and visual representations. Include infographics in your study.",
    auditory: "You learn best through listening and verbal explanations. Try listening to educational podcasts.",
    kinesthetic: "You learn best through hands-on practice and interactive activities. Use simulations and experiments.",
    "reading-writing": "You learn best through reading and writing detailed notes. Create comprehensive study guides.",
  };

  const cognitiveLoadExplanations = {
    low: "✅ You have capacity for more learning. Consider tackling harder topics.",
    medium: "⚖️ Perfect balance! Your current pace is optimal for retention.",
    high: "⚠️ Your load is high. Take breaks and consolidate what you've learned.",
  };

  const StatCard = ({ icon: Icon, label, value, unit, color, trend }: any) => (
    <div className={`relative group bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/50 rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:border-${color}-500/50 hover:shadow-lg hover:shadow-${color}-500/10 hover:-translate-y-1`}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-${color}-500/20 border border-${color}-500/30 transition-transform duration-300 group-hover:scale-110`}>
            <Icon className={`w-5 h-5 text-${color}-400`} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className={`w-3 h-3 text-${trend > 0 ? 'emerald' : 'rose'}-400`} />
              <span className={`text-${trend > 0 ? 'emerald' : 'rose'}-400 font-semibold`}>{trend}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <p className={`text-3xl font-bold text-${color}-400`}>
            {value}{unit}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center z-50 p-4 backdrop-blur-xl">
      <style>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        .modal-card { animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .tab-button {
          transition: all 0.3s ease;
          position: relative;
        }
        .tab-button.active {
          color: #6366f1;
        }
        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
          border-radius: 2px;
        }
      `}
      </style>

      <div className="modal-card bg-slate-950 border border-slate-700/50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full -ml-40 -mb-40 blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative z-20 p-8 border-b border-slate-700/30 bg-gradient-to-r from-slate-900/80 via-indigo-900/30 to-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400/30 to-violet-600/30 flex items-center justify-center border border-indigo-400/60 shadow-lg shadow-indigo-500/20 group">
                <Brain className="w-8 h-8 text-indigo-400 group-hover:rotate-12 transition-transform" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Learning Analytics</h2>
                <p className="text-sm text-slate-400 mt-1">🧠 AI-Powered Psychology-Based Learning Profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-slate-800/50 rounded-xl text-slate-400 hover:text-slate-200 transition-all border border-slate-700/30 hover:border-slate-600/50 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="relative z-10 flex border-b border-slate-700/30 px-8 bg-slate-900/50 backdrop-blur-sm">
          {["overview", "psychology", "recommendations"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`tab-button px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "text-indigo-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "overview" && "📊 Overview"}
              {tab === "psychology" && "🧠 Psychology"}
              {tab === "recommendations" && "🎯 Recommendations"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-8">
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1 h-7 bg-gradient-to-b from-indigo-400 to-violet-600 rounded-full"></span>
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard icon={Flame} label="Day Streak" value={metrics.streakDays} unit=" 🔥" color="amber" trend={25} />
                  <StatCard icon={TrendingUp} label="Retention Rate" value={metrics.retentionRate} unit="%" color="emerald" trend={12} />
                  <StatCard icon={Zap} label="Confidence" value={metrics.averageConfidence} unit="%" color="yellow" trend={8} />
                  <StatCard icon={Target} label="Weekly Goal" value={`${metrics.weeklyProgress}/${metrics.weeklyGoal}`} unit="" color="indigo" trend={5} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Learning Summary */}
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-pink-400" />
                    Learning Summary
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-300">Total Doubts Processed</span>
                        <span className="font-bold text-pink-400">{metrics.totalDoubts}</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className="h-full w-2/3 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-300">Successfully Rewritten</span>
                        <span className="font-bold text-emerald-400">{metrics.correctRewriteCount}</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className="h-full w-5/6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{width: `${(metrics.correctRewriteCount/metrics.totalDoubts)*100}%`}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-300">Success Rate</span>
                        <span className="font-bold text-cyan-400">{Math.round((metrics.correctRewriteCount/metrics.totalDoubts)*100)}%</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{width: `${(metrics.correctRewriteCount/metrics.totalDoubts)*100}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Topics Mastered */}
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Topics Mastered
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {metrics.topicsLearned.map((topic, idx) => (
                      <span
                        key={topic}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/50 rounded-full text-sm text-emerald-300 font-semibold hover:border-emerald-400 transition-all cursor-pointer"
                      >
                        ✓ {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "psychology" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Learning Style */}
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white">Your Learning Style</h4>
                  </div>
                  <p className="gradient-text text-2xl font-bold capitalize mb-3">
                    {metrics.learningStyle.replace("-", " ")} Learner
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed mb-5">
                    {learningStyleDescriptions[metrics.learningStyle]}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 hover:from-yellow-500/50 hover:to-amber-500/50 border border-yellow-400/50 rounded-lg text-yellow-300 transition-all font-semibold text-sm">
                      Retake Quiz
                    </button>
                    <button className="flex-1 px-4 py-2 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 rounded-lg text-slate-300 transition-all text-sm">
                      Study Tips
                    </button>
                  </div>
                </div>

                {/* Cognitive Load */}
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`p-3 rounded-xl ${
                      metrics.cognitiveLoadLevel === "low" ? "bg-emerald-500/20 border border-emerald-500/30" :
                      metrics.cognitiveLoadLevel === "medium" ? "bg-yellow-500/20 border border-yellow-500/30" :
                      "bg-rose-500/20 border border-rose-500/30"
                    }`}>
                      <Brain className={`w-5 h-5 ${
                        metrics.cognitiveLoadLevel === "low" ? "text-emerald-400" :
                        metrics.cognitiveLoadLevel === "medium" ? "text-yellow-400" :
                        "text-rose-400"
                      }`} />
                    </div>
                    <h4 className="text-lg font-bold text-white">Cognitive Load</h4>
                  </div>
                  <p className={`text-2xl font-bold capitalize mb-4 ${
                    metrics.cognitiveLoadLevel === "low" ? "text-emerald-400" :
                    metrics.cognitiveLoadLevel === "medium" ? "text-yellow-400" :
                    "text-rose-400"
                  }`}>
                    {metrics.cognitiveLoadLevel} Load
                  </p>
                  <div className="w-full bg-slate-700/30 rounded-full h-3 mb-4">
                    <div className={`h-full rounded-full ${
                      metrics.cognitiveLoadLevel === "low" ? "w-1/3 bg-emerald-500" :
                      metrics.cognitiveLoadLevel === "medium" ? "w-2/3 bg-yellow-500" :
                      "w-full bg-rose-500"
                    }`}></div>
                  </div>
                  <p className="text-slate-300 text-sm">
                    {cognitiveLoadExplanations[metrics.cognitiveLoadLevel]}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-rose-400" />
                    <span className="text-sm font-bold text-slate-300">Motivation</span>
                  </div>
                  <p className="text-3xl font-bold text-rose-400">{metrics.motivationScore}%</p>
                  <p className="text-xs text-slate-500 mt-2">Keep up the great work!</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-bold text-slate-300">Focus Rating</span>
                  </div>
                  <p className="text-3xl font-bold text-cyan-400">{metrics.focusRating}%</p>
                  <p className="text-xs text-slate-500 mt-2">Excellent concentration!</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm font-bold text-slate-300">Peak Hours</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">{metrics.optimalLearningTime}</p>
                  <p className="text-xs text-slate-500 mt-2">Your optimal learning window</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-pink-900/30 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Adaptive Learning Recommendations
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-300">Increase Difficulty in Physics</p>
                      <p className="text-sm text-slate-400">You've achieved 89% mastery. Challenge yourself with advanced problems.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-yellow-500/30">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-300">Consolidate Chemistry Basics</p>
                      <p className="text-sm text-slate-400">Review bonding and molecular structure. Use spaced repetition for 1 week.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-slate-800/30 rounded-lg border border-cyan-500/30">
                    <Activity className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-cyan-300">Schedule Peak-Hour Sessions</p>
                      <p className="text-sm text-slate-400">You're most productive 2-4 PM. Schedule intensive study then for maximum retention.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/20 border border-slate-700/50 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  Spaced Repetition Schedule
                </h4>
                <div className="space-y-3">
                  {[
                    { topic: "Calculus - Integration", when: "Tomorrow", icon: "📚", color: "indigo" },
                    { topic: "Physics - Mechanics", when: "In 3 days", icon: "🔬", color: "cyan" },
                    { topic: "Chemistry - Bonding", when: "In 1 week", icon: "⚗️", color: "emerald" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-indigo-500/50 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.topic}</p>
                          <p className="text-xs text-slate-500">Review needed for retention</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${item.color}-500/20 border border-${item.color}-500/50 text-${item.color}-300`}>
                        {item.when}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white font-bold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50">
                Apply All Recommendations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
