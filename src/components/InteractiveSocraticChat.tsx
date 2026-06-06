import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { 
  Sparkles, 
  Send, 
  RotateCcw, 
  FileCheck, 
  HelpCircle, 
  Bot, 
  User, 
  Sliders, 
  Loader2, 
  ArrowRight 
} from "lucide-react";

interface InteractiveSocraticChatProps {
  initialSubject?: string;
  initialDoubt?: string;
  onAdoptDoubt: (doubt: string) => void;
}

export default function InteractiveSocraticChat({ 
  initialSubject = "General", 
  initialDoubt = "", 
  onAdoptDoubt 
}: InteractiveSocraticChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [draftQuery, setDraftQuery] = useState(initialDoubt || "Let's work together to clear up your doubt first.");
  const [confidence, setConfidence] = useState(25);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Restart/Initialize conversation helper
  const initializeChat = async (resetWithDoubt?: string) => {
    setLoading(true);
    const startDoubt = resetWithDoubt || initialDoubt;
    
    const welcomeMsg: ChatMessage = {
      id: "welcome",
      role: "tutor",
      content: startDoubt 
        ? `Hello! I noticed you are struggling with details related to: "${startDoubt}". Let's refine your doubt. Tell me, are you facing issues with the core formulas, definition of variables, or the specific calculation steps?`
        : "Hello! I am your Socratic AI Tutor. If your query feels fuzzy or you're not sure how to state it, tell me what you're thinking or what problem you're working on, and I'll help you phrase a high-grade academic doubt step-by-step!",
      draftQuery: startDoubt || "Let's discuss first to generate a professional doubt expression.",
      confidenceInDraft: startDoubt ? 40 : 15,
      nextSuggestedInput: startDoubt ? "I'm having difficulty understanding the core formula." : "I don't know where to start."
    };

    setMessages([welcomeMsg]);
    setDraftQuery(welcomeMsg.draftQuery || "");
    setConfidence(welcomeMsg.confidenceInDraft || 25);
    setLoading(false);
  };

  // Run initial chat load
  useEffect(() => {
    initializeChat();
  }, [initialDoubt]);

  // Scroll messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || inputVal;
    if (!textToSend.trim()) return;

    // Create student message
    const studentMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, studentMsg]);
    if (!customMessage) setInputVal("");
    setLoading(true);

    try {
      // Map history for the API
      const chatHistory = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));

      const res = await fetch("/api/clarify-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: chatHistory,
          currentQuery: textToSend,
          subjectContext: initialSubject
        })
      });

      if (!res.ok) {
        throw new Error("Tutor failed to respond.");
      }

      const data = await res.json();
      
      const tutorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        content: data.tutorReply || "Could you provide more context?",
        draftQuery: data.currentDraftQuery || draftQuery,
        confidenceInDraft: data.confidenceInDraft || 40,
        nextSuggestedInput: data.nextSuggestedInput || ""
      };

      setMessages((prev) => [...prev, tutorMsg]);
      
      if (data.currentDraftQuery) {
        setDraftQuery(data.currentDraftQuery);
      }
      if (data.confidenceInDraft !== undefined) {
        setConfidence(data.confidenceInDraft);
      }

    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        content: `Error: ${err.message || "Tutor server error. Make sure your secrets configuration has an active key."}`
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
      
      {/* Socratic Conversation */}
      <div className="lg:col-span-7 flex flex-col bg-slate-950 rounded-2xl border border-white/5 overflow-hidden h-[540px]">
        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Socratic Doubt Assistant</h4>
              <p className="text-[10px] text-slate-400 font-medium">Topic: {initialSubject}</p>
            </div>
          </div>
          <button 
            onClick={() => initializeChat("")}
            className="p-1 px-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>
        </div>

        {/* Chats body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div 
              key={m.id}
              className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold leading-none ${
                m.role === "user"
                  ? "bg-indigo-500 text-white"
                  : "bg-violet-600 text-white"
              }`}>
                {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-2xl p-3.5 text-sm ${
                m.role === "user"
                  ? "bg-indigo-600/90 text-white rounded-tr-none"
                  : "bg-slate-900 text-slate-100 border border-white/5 rounded-tl-none"
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 shrink-0 rounded-full bg-violet-600 text-white flex items-center justify-center animate-pulse">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[80%] rounded-2xl p-3.5 bg-slate-900 border border-white/5 rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                <span className="text-xs text-slate-400 font-mono">Tutor is reflecting...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested preloaded options */}
        {messages.length > 0 && messages[messages.length - 1]?.role === "tutor" && messages[messages.length - 1].nextSuggestedInput && (
          <div className="px-4 py-2 bg-slate-950 border-t border-white/5 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button 
              onClick={() => handleSendMessage(messages[messages.length - 1].nextSuggestedInput)}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 font-medium px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer"
            >
              🚀 Prompt suggestion: "{messages[messages.length - 1].nextSuggestedInput}"
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="p-3 bg-slate-900 border-t border-white/5 flex gap-2">
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your explanation, struggles or thoughts..."
            className="flex-1 bg-slate-950 focus:bg-black focus:ring-1 focus:ring-violet-500 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm border border-white/5 focus:outline-none transition-all"
            disabled={loading}
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={loading || !inputVal.trim()}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl flex items-center justify-center disabled:opacity-40 transition-all font-semibold"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Draft formulation dynamic panel */}
      <div className="lg:col-span-5 flex flex-col bg-slate-900/60 p-6 rounded-2xl border border-white/5 justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Dynamic Concept Formulation
            </h4>
            <span className="font-mono text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded-full">
              Socratic Refiner
            </span>
          </div>

          {/* Clarity slider indicator */}
          <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Query Integrity Confidence
              </span>
              <span className="font-mono font-bold text-indigo-300">{confidence}%</span>
            </div>
            
            {/* Custom slider track */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400"
                style={{ width: `${confidence}%` }}
              />
            </div>
            
            <p className="text-[10px] text-slate-500 pt-1 leading-relaxed">
              {confidence < 40 
                ? "Still early drafting. Give me a few more details or clarify the formulas/steps."
                : confidence < 75
                ? "Getting much clearer! Almost fully structured."
                : "Perfected! This is highly suitable for classroom teachers, exams, and textbook searches!"}
            </p>
          </div>

          {/* Realtime generated rewrite view */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">Formulated Doubt Query Preview:</span>
            <div className="p-4 bg-slate-950/70 rounded-xl border border-dashed border-slate-700 font-mono text-sm text-indigo-200 leading-relaxed min-h-[120px] max-h-[220px] overflow-y-auto">
              "{draftQuery}"
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-3">
          <button 
            onClick={() => onAdoptDoubt(draftQuery)}
            disabled={draftQuery.startsWith("Let's")}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-emerald-600 disabled:bg-indigo-800/40 disabled:text-slate-400 text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-40"
          >
            <FileCheck className="w-4 h-4" />
            Apply Perfected Query
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          
          <p className="text-[10px] text-slate-400 text-center leading-relaxed max-w-xs mx-auto">
            Clicking "Apply Perfected Query" transfers this re-synthesized question back to the workspace to generate a deep academic solution.
          </p>
        </div>

      </div>

    </div>
  );
}
