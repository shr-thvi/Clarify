import React, { useState } from "react";
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Send, User, Award, TrendingUp, Clock } from "lucide-react";

interface FeedbackItem {
  id: string;
  doubtTitle: string;
  rating: number;
  helpful: boolean | null;
  comment: string;
  instructorFeedback?: string;
  peerReviews?: { reviewer: string; comment: string }[];
  timestamp: string;
}

interface HumanFeedbackPanelProps {
  doubtTitle?: string;
  onClose: () => void;
}

export default function HumanFeedbackPanel({ doubtTitle = "Question", onClose }: HumanFeedbackPanelProps) {
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([
    {
      id: "1",
      doubtTitle: "Integration by substitution",
      rating: 4,
      helpful: true,
      comment: "Very clear explanation, helped me understand the concept",
      instructorFeedback: "Great! Your understanding is solid. Try harder problems next.",
      timestamp: "2 days ago",
    },
    {
      id: "2",
      doubtTitle: "Force and acceleration",
      rating: 5,
      helpful: true,
      comment: "Excellent breakdown of the physics concepts",
      peerReviews: [
        { reviewer: "Alex", comment: "This helped me too!" },
        { reviewer: "Sarah", comment: "Clear and concise" },
      ],
      timestamp: "1 week ago",
    },
  ]);

  const [currentRating, setCurrentRating] = useState(0);
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState<"rate" | "history">("rate");

  const handleSubmitFeedback = () => {
    const newFeedback: FeedbackItem = {
      id: String(feedbackHistory.length + 1),
      doubtTitle,
      rating: currentRating,
      helpful: isHelpful,
      comment,
      timestamp: "just now",
    };
    setFeedbackHistory([newFeedback, ...feedbackHistory]);
    setCurrentRating(0);
    setIsHelpful(null);
    setComment("");
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center z-50 p-4 backdrop-blur-xl">
      <style>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .modal-card { animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .star-button {
          transition: all 0.3s ease;
        }
        .star-button:hover {
          transform: scale(1.2) rotateZ(15deg);
        }
        .feedback-card {
          background: linear-gradient(135deg, rgba(20, 30, 48, 0.8) 0%, rgba(15, 23, 42, 0.5) 100%);
          border: 1px solid rgba(71, 85, 105, 0.4);
          transition: all 0.3s ease;
        }
        .feedback-card:hover {
          border-color: rgba(99, 102, 241, 0.5);
          transform: translateX(4px);
        }
      `}
      </style>

      <div className="modal-card bg-slate-950 border border-slate-700/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full -mr-40 -mt-40 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full -ml-40 -mb-40 blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative z-20 p-8 border-b border-slate-700/30 bg-gradient-to-r from-slate-900/80 via-violet-900/30 to-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-400/30 to-purple-600/30 flex items-center justify-center border border-violet-400/60">
                <MessageSquare className="w-7 h-7 text-violet-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Human Feedback Loop</h2>
                <p className="text-xs text-slate-400 mt-1">💬 Instructor & Peer Reviews</p>
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

        {/* Tabs */}
        <div className="relative z-10 flex border-b border-slate-700/30 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab("rate")}
            className={`px-6 py-4 text-sm font-semibold transition-all relative ${
              activeTab === "rate"
                ? "text-violet-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ⭐ Rate Response
            {activeTab === "rate" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-purple-600 rounded-t"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-4 text-sm font-semibold transition-all relative ${
              activeTab === "history"
                ? "text-violet-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📋 History
            {activeTab === "history" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-purple-600 rounded-t"></div>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 overflow-y-auto p-8">
          {activeTab === "rate" && (
            <div className="space-y-8">
              {/* Question Display */}
              <div className="bg-gradient-to-r from-indigo-900/20 to-violet-900/20 border border-indigo-500/30 rounded-xl p-5">
                <p className="text-xs text-slate-400 mb-2 font-semibold">RATING FOR:</p>
                <p className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📝</span>
                  {doubtTitle}
                </p>
              </div>

              {/* Star Rating */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  How helpful was this rewrite?
                </label>
                <div className="flex gap-3 justify-center p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setCurrentRating(star)}
                      className="star-button p-3 transition-all"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          currentRating >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-600 hover:text-slate-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {currentRating > 0 && (
                  <p className="text-sm text-center text-yellow-400 font-semibold">
                    You rated this: {currentRating}/5 ⭐
                  </p>
                )}
              </div>

              {/* Helpful/Not Helpful */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-white">Was this response helpful?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsHelpful(true)}
                    className={`px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all border ${
                      isHelpful === true
                        ? "bg-emerald-500/30 border-emerald-500/60 text-emerald-300"
                        : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-emerald-500/40"
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    Yes, Helpful
                  </button>
                  <button
                    onClick={() => setIsHelpful(false)}
                    className={`px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all border ${
                      isHelpful === false
                        ? "bg-rose-500/30 border-rose-500/60 text-rose-300"
                        : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-rose-500/40"
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    Not Helpful
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-white">Comments (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder="What could be improved? What was excellent? Your feedback helps us learn..."
                  className="w-full px-4 py-3 bg-slate-800/40 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:bg-slate-800/60 resize-none transition-all"
                  rows={5}
                />
                <p className="text-xs text-slate-500">{comment.length}/500 characters</p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitFeedback}
                disabled={currentRating === 0}
                className={`w-full px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  currentRating === 0
                    ? "bg-slate-800/20 border border-slate-700/30 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border border-violet-500/50 text-white shadow-lg shadow-violet-500/30"
                }`}
              >
                <Send className="w-5 h-5" />
                Submit Feedback
              </button>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {feedbackHistory.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
                  <p className="text-slate-400">No feedback submitted yet</p>
                </div>
              ) : (
                feedbackHistory.map((feedback) => (
                  <div key={feedback.id} className="feedback-card rounded-xl p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          <span>📚</span>
                          {feedback.doubtTitle}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {feedback.timestamp}
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < feedback.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Helpful Badge */}
                    {feedback.helpful !== null && (
                      <div className="mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${
                            feedback.helpful
                              ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                              : "bg-rose-500/20 border border-rose-500/40 text-rose-300"
                          }`}
                        >
                          {feedback.helpful ? (
                            <>
                              <ThumbsUp className="w-3.5 h-3.5" />
                              Helpful
                            </>
                          ) : (
                            <>
                              <ThumbsDown className="w-3.5 h-3.5" />
                              Not Helpful
                            </>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Comment */}
                    {feedback.comment && (
                      <p className="text-sm text-slate-300 italic mb-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                        "{feedback.comment}"
                      </p>
                    )}

                    {/* Instructor Feedback */}
                    {feedback.instructorFeedback && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <p className="text-xs font-bold text-amber-300">👨‍🏫 Instructor Feedback</p>
                        </div>
                        <p className="text-xs text-slate-300">{feedback.instructorFeedback}</p>
                      </div>
                    )}

                    {/* Peer Reviews */}
                    {feedback.peerReviews && feedback.peerReviews.length > 0 && (
                      <div className="bg-slate-700/20 border border-slate-600/30 rounded-lg p-4">
                        <p className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          👥 Peer Reviews
                        </p>
                        <div className="space-y-2">
                          {feedback.peerReviews.map((review, idx) => (
                            <div key={idx} className="text-xs">
                              <p className="font-semibold text-slate-200">{review.reviewer}</p>
                              <p className="text-slate-400">"{review.comment}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
