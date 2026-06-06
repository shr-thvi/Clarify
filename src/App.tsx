import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Search, 
  BookOpen, 
  Zap, 
  Binary, 
  Code, 
  FileSignature, 
  Cpu, 
  HelpCircle, 
  Copy, 
  Star, 
  Image, 
  Trash2, 
  ArrowRight, 
  Check, 
  Bookmark, 
  RotateCcw, 
  Sliders, 
  AlertCircle, 
  Play, 
  Layers, 
  Network, 
  BarChart2, 
  Award, 
  Languages, 
  Flame,
  Volume2,
  FileText
} from "lucide-react";
import { DOUBT_EXAMPLES } from "./examples";
import { DoubtRewriteResult, SavedDoubt } from "./types";
import StatsDashboard from "./components/StatsDashboard";
import InteractiveSocraticChat from "./components/InteractiveSocraticChat";

export default function App() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<"workspace" | "socratic" | "dashboard" | "library">("workspace");

  // Input states
  const [inputText, setInputText] = useState("");
  const [rewriteMode, setRewriteMode] = useState<"academic" | "concise" | "textbook" | "socratic">("academic");
  
  // OCR image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Loading & Result States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<DoubtRewriteResult | null>(null);
  const [ttsPlaying, setTtsPlaying] = useState(false);

  // Library / Starred persistence
  const [savedDoubts, setSavedDoubts] = useState<SavedDoubt[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasStarredActive, setHasStarredActive] = useState(false);

  // Load saved doubts on init
  useEffect(() => {
    try {
      const stored = localStorage.getItem("intelligent_doubts");
      if (stored) {
        setSavedDoubts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Local storage retrieval failed", e);
    }
  }, []);

  // Sync to local storage
  const syncSavedDoubts = (newList: SavedDoubt[]) => {
    setSavedDoubts(newList);
    try {
      localStorage.setItem("intelligent_doubts", JSON.stringify(newList));
    } catch (e) {
      console.error("Local storage save failed", e);
    }
  };

  // Preset loaders
  const handleLoadExample = (raw: string) => {
    setInputText(raw);
    setErrorMessage(null);
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Image upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setupImage(e.target.files[0]);
    }
  };

  const setupImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select or drop a valid image file (PNG, JPG, etc.).");
      return;
    }
    setImageFile(file);
    setImageMime(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      setImagePreview(resultStr);
      // Strip metadata from base64 string
      const base64Data = resultStr.split(",")[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
    setErrorMessage(null);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
    setImageMime(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setupImage(e.dataTransfer.files[0]);
    }
  };

  // Master rephrase form submission
  const handleRephraseDoubt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !imageBase64) {
      setErrorMessage("Please enter an ambiguous student query or upload a textbook question photo first.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const response = await fetch("/api/rewrite-doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawDoubt: inputText,
          mode: rewriteMode,
          imageData: imageBase64,
          mimeType: imageMime
        }),
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.error || "Failed to reach rewriter API.");
      }

      const data: DoubtRewriteResult = await response.json();
      setResult(data);

      // Save to query library history
      const newSavedItem: SavedDoubt = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        rawInput: inputText || "[Screen scanned OCR question]",
        mode: rewriteMode,
        result: data,
        starred: false
      };

      const updatedHistory = [newSavedItem, ...savedDoubts];
      syncSavedDoubts(updatedHistory);
      setHasStarredActive(false);

    } catch (err: any) {
      setErrorMessage(err.message || "An issue occurred. Ensure GEMINI_API_KEY is defined in Settings > Secrets.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Star / Unstar
  const toggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = savedDoubts.map((item) => {
      if (item.id === id) {
        const updatedStatus = !item.starred;
        if (result && result.originalDoubt === item.result.originalDoubt && result.rewrittenDoubt === item.result.rewrittenDoubt) {
          setHasStarredActive(updatedStatus);
        }
        return { ...item, starred: updatedStatus };
      }
      return item;
    });
    syncSavedDoubts(updated);
  };

  const deleteSavedDoubt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this doubt from your history?")) {
      const updated = savedDoubts.filter((item) => item.id !== id);
      syncSavedDoubts(updated);
      if (result) {
        setHasStarredActive(false);
      }
    }
  };

  // Socratic adopted helper
  const handleAdoptSocraticDoubt = (rephrasedVal: string) => {
    setInputText(rephrasedVal);
    setActiveTab("workspace");
    // Trigger automatically in concise mode
    setRewriteMode("academic");
    setTimeout(() => {
      const mockEvent = { preventDefault: () => {} };
      // Quick request
      setIsProcessing(true);
      fetch("/api/rewrite-doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawDoubt: rephrasedVal,
          mode: "academic"
        }),
      })
      .then(res => res.json())
      .then(data => {
        setResult(data);
        const newSavedItem: SavedDoubt = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          rawInput: rephrasedVal,
          mode: "academic",
          result: data,
          starred: false
        };
        syncSavedDoubts([newSavedItem, ...savedDoubts]);
      })
      .catch(err => setErrorMessage(err.message))
      .finally(() => setIsProcessing(false));
    }, 100);
  };

  // Get matching icon for dynamic subjects
  const getSubjectIconClass = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes("phys")) return { icon: <Zap className="w-5 h-5" />, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
    if (s.includes("math") || s.includes("derivation") || s.includes("calculus")) return { icon: <Binary className="w-5 h-5" />, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    if (s.includes("cod") || s.includes("java") || s.includes("python") || s.includes("program")) return { icon: <Code className="w-5 h-5" />, color: "bg-violet-500/10 text-violet-400 border-violet-500/20" };
    if (s.includes("chem")) return { icon: <Flame className="w-5 h-5" />, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    if (s.includes("bio")) return { icon: <Cpu className="w-5 h-5" />, color: "bg-lime-500/10 text-lime-400 border-lime-500/20" };
    return { icon: <BookOpen className="w-5 h-5" />, color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* Visual background ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header navigation rail */}
      <nav className="border-b border-white/5 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-white/10">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  Clarify
                </span>
                <span className="text-[9px] uppercase tracking-widest font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  AI Doubt Optimizer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium font-mono">Reframe ambiguous queries into pristine academic logic</p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1.5 self-center sm:self-auto overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            <button 
              onClick={() => { setActiveTab("workspace"); setErrorMessage(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "workspace" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FileSignature className="w-3.5 h-3.5" />
              Workspace
            </button>
            <button 
              onClick={() => { setActiveTab("socratic"); setErrorMessage(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "socratic" 
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Socratic Assistant
            </button>
            <button 
              onClick={() => { setActiveTab("dashboard"); setErrorMessage(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "dashboard" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Analytics
            </button>
            <button 
              onClick={() => { setActiveTab("library"); setErrorMessage(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "library"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
              id="library-tab"
            >
              <Bookmark className="w-3.5 h-3.5" />
              My Library ({savedDoubts.length})
            </button>
          </div>

          {/* Active stats badge */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>UTC: 2026-05-31</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
        </div>
      </nav>

      {/* Main body area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error box */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-sm text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Setup / Configuration Warning</p>
              <p className="opacity-90">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 1. WORKSPACE TAB */}
        {activeTab === "workspace" && (
          <div className="space-y-8">
            
            {/* Quick explanation banner */}
            <div className="p-6 bg-gradient-to-r from-indigo-950/60 to-slate-900/60 border border-indigo-500/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-indigo-400" />
                  Intelligent Study Query Optimizer
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Type a rough student doubt, copy Hinglish code errors, or drop a picture of textbook calculations. The AI engine automatically translates dialects, corrects spelling, identifies study subjects, and generates ready-to-test academic search terms with step-by-step solutions.
                </p>
              </div>

              {/* Mode indicator select */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-white/5 shrink-0 self-start md:self-auto">
                {(["academic", "concise", "textbook", "socratic"] as const).map((mode) => (
                  <button 
                    key={mode}
                    onClick={() => setRewriteMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      rewriteMode === mode 
                        ? "bg-indigo-600 text-white" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Input Form and Presets */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form Input area */}
              <div className="lg:col-span-8 space-y-6">
                <form onSubmit={handleRephraseDoubt} className="p-6 bg-slate-900/60 rounded-2xl border border-white/5 space-y-6 relative overflow-hidden">
                  
                  {/* Top description */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-indigo-400" />
                      1. Student Input (Messy Text or Image)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Supports English, Hinglish, & Hindi
                    </span>
                  </div>

                  {/* Input areas */}
                  <div className="space-y-4">
                    
                    {/* Text field */}
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="e.g. current kyu reverse hota hai ac me... OR drag and drop a textbook calculation image here"
                      className="w-full h-36 bg-slate-950 focus:bg-black rounded-xl p-4 text-slate-100 placeholder-slate-600 border border-white/5 focus:border-indigo-600/50 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all font-sans text-sm resize-none"
                    />

                    {/* OCR Dropper view */}
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative py-5 px-4 rounded-xl border border-dashed text-center flex flex-col items-center justify-center transition-all ${
                        dragActive 
                          ? "border-indigo-500 bg-indigo-500/5" 
                          : imagePreview 
                          ? "border-emerald-500/30 bg-emerald-500-[3px]" 
                          : "border-slate-800 hover:border-slate-700 bg-slate-950"
                      }`}
                    >
                      {imagePreview ? (
                        <div className="flex items-center gap-4 w-full justify-between">
                          <div className="flex items-center gap-3">
                            <img 
                              src={imagePreview} 
                              alt="OCR Upload Preview" 
                              className="w-12 h-12 object-cover rounded-lg border border-emerald-500/20 shadow-md"
                            />
                            <div className="text-left">
                              <p className="text-xs font-semibold text-white truncate max-w-[200px]">
                                {imageFile?.name}
                              </p>
                              <p className="text-[9px] text-slate-400 font-mono">
                                Image loaded successfully
                              </p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={clearImage}
                            className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer space-y-1 block w-full">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <div className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200">
                            <Image className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-medium">Attach Textbook image/screenshot for OCR</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">Supports Drag & Drop (PNG, JPG)</p>
                        </label>
                      )}
                    </div>

                  </div>

                  {/* Buttons line */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                    
                    {/* Clear form utility */}
                    <button 
                      type="button"
                      onClick={() => { setInputText(""); clearImage(); }}
                      className="px-3.5 py-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-white/5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Fields
                    </button>

                    {/* Master Call action */}
                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-t-2 border-r-2 border-white animate-spin shrink-0" />
                          Analyzing Study Query...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 shrink-0" />
                          Optimize Doubt Query
                          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                        </>
                      )}
                    </button>

                  </div>

                </form>

                {/* Sub-results output */}
                {result && (
                  <div className="p-6 bg-slate-900/60 rounded-2xl border border-white/5 space-y-8 animate-fade-in">
                    
                    {/* Top Subject Classification / Confidence pill */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
                      
                      {/* Classification Badge */}
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border flex items-center justify-center ${getSubjectIconClass(result.subject).color}`}>
                          {getSubjectIconClass(result.subject).icon}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 font-mono">Detected Subject</p>
                          <p className="text-base font-bold text-white">{result.subject}</p>
                        </div>
                      </div>

                      {/* Confidence and Multi-lingual markers */}
                      <div className="flex items-center gap-3">
                        {/* Hinglish translated indicator */}
                        {result.isMultilingual && (
                          <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                            <Languages className="w-3 h-3" />
                            Translated {result.detectedLanguages.join(" + ")}
                          </span>
                        )}

                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Expert confidence</p>
                          <p className="text-sm font-extrabold text-indigo-400 font-mono">{result.confidence}%</p>
                        </div>
                      </div>

                    </div>

                    {/* Rewritten box header */}
                    <div className="p-5 bg-gradient-to-r from-indigo-900/40 to-slate-950/70 border border-indigo-500/20 rounded-2xl space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-extrabold flex items-center gap-1.5">
                          🚀 Optimized Query ({rewriteMode} mode)
                        </span>
                        
                        <button 
                          onClick={() => copyToClipboard(result.rewrittenDoubt, "rewritten")}
                          className="px-2.5 py-1 bg-slate-900 group-hover:bg-indigo-600 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedId === "rewritten" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Query
                            </>
                          )}
                        </button>
                      </div>

                      <blockquote className="text-base sm:text-lg font-bold text-white leading-relaxed font-sans italic">
                        "{result.rewrittenDoubt}"
                      </blockquote>
                      
                      {/* Subtitle tag recommendations */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        {result.recommendedKeywords.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[10px] font-mono font-medium text-slate-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Doubt grading, suggestions dial, & emotional state */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Grading */}
                      <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300">Doubt Grammar & Clarity Score:</span>
                          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                            result.doubtQualityScore > 75 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : result.doubtQualityScore > 40
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {result.doubtQualityScore}% Original Grade
                          </span>
                        </div>
                        
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              result.doubtQualityScore > 75 
                                ? "bg-emerald-400" 
                                : result.doubtQualityScore > 40
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            }`}
                            style={{ width: `${result.doubtQualityScore}%` }}
                          />
                        </div>

                        {/* Tips */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">Doubt Formulation Advice:</span>
                          <ul className="space-y-1">
                            {result.doubtQualityTips.map((tip, idx) => (
                              <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                                <span className="text-indigo-400 font-semibold">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Conflict details */}
                      <div className="p-4 bg-slate-950 rounded-xl border border-white/5 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-300 block">Student Psychological Profile:</span>
                          <div className="p-3 bg-slate-900 rounded-lg border border-white/5">
                            <p className="text-[10px] uppercase font-bold text-slate-500 font-mono">Confusion style</p>
                            <p className="text-xs font-semibold text-slate-200 mt-1">{result.confusionLevel}</p>
                          </div>
                        </div>

                        {/* If context needs clarification warnings */}
                        {result.clarificationNeeded ? (
                          <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 flex gap-2">
                            <span className="text-amber-400 leading-none font-bold text-xs mt-0.5">⚠️</span>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-amber-400 font-mono">Tutor Request Clarification</p>
                              <p className="text-xs text-slate-300 mt-0.5">{result.clarificationQuestion}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-xs text-emerald-400 font-medium">
                            ✓ This query contains complete parameters. Ready for teacher submission.
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Comprehensive structured educational explanation */}
                    <div className="space-y-3">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block font-mono">
                        📖 Comprehensive Tutoring Concept Solution:
                      </span>
                      
                      <div className="p-5 bg-slate-950 rounded-xl border border-white/5 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-xs text-indigo-400 font-semibold font-mono">Step-by-Step Educational Solution</span>
                          <button 
                            onClick={() => copyToClipboard(result.explanation, "solution")}
                            className="text-[10px] hover:text-white text-slate-400 font-mono transition-colors flex items-center gap-1"
                          >
                            {copiedId === "solution" ? "Copied" : "Copy Solution"}
                          </button>
                        </div>

                        <div className="text-sm font-sans text-slate-300 leading-relaxed space-y-3 whitespace-pre-wrap">
                          {result.explanation}
                        </div>
                      </div>
                    </div>

                    {/* Formula reference database & Law block */}
                    {result.relatedFormulas.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-slate-300 block font-mono">🔬 Core Academic Equations & Laws Associated:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {result.relatedFormulas.map((formula, idx) => (
                            <div key={idx} className="p-3 bg-slate-950/80 rounded-xl border border-white/5 font-mono text-xs text-indigo-200 flex items-start gap-2">
                              <span className="text-indigo-400 font-bold">&#8756;</span>
                              <p>{formula}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Socratic Clarification needed - option to open chat panel */}
                    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-white">Need a deeper rephrase or interactive dialogue?</h4>
                        <p className="text-xs text-slate-400">Launch our interactive Socratic dialogue panel with a dynamic query metric helper.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab("socratic")}
                        className="px-4 py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                      >
                        Launch Interactive Socratic Chat
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                )}

              </div>

              {/* Sidebar Presets & Quick Stats Overview */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Clickable Preset Cards Widget */}
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <Bookmark className="w-4 h-4 text-indigo-400" />
                      Academic Preset Examples
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Click any bad/short student doubt below to run rewrite:</p>
                  </div>

                  <div className="space-y-3">
                    {DOUBT_EXAMPLES.map((ex, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleLoadExample(ex.raw)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          inputText === ex.raw 
                            ? "bg-indigo-600/25 border-indigo-500" 
                            : "bg-slate-950/70 border-white/5 hover:border-slate-800 hover:bg-slate-950"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5">
                          <span className="font-semibold text-indigo-300 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                            {ex.badge}
                          </span>
                          <span>{ex.language}</span>
                        </div>
                        <p className="text-xs font-bold font-mono text-slate-200 line-clamp-1">"{ex.title}"</p>
                        <p className="text-[11px] text-slate-400 italic font-medium mt-1 truncate">"{ex.raw}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Starred Query stats overview panel */}
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4 text-emerald-400" />
                      Dynamic Workspace Stats
                    </h3>
                    <span className="font-mono text-[10px] font-bold text-indigo-400">{savedDoubts.length} total</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-950/80 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Favorite saved doubts:</span>
                      <span className="font-mono font-bold text-white bg-indigo-505 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        {savedDoubts.filter(d => d.starred).length} ⭐
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-950/80 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Image uploads processed:</span>
                      <span className="font-mono font-bold text-white bg-violet-500/10 px-1.5 py-0.5 rounded">
                        {savedDoubts.filter(d => d.rawInput === "[Screen scanned OCR question]").length} 📸
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-950/80 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Active mode selection:</span>
                      <span className="font-mono font-bold text-white bg-amber-500/10 px-1.5 py-0.5 uppercase rounded text-[10px]">
                        {rewriteMode}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 2. SOCRATIC ASSISTANT TAB */}
        {activeTab === "socratic" && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/60 rounded-2xl border border-white/5 space-y-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent flex items-center gap-2">
                <Network className="w-5 h-5 text-violet-400 animate-pulse" />
                Collaborative Socratic Prompt Builder
              </h3>
              <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                Struggling to state what formula is puzzling or what chapter is active? Engage with our adaptive chatbot. The chatbot asks simple, pedagogical questions about your topic context, and synthesizes a perfect academic doubt query draft in real-time, complete with integrity and clarity gauges!
              </p>
            </div>

            <InteractiveSocraticChat 
              initialSubject={result ? result.subject : "General Dynamics"}
              initialDoubt={inputText || ""}
              onAdoptDoubt={handleAdoptSocraticDoubt}
            />
          </div>
        )}

        {/* 3. PERFORMANCE ANALYTICS TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/60 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-400" />
                Student Doubt Portfolio & Analytics
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Visualizing query strength ratios, subject distributions, and clarity improvements over time based on local workspace interactions.
              </p>
            </div>

            <StatsDashboard 
              savedDoubts={savedDoubts}
              onSelectDoubt={(savedItem) => {
                setResult(savedItem.result);
                setInputText(savedItem.rawInput);
                setRewriteMode(savedItem.mode as any);
                setActiveTab("workspace");
              }}
            />
          </div>
        )}

        {/* 4. REPHRASED LIBRARY MEMORIES */}
        {activeTab === "library" && (
          <div className="space-y-6">
            
            <div className="p-6 bg-slate-900/60 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-indigo-400" />
                  Your Starred Query Library
                </h3>
                <p className="text-xs text-slate-400 mt-1">Review, star, compare, or instantly reload previous rephrased academic doubts.</p>
              </div>

              {savedDoubts.length > 0 && (
                <button 
                  onClick={() => {
                    if (confirm("Clear your rephraser history? This cannot be undone.")) {
                      syncSavedDoubts([]);
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Clear Library
                </button>
              )}
            </div>

            {savedDoubts.length === 0 ? (
              <div className="py-20 text-center bg-slate-900/40 rounded-2xl border border-white/5">
                <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-base text-slate-300 font-semibold mb-1">Your academic query catalog is empty</p>
                <p className="text-xs text-slate-500">Go back to the workspace to input queries, click rephrase, and build your catalog.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedDoubts.map((doubt) => (
                  <div 
                    key={doubt.id}
                    className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 hover:border-slate-800 hover:bg-slate-900 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      
                      {/* Badge line */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/10">
                          {doubt.result.subject} (Q: {doubt.result.doubtQualityScore}%)
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => toggleStar(doubt.id, e)}
                            className="p-1 hover:text-white transition-colors"
                          >
                            <Star className={`w-4 h-4 ${doubt.starred ? "text-amber-400 fill-amber-400" : "text-slate-500"}`} />
                          </button>
                          <button 
                            onClick={(e) => deleteSavedDoubt(doubt.id, e)}
                            className="p-1 hover:text-white text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* original and rewrite preview content */}
                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Original Submission:</p>
                          <p className="text-xs text-slate-400 italic line-clamp-2">"{doubt.rawInput}"</p>
                        </div>

                        <div>
                          <p className="text-[10px] text-indigo-400 uppercase font-mono font-extrabold flex items-center gap-1">
                            🚀 Rephrased academic Question:
                          </p>
                          <p className="text-sm font-semibold text-white leading-relaxed line-clamp-3">
                            "{doubt.result.rewrittenDoubt}"
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Quick reload buttons */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(doubt.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>

                      <button 
                        onClick={() => {
                          setResult(doubt.result);
                          setInputText(doubt.rawInput);
                          setRewriteMode(doubt.mode as any);
                          setActiveTab("workspace");
                        }}
                        className="text-xs text-indigo-400 hover:text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Reload in Workspace
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Humble Footer */}
      <footer className="py-8 mt-12 bg-slate-900/40 border-t border-white/5 text-center text-xs text-slate-500 space-y-1">
        <p>Clarify AI Study Companion • Built using Google Gemini 3.5 Models</p>
        <p className="text-[10px] font-mono text-slate-600">Secure full-stack educational environment | Latency auto-optimized</p>
      </footer>

    </div>
  );
}
