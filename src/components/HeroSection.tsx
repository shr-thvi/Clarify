import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Brain, MessageSquare, Award, BookOpen, Zap, TrendingUp } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
  isLoggedIn: boolean;
}

export default function HeroSection({ onGetStarted, isLoggedIn }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-30px); } }
        @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } }
        .hero-gradient { background: linear-gradient(135deg, #ffffff 0%, #f7f3ff 50%, #fef3c7 100%); background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
        .slide-up { animation: slide-up 0.8s ease-out; }
        .fade-in-down { animation: fade-in-down 0.8s ease-out; }
        .float-animation { animation: float 6s ease-in-out infinite; }
        .gradient-text { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .feature-card { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .feature-card:hover { transform: translateY(-16px); box-shadow: 0 25px 50px rgba(99, 102, 241, 0.25); }
        .blob { animation: blob 8s infinite; }
      `}
      </style>

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-pink-400/15 rounded-full blur-3xl blob" style={{ animationDelay: "2s" }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-yellow-300/15 rounded-full blur-3xl blob" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Main Hero Container */}
      <div className="relative hero-gradient min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        {/* Top Navigation Hint */}
        <div className="fade-in-down mb-12 text-center">
          <p className="text-xs tracking-widest uppercase text-purple-600 font-bold mb-4">✨ Welcome to Clarify</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight text-purple-950">
            Transform Your
            <br />
            <span className="gradient-text">Learning Journey</span>
          </h1>
          <p className="text-lg sm:text-xl text-purple-800 max-w-2xl mx-auto leading-relaxed">
            AI-powered doubt rewriting + psychology-based learning analytics + human feedback loop. Clarify makes every question crystal clear.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="slide-up flex flex-col sm:flex-row gap-4 mb-16 mt-8">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center justify-center gap-2 group"
          >
            {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-white/70 hover:bg-white border border-purple-200 text-purple-900 font-bold rounded-xl transition-all backdrop-blur-sm">
            Watch Demo (2 min)
          </button>
        </div>

        {/* Key Stats */}
        <div className="slide-up grid grid-cols-3 gap-8 mb-20 w-full max-w-2xl">
          <div className="text-center">
            <p className="text-3xl font-bold gradient-text">50K+</p>
            <p className="text-sm text-purple-700 mt-2">Active Learners</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold gradient-text">1M+</p>
            <p className="text-sm text-purple-700 mt-2">Doubts Rewritten</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold gradient-text">200+</p>
            <p className="text-sm text-purple-700 mt-2">Topics Covered</p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="w-full max-w-6xl">
          <h2 className="text-3xl font-bold text-purple-950 text-center mb-12">Powered by Advanced Psychology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Brain,
                title: "🧠 Learning Profile",
                desc: "AI analyzes your learning style, optimal study time, and cognitive load. Adaptive recommendations tailored to you.",
                gradient: "from-purple-100/80 to-purple-50/60",
                border: "border-purple-200",
              },
              {
                icon: MessageSquare,
                title: "💬 Human Feedback Loop",
                desc: "Rate responses, get instructor feedback, peer reviews, and improvement suggestions. Community-driven learning.",
                gradient: "from-pink-100/80 to-pink-50/60",
                border: "border-pink-200",
              },
              {
                icon: Award,
                title: "👨‍🎓 Expert Reviews",
                desc: "Get professional reviews from PhDs and educational experts. Specific improvement suggestions & guidance.",
                gradient: "from-amber-100/80 to-amber-50/60",
                border: "border-amber-200",
              },
              {
                icon: BookOpen,
                title: "📚 Study Resources",
                desc: "Curated learning materials, tutorials, videos, practice sets organized by subject and difficulty.",
                gradient: "from-cyan-100/80 to-cyan-50/60",
                border: "border-cyan-200",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`feature-card bg-gradient-to-br ${feature.gradient} border ${feature.border} rounded-2xl p-8 backdrop-blur-xl`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-purple-200/40">
                      <Icon className="w-6 h-6 text-purple-700" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-950">{feature.title}</h3>
                    </div>
                  </div>
                  <p className="text-purple-800 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 right-10 float-animation opacity-20">
          <Sparkles className="w-20 h-20 text-purple-600" />
        </div>
        <div className="absolute bottom-1/3 left-10 float-animation opacity-20" style={{ animationDelay: "1s" }}>
          <Zap className="w-16 h-16 text-fuchsia-600" />
        </div>
      </div>

      {/* Bottom Section - How It Works */}
      <div className="relative bg-gradient-to-b from-purple-50/50 to-white px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-purple-950 text-center mb-16">How Clarify Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Ask", desc: "Submit your confusing question", icon: "❓" },
              { num: "02", title: "Rewrite", desc: "AI transforms it into clarity", icon: "✨" },
              { num: "03", title: "Learn", desc: "Get expert answers & feedback", icon: "📚" },
              { num: "04", title: "Grow", desc: "Track progress & master topics", icon: "📈" },
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-white border border-purple-200 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-400 transition-all shadow-sm">
                  <p className="text-5xl font-black gradient-text mb-3">{step.num}</p>
                  <p className="text-2xl mb-2">{step.icon}</p>
                  <h3 className="text-xl font-bold text-purple-950 mb-2">{step.title}</h3>
                  <p className="text-sm text-purple-700">{step.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-purple-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative bg-gradient-to-r from-purple-100/40 via-fuchsia-50/40 to-pink-100/40 px-4 sm:px-6 lg:px-8 py-20 border-t border-purple-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-purple-950 mb-6">Ready to Clarify Your Learning?</h2>
          <p className="text-lg text-purple-800 mb-8">Join 50,000+ students transforming their study experience with AI + Psychology</p>
          <button
            onClick={onGetStarted}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 inline-flex items-center gap-2 group"
          >
            Start Learning Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
