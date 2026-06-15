import React, { useState } from "react";
import { MessageSquare, CheckCircle2, Clock, Award, Send, User, AlertCircle } from "lucide-react";

interface ExpertReview {
  id: string;
  expertName: string;
  expertise: string;
  feedback: string;
  timestamp: string;
  rating: number;
  suggestions: string[];
}

interface ExpertReviewPanelProps {
  doubtTitle?: string;
  originalDoubt?: string;
  rewrittenDoubt?: string;
  onClose: () => void;
}

export default function ExpertReviewPanel({
  doubtTitle = "Your Doubt",
  originalDoubt = "Can you explain integration?",
  rewrittenDoubt = "I'm struggling to understand the process of integration in calculus. Could you please explain how to integrate polynomial functions using the power rule?",
  onClose,
}: ExpertReviewPanelProps) {
  const [expertReviews, setExpertReviews] = useState<ExpertReview[]>([
    {
      id: "1",
      expertName: "Dr. Sarah Chen",
      expertise: "Mathematics & Calculus",
      feedback:
        "Excellent rewrite! Your question is now much clearer and provides context about your specific difficulty. This will help instructors give more targeted answers.",
      timestamp: "2 hours ago",
      rating: 5,
      suggestions: [
        "Include what methods you've already tried",
        "Mention your learning goal (exam prep or conceptual understanding)",
      ],
    },
    {
      id: "2",
      expertName: "Prof. James Wilson",
      expertise: "Educational Psychology",
      feedback:
        "The rewritten version shows good metacognitive awareness. You've identified the specific concept you're struggling with, which is a key step in effective learning.",
      timestamp: "1 hour ago",
      rating: 4,
      suggestions: ["Could add your current understanding level"],
    },
  ]);

  const [newRequest, setNewRequest] = useState("");

  const handleRequestReview = () => {
    if (newRequest.trim()) {
      console.log("Review requested:", newRequest);
      setNewRequest("");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center z-50 p-4 backdrop-blur-xl">
      <style>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .modal-card { animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .expert-card {
          background: linear-gradient(135deg, rgba(20, 30, 48, 0.8) 0%, rgba(15, 23, 42, 0.5) 100%);
          transition: all 0.3s ease;
        }
        .expert-card:hover {
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateX(4px);
        }
      `}
      </style>

      <div className="modal-card bg-slate-950 border border-slate-700/50 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative z-20 p-8 border-b border-slate-700/30 bg-gradient-to-r from-slate-900/80 via-amber-900/30 to-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-600/30 flex items-center justify-center border border-amber-400/60">
                <Award className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Expert Review & Feedback</h2>
                <p className="text-xs text-slate-400 mt-1">👨‍🎓 Professional guidance from subject matter experts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-slate-800/50 rounded-lg text-slate-400 hover:text-slate-200 transition-all border border-slate-700/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-8 space-y-8">
          {/* Doubt Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Original Doubt
              </h3>
              <p className="text-sm text-slate-300 italic">"{originalDoubt}"</p>
            </div>

            {/* Rewritten */}
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-5">
              <h3 className="text-sm font-bold text-emerald-300 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Rewritten by Clarify
              </h3>
              <p className="text-sm text-slate-300 italic">"{rewrittenDoubt}"</p>
            </div>
          </div>

          {/* Expert Reviews */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              Expert Reviews ({expertReviews.length})
            </h3>
            <div className="space-y-4">
              {expertReviews.map((review) => (
                <div key={review.id} className="expert-card border border-slate-700/50 rounded-xl p-6">
                  {/* Expert Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-600/20 flex items-center justify-center border border-amber-400/40">
                        <User className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{review.expertName}</p>
                        <p className="text-xs text-slate-400">{review.expertise}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < review.rating ? "⭐" : "☆"}`}></span>
                      ))}
                    </div>
                  </div>

                  {/* Feedback */}
                  <p className="text-sm text-slate-300 mb-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 italic">
                    "{review.feedback}"
                  </p>

                  {/* Suggestions */}
                  {review.suggestions.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                      <p className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1">
                        💡 Suggestions for Improvement
                      </p>
                      <ul className="space-y-1.5">
                        {review.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">▸</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {review.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Request Expert Review */}
          <div className="bg-gradient-to-r from-indigo-900/20 to-violet-900/20 border border-indigo-500/30 rounded-xl p-6">
            <h3 className="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2">
              <Send className="w-4 h-4" />
              Request Expert Review
            </h3>
            <textarea
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value.slice(0, 300))}
              placeholder="Ask experts for specific feedback... (e.g., 'Is my question clear enough?', 'How can I improve it further?')"
              className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-slate-500">{newRequest.length}/300 characters</p>
              <button
                onClick={handleRequestReview}
                disabled={!newRequest.trim()}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 border border-indigo-500/50 disabled:border-slate-600/30 rounded-lg text-white font-semibold text-sm transition-all"
              >
                Send Request
              </button>
            </div>
          </div>

          {/* Improvement Stats */}
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-5">
            <h3 className="text-sm font-bold text-emerald-300 mb-4">📊 Review Impact</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">8/10</p>
                <p className="text-xs text-slate-400">Clarity Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">92%</p>
                <p className="text-xs text-slate-400">Improvement</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">2</p>
                <p className="text-xs text-slate-400">Expert Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
