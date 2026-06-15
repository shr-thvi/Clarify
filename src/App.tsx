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
  ArrowLeft,
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
  FileText,
  LogOut,
  User,
  Settings,
  BookMarked,
  Gamepad2
} from "lucide-react";
import { DOUBT_EXAMPLES } from "./examples";
import { DoubtRewriteResult, SavedDoubt, User as UserType } from "./types";
import StatsDashboard from "./components/StatsDashboard";
import InteractiveSocraticChat from "./components/InteractiveSocraticChat";
import GamificationPanel from "./components/GamificationPanel";
import QuickQuiz from "./components/QuickQuiz";
import AnalyticsPanel from "./components/AnalyticsPanel";
import ReviewRequestsModal from "./components/ReviewRequestsModal";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import ProfilePage from "./components/ProfilePage";
import ProfileDropdown from "./components/ProfileDropdown";
import StudyResources from "./components/StudyResources";
import GamesSection from "./components/GamesSection";

type AppTab = "workspace" | "socratic" | "dashboard" | "library" | "resources" | "games";

export default function App() {
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [profileSection, setProfileSection] = useState<"overview" | "password">("overview");

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<AppTab>("workspace");
  const [previousTab, setPreviousTab] = useState<AppTab>("workspace");

  // Theme & profile settings
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });
  const [colorTheme, setColorTheme] = useState<string>(() => {
    if (typeof window === "undefined") return "indigo";
    return localStorage.getItem("color_theme") || localStorage.getItem("color-theme") || "indigo";
  });
  const [emailNotifications, setEmailNotifications] = useState(JSON.parse(localStorage.getItem("notifications") || "true"));
  const [privateProfile, setPrivateProfile] = useState(JSON.parse(localStorage.getItem("private-profile") || localStorage.getItem("private") || "false"));

  // Input states
  const [inputText, setInputText] = useState("");
  const [rewriteMode, setRewriteMode] = useState<"academic" | "concise" | "textbook" | "socratic">("academic");
  const [desiredOutputLang, setDesiredOutputLang] = useState<string>(localStorage.getItem("desired_output_lang") || "en");
  
  // OCR image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Loading & Result States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResultsState] = useState<DoubtRewriteResult[]>(() => {
    try {
      const saved = localStorage.getItem('clarify_results');
      const initial = saved ? JSON.parse(saved) : [];
      console.log('[INIT_RESULTS] Initializing results from localStorage, length:', initial.length);
      return initial;
    } catch (e) {
      console.error('[INIT_RESULTS_ERROR]', e);
      return [];
    }
  });

  // Persist results to localStorage
  useEffect(() => {
    console.log('[EFFECT_PERSIST] Saving results to localStorage, length:', results.length, 'content:', results?.map(r => r.rewrittenDoubt?.substring(0, 30)).join('|'));
    localStorage.setItem('clarify_results', JSON.stringify(results));
  }, [results]);

  const [ttsPlaying, setTtsPlaying] = useState(false);

  // Wrapper to log setResults calls
  const setResults = (value: any) => {
    if (typeof value === 'function') {
      // It's an updater function, call it with current results
      setResultsState(prev => {
        const newVal = value(prev);
        console.log('[SETRESULTS_UPDATE] prev length:', prev.length, 'new length:', newVal?.length, 'call stack:', new Error().stack?.split('\n').slice(1, 4).join(' | '));
        return newVal;
      });
    } else {
      console.log('[SETRESULTS_DIRECT] Setting to:', value?.length ?? 'not an array', 'call stack:', new Error().stack?.split('\n').slice(1, 4).join(' | '));
      setResultsState(value);
    }
  };

  // Derived result from array
  const result = results.length > 0 ? results[0] : null;

  // Debug: Track results state changes
  useEffect(() => {
    const stack = new Error().stack || '';
    const lines = stack.split('\n').slice(0, 10).join('\n');
    console.log(`[EFFECT-RESULTS] Updated to Length: ${results.length}\n${lines}`);
  }, [results]);

  // Library / Starred persistence
  const [savedDoubts, setSavedDoubts] = useState<SavedDoubt[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasStarredActive, setHasStarredActive] = useState(false);

  // Gamification state (streaks, xp, badges)
  const [gameState, setGameState] = useState<any>(() => {
    try {
      const raw = localStorage.getItem("clarify_gamification");
      return raw ? JSON.parse(raw) : { xp: 0, streak: 0, lastActive: null, badges: [] };
    } catch {
      return { xp: 0, streak: 0, lastActive: null, badges: [] };
    }
  });
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Daily reminders opt-in
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('clarify_reminders') || 'false'); } catch { return false; }
  });

  useEffect(() => {
    localStorage.setItem('clarify_reminders', JSON.stringify(remindersEnabled));
    if (remindersEnabled) {
      scheduleDailyReminder();
    }
  }, [remindersEnabled]);

  const scheduleDailyReminder = () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(() => {
        // try to send now
        trySendReminder();
      });
    } else {
      trySendReminder();
    }
  };

  const trySendReminder = () => {
    try {
      const last = localStorage.getItem('clarify_last_reminder');
      const today = new Date().toISOString().slice(0,10);
      if (last === today) return; // already sent today
      const streak = (gameState && gameState.streak) || 0;
      if (streak > 0) {
        const body = `Keep your study streak: ${streak} days! Open Clarify to earn more XP.`;
        if (Notification.permission === 'granted') {
          new Notification('Clarify — Study Streak Reminder', { body });
        } else {
          setErrorMessage(body);
          setTimeout(() => setErrorMessage(null), 3000);
        }
        localStorage.setItem('clarify_last_reminder', today);
      }
    } catch (e) {
      console.error('Reminder failed', e);
    }
  };

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

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const user = localStorage.getItem("auth_user");

        if (token && user) {
          // Verify token with backend
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
          
            setAuthToken(token);
            setCurrentUser(JSON.parse(user));
            setIsLoggedIn(true);
          } else {
            // Token expired, clear auth
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
          }
        }
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    document.body.style.backgroundColor = darkMode ? "#020617" : "#f8fafc";
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-color-theme", colorTheme || "indigo");
    localStorage.setItem("color_theme", colorTheme || "indigo");
    localStorage.setItem("color-theme", colorTheme || "indigo");
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(emailNotifications));
  }, [emailNotifications]);

  useEffect(() => {
    localStorage.setItem("desired_output_lang", desiredOutputLang);
  }, [desiredOutputLang]);

  useEffect(() => {
    localStorage.setItem("private-profile", JSON.stringify(privateProfile));
    localStorage.setItem("private", JSON.stringify(privateProfile));
  }, [privateProfile]);

  // Handle login success
  const handleLoginSuccess = (token: string, user: UserType) => {
    setAuthToken(token);
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowSignUp(false);
  };

  const handleUserUpdate = (updatedUser: UserType) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
  };

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleChangeTheme = (theme: string) => {
    setColorTheme(theme || "indigo");
  };

  const handleToggleNotifications = () => {
    setEmailNotifications((prev: boolean) => !prev);
  };

  const handleTogglePrivateProfile = () => {
    setPrivateProfile((prev: boolean) => !prev);
  };

  const handleOpenResources = () => {
    setShowProfile(false);
    setProfileSection("overview");
    setPreviousTab(activeTab);
    setActiveTab("resources");
  };

  const navigateToTab = (tab: AppTab) => {
    if (tab !== activeTab) {
      setPreviousTab(activeTab);
    }
    setActiveTab(tab);
    setErrorMessage(null);
  };

  const handleBack = () => {
    const fallbackTab = previousTab === activeTab ? "workspace" : previousTab;
    setActiveTab(fallbackTab);
    setPreviousTab("workspace");
    setErrorMessage(null);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
    } catch (e) {
      console.error("Logout failed", e);
    }

    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setAuthToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  // Show login/signup page if not authenticated
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return showSignUp ? (
      <SignUpPage
        onSignupSuccess={handleLoginSuccess}
        onSwitchToLogin={() => setShowSignUp(false)}
      />
    ) : (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => setShowSignUp(true)}
      />
    );
  }

  // Sync to local storage
  const syncSavedDoubts = (newList: SavedDoubt[]) => {
    setSavedDoubts(newList);
    try {
      localStorage.setItem("intelligent_doubts", JSON.stringify(newList));
    } catch (e) {
      console.error("Local storage save failed", e);
    }
  };

  // Gamification helpers
  const persistGameState = (nextState: any) => {
    try {
      localStorage.setItem("clarify_gamification", JSON.stringify(nextState));
    } catch (e) {
      console.error("Failed to persist game state", e);
    }
    setGameState(nextState);
  };

  const sendAnalytics = async (event: any) => {
    try {
      const key = 'clarify_analytics_events';
      const existingRaw = localStorage.getItem(key) || '[]';
      const existing = JSON.parse(existingRaw);
      existing.unshift({ ...event, timestamp: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 1000)));
      // Send to server but don't block on it
      fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event) }).catch(() => {});
    } catch (e) {
      console.error('analytics send failed', e);
    }
  };

  const awardActivity = (xpGain: number, note?: string) => {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const prev = gameState || { xp: 0, streak: 0, lastActive: null, badges: [] };
    let next = { ...prev };

    // XP
    next.xp = (next.xp || 0) + xpGain;

    // Streak logic: if lastActive is yesterday or today
    const last = next.lastActive;
    if (last === todayKey) {
      // already active today, just award xp
    } else {
      if (last) {
        const lastDate = new Date(last + "T00:00:00");
        const diff = Math.floor((today.setHours(0,0,0,0) - lastDate.getTime()) / (1000*60*60*24));
        if (diff === 1) {
          next.streak = (next.streak || 0) + 1;
        } else {
          next.streak = 1;
        }
      } else {
        next.streak = 1;
      }
      next.lastActive = todayKey;
    }

    // Random tiny chance for a badge
    if (Math.random() < 0.12) {
      const newBadge = ["Quick Thinker", "Accuracy Champ", "Curiosity Star", "Replay Master"][Math.floor(Math.random()*4)];
      next.badges = Array.from(new Set([...(next.badges||[]), newBadge]));
    }

    persistGameState(next);
    // Analytics
    try { sendAnalytics({ type: 'award_xp', xp: xpGain, streak: next.streak, note }); } catch {}
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

  const normalizeRewriteResult = (data: any, rawDoubt: string): DoubtRewriteResult => {
    const result = {
      originalDoubt: data.originalDoubt || rawDoubt || "",
      rewrittenDoubt: data.rewrittenDoubt || data.rewrittenQuestion || "",
      subject: data.subject || "General",
      confidence: typeof data.confidence === "number" ? (data.confidence <= 1 ? Math.round(data.confidence * 100) : Math.round(data.confidence)) : 0,
      confusionLevel: data.confusionLevel || data.confusionType || "Unknown",
      doubtQualityScore: typeof data.doubtQualityScore === "number" ? (data.doubtQualityScore <= 1 ? Math.round(data.doubtQualityScore * 100) : Math.round(data.doubtQualityScore)) : (typeof data.qualityScore === "number" ? (data.qualityScore <= 1 ? Math.round(data.qualityScore * 100) : Math.round(data.qualityScore)) : 0),
      doubtQualityTips: data.doubtQualityTips || data.tips || [],
      clarificationNeeded: data.clarificationNeeded ?? false,
      clarificationQuestion: data.clarificationQuestion || (Array.isArray(data.clarificationQuestions) ? data.clarificationQuestions[0] || "" : ""),
      recommendedKeywords: data.recommendedKeywords || data.keywords || [],
      explanation: data.explanation || "",
      answer: data.answer || "",
      relatedFormulas: data.relatedFormulas || data.formulas || [],
      additionalFollowUps: data.additionalFollowUps || data.followUpQuestions || [],
      isMultilingual: data.isMultilingual ?? false,
      detectedLanguages: data.detectedLanguages || []
    };

    if (!result.rewrittenDoubt) {
      result.rewrittenDoubt = data.rewrittenQuestion || data.rewrittenDoubt || "";
    }

    return result;
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

    try {
      const url = `${window.location.origin}/api/rewrite-doubt`;
      console.debug('POST', url, { rawDoubt: inputText, mode: rewriteMode });

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawDoubt: inputText,
          mode: rewriteMode,
          imageData: imageBase64,
          mimeType: imageMime,
          desiredOutputLang: desiredOutputLang
        }),
      });

      if (!response.ok) {
        let errText = await response.text().catch(() => '');
        try {
          const errObj = JSON.parse(errText || '{}');
          throw new Error(errObj.error || errText || "Failed to reach rewriter API.");
        } catch {
          throw new Error(errText || "Failed to reach rewriter API.");
        }
      }

      // Defensive parsing: server may return raw text or JSON
      let dataText = await response.text();
      console.debug('rewrite response raw:', dataText);
      let data: any;
      try {
        data = JSON.parse(dataText);
      } catch {
        try {
          // attempt to extract JSON from noisy text
          const start = dataText.indexOf('{');
          const end = dataText.lastIndexOf('}');
          if (start !== -1 && end !== -1) {
            data = JSON.parse(dataText.slice(start, end + 1));
          }
        } catch (e) {
          console.error('Failed to parse rewrite response', e);
        }
      }

      const normalizedResult = normalizeRewriteResult(data, inputText);

      if (!normalizedResult.rewrittenDoubt) {
        throw new Error('Invalid rewrite response shape — check server logs or browser console.');
      }

      // Save to query library history
      const newSavedItem: SavedDoubt = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        rawInput: inputText || "[Screen scanned OCR question]",
        mode: rewriteMode,
        result: normalizedResult,
        starred: false
      };

      const updatedHistory = [newSavedItem, ...savedDoubts];
      syncSavedDoubts(updatedHistory);
      setHasStarredActive(false);
      // Award gamification XP and update streak for successful use
      try {
        awardActivity(12, "Optimized a doubt");
      } catch (e) {
        console.error("Awarding activity failed", e);
      }

      // Set results LAST to ensure it displays properly after all other updates
      console.log('[CALL_1] About to call setResults from handleRephraseDoubt');
      setResults(prev => [normalizedResult, ...prev]);
      console.log('[CALL_1] setResults completed');

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
      const quickUrl = `${window.location.origin}/api/rewrite-doubt`;
      console.debug('Quick POST', quickUrl, { rawDoubt: rephrasedVal });
      fetch(quickUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawDoubt: rephrasedVal,
          mode: "academic",
          desiredOutputLang: desiredOutputLang
        }),
      })
      .then(async (res) => {
        const text = await res.text().catch(() => '');
        console.debug('Quick rewrite raw:', text);
        try { return JSON.parse(text); } catch { return JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}')+1)); }
      })
      .then((data) => {
        const normalizedResult = normalizeRewriteResult(data, rephrasedVal);
        console.log('[CALL_2] handleAdoptSocraticDoubt setResults');
        setResults(prev => [normalizedResult, ...prev]);
        const newSavedItem: SavedDoubt = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          rawInput: rephrasedVal,
          mode: "academic",
          result: normalizedResult,
          starred: false
        };
        syncSavedDoubts([newSavedItem, ...savedDoubts]);
      })
      .catch(err => setErrorMessage(err.message))
      .finally(() => setIsProcessing(false));
    }, 100);
  };

  const requestHumanReview = (note?: string) => {
    try {
      const existingRaw = localStorage.getItem("clarify_review_requests") || "[]";
      const existing = JSON.parse(existingRaw);
      const req = { id: Date.now().toString(), timestamp: new Date().toISOString(), doubt: result?.rewrittenDoubt || inputText, note: note || "User requested human review" };
      existing.unshift(req);
      localStorage.setItem("clarify_review_requests", JSON.stringify(existing));
      setErrorMessage("Request sent to human reviewer (simulated)");
      setTimeout(() => setErrorMessage(null), 2500);
      awardActivity(8, "Requested human review");
      try { sendAnalytics({ type: 'human_review_requested', note: note || null }); } catch {}
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to create review request");
      setTimeout(() => setErrorMessage(null), 2500);
    }
  };

  const downloadFile = (filename: string, content: string, mime = 'text/plain') => {
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const exportResult = (format: 'json' | 'md' | 'pdf' = 'json') => {
    if (!result) return;
    const lang = desiredOutputLang || 'en';
    const payload = {
      subject: result.subject,
      language: lang,
      rewritten: result.rewrittenDoubt,
      explanation: result.explanation,
      keywords: result.recommendedKeywords,
      formulas: result.relatedFormulas,
      timestamp: new Date().toISOString()
    };

    if (format === 'json') {
      downloadFile(`clarify-result-${Date.now()}.json`, JSON.stringify(payload, null, 2), 'application/json');
    } else if (format === 'md') {
      const md = `# ${payload.subject}\n\n**Language:** ${payload.language}\n\n**Rewritten:**\n${payload.rewritten}\n\n**Explanation:**\n${payload.explanation}\n\n**Keywords:** ${payload.keywords.join(', ')}\n`;
      downloadFile(`clarify-result-${Date.now()}.md`, md, 'text/markdown');
    } else if (format === 'pdf') {
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(`<pre style="font-family: serif; white-space: pre-wrap;">${payload.subject}\n\nLanguage: ${payload.language}\n\nRewritten:\n${payload.rewritten}\n\nExplanation:\n${payload.explanation}\n</pre>`);
      w.document.close();
      w.print();
    }

    try { sendAnalytics({ type: 'export', format, subject: result.subject }); } catch {}
  };

  // Preview translated/simulated output locally for demo purposes
  const handlePreviewOutput = () => {
    const lang = desiredOutputLang || 'en';
    const samples: any = {
      en: {
        rewrittenDoubt: "Why does current reverse in AC circuits? Please explain with step-by-step reasoning.",
        explanation: "In AC circuits, current direction alternates because the source voltage changes polarity periodically. Step 1: ...",
      },
      hi: {
        rewrittenDoubt: "AC सर्किट में करंट दिशा क्यों बदलती है? चरण-दर-चरण समझाइए।",
        explanation: "AC सर्किट में वोल्टेज की ध्रुवता समय के साथ बदलती है, जिससे करंट की दिशा बदलती है। चरण 1: ...",
      },
      es: {
        rewrittenDoubt: "¿Por qué cambia la dirección de la corriente en circuitos AC? Explíquelo paso a paso.",
        explanation: "En circuitos AC, la dirección de la corriente alterna porque la polaridad de la tensión cambia periódicamente. Paso 1: ...",
      }
    };

    const sample = samples[lang] || samples['en'];
    const fake: DoubtRewriteResult = {
      originalDoubt: inputText || "current kyu reverse hota ha",
      rewrittenDoubt: sample.rewrittenDoubt,
      subject: "Physics",
      confidence: 92,
      confusionLevel: "Conceptual",
      doubtQualityScore: 82,
      doubtQualityTips: ["Be explicit about the component you mean", "Specify units when possible"],
      clarificationNeeded: false,
      clarificationQuestion: "",
      recommendedKeywords: ["AC circuits","alternating current","polarity"],
      explanation: sample.explanation,
      relatedFormulas: ["I = V/R (instantaneous)", "V(t)=Vmax sin(ωt)"],
      additionalFollowUps: [],
      isMultilingual: lang !== 'en',
      detectedLanguages: lang === 'auto' ? ['en'] : [lang]
    };

    console.log('[CALL_3] Demo preview setResults');
    setResults(prev => [fake, ...prev]);
  };

  // Try server-side translation, fallback to local preview if server missing
  const translateResult = async (targetLang: string) => {
    if (results.length === 0) return;
    const currentResult = results[0];
    if (targetLang === 'auto') {
      setErrorMessage('Auto-detect selected; no translation performed');
      setTimeout(() => setErrorMessage(null), 1600);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const url = `${window.location.origin}/api/translate`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentResult.explanation || currentResult.rewrittenDoubt, targetLang })
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        const translated = data.translatedText || data.text || null;
        if (translated) {
          console.log('[CALL_4] Translation result setResults');
          setResults(prev => [{ ...prev[0], explanation: translated, isMultilingual: true, detectedLanguages: [targetLang] }, ...prev.slice(1)]);
          try { sendAnalytics({ type: 'translate', targetLang }); } catch {}
          setErrorMessage(`Translated to ${targetLang}`);
          setTimeout(() => setErrorMessage(null), 2000);
          return;
        }
      }

      // fallback to preview samples
      handlePreviewOutput();
      setErrorMessage('Translation service unavailable — showing simulated translation');
      setTimeout(() => setErrorMessage(null), 2200);
    } catch (e) {
      console.error('Translation failed', e);
      handlePreviewOutput();
      setErrorMessage('Translation failed — showing simulated translation');
      setTimeout(() => setErrorMessage(null), 2200);
    } finally {
      setIsProcessing(false);
    }
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

  // Show profile page if open
  if (showProfile) {
    return (
      <ProfilePage
        user={currentUser}
        initialSection={profileSection}
        darkMode={darkMode}
        colorTheme={colorTheme}
        notifications={emailNotifications}
        privateProfile={privateProfile}
        onUserUpdate={handleUserUpdate}
        onToggleDarkMode={handleToggleDarkMode}
        onChangeTheme={handleChangeTheme}
        onToggleNotifications={handleToggleNotifications}
        onTogglePrivateProfile={handleTogglePrivateProfile}
        onOpenResources={handleOpenResources}
        onLogout={handleLogout}
        onClose={() => {
          setShowProfile(false);
          setProfileSection("overview");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <nav className="border-b border-white/5 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-white/10">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="clarify-brand-name text-lg font-bold text-gray-900 dark:text-white">
                  Clarify
                </span>
                <span className="text-[9px] uppercase tracking-widest font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI Doubt Optimizer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium font-mono">Reframe ambiguous queries into pristine academic logic</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-center sm:self-auto overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => navigateToTab("workspace")}
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
              onClick={() => navigateToTab("socratic")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "socratic"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Socratic Assistant
            </button>
            <button
              onClick={() => navigateToTab("dashboard")}
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
              onClick={() => navigateToTab("library")}
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
            <button
              onClick={() => navigateToTab("resources")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "resources"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              Study Resources
            </button>
            <button
              onClick={() => navigateToTab("games")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === "games"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              Games & Quizzes
            </button>
          </div>

          <ProfileDropdown
            user={currentUser}
            darkMode={darkMode}
            colorTheme={colorTheme}
            notifications={emailNotifications}
            privateProfile={privateProfile}
            onUserUpdate={handleUserUpdate}
            onToggleDarkMode={handleToggleDarkMode}
            onChangeTheme={handleChangeTheme}
            onToggleNotifications={handleToggleNotifications}
            onTogglePrivateProfile={handleTogglePrivateProfile}
            onOpenProfile={(section = "overview") => {
              setProfileSection(section);
              setShowProfile(true);
            }}
            onOpenResources={handleOpenResources}
            onLogout={handleLogout}
          />
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-sm text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Setup / Configuration Warning</p>
              <p className="opacity-90">{errorMessage}</p>
            </div>
          </div>
        )}

        {activeTab !== "workspace" && (
          <button
            onClick={handleBack}
            className="mb-6 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/70 border border-white/5 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        )}

        {activeTab === "workspace" && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/60 dark:bg-gradient-to-r dark:from-indigo-950/60 dark:to-slate-900/60 border border-white/5 dark:border-indigo-500/10 shadow-sm">
              <div className="space-y-1">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white dark:text-white">
                  <Flame className="w-5 h-5 text-indigo-400" />
                  Intelligent Study Query Optimizer
                </h2>
                <p className="text-xs max-w-2xl leading-relaxed text-slate-300 dark:text-slate-400">
                  Type a rough student doubt, copy Hinglish code errors, or drop a picture of textbook calculations. The AI engine translates dialects, corrects spelling, identifies subjects, and generates academic search terms with step-by-step solutions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl shrink-0 self-start md:self-auto bg-slate-900 dark:bg-slate-950 border border-white/5 dark:border-white/5">
                {(["academic", "concise", "textbook", "socratic"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setRewriteMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      rewriteMode === mode
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 border border-white/5 dark:border-white/5"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
                <select
                  value={desiredOutputLang}
                  onChange={(e) => setDesiredOutputLang(e.target.value)}
                  className={`ml-2 text-xs rounded-lg px-2 py-1 border transition-colors ${
                    darkMode
                      ? "bg-slate-800 text-slate-200 border-white/5"
                      : "bg-white text-slate-900 border-slate-300 shadow-sm"
                  }`}
                  title="Desired output language"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="auto">Auto-detect</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleRephraseDoubt();
                        }
                      }}
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
                      className={`px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border ${
                        darkMode 
                          ? "hover:bg-slate-800 text-slate-400 hover:text-white border-white/5"
                          : "hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-300"
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Fields
                    </button>

                    {/* Clear history utility */}
                    {results.length > 0 && (
                      <button 
                        type="button"
                        onClick={() => { console.log('[CALL_CLEAR_1] Clear button 1 clicked'); setResults([]); }}
                        className={`px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border ${
                          darkMode
                            ? "hover:bg-slate-800 text-slate-400 hover:text-white border-white/5"
                            : "hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-300"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear History ({results.length})
                      </button>
                    )}

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

                {/* Conversation History Section */}
                {results.length > 0 && (
                  <div className="space-y-4">
                    {/* Conversation Header */}
                    <div className={`flex items-center justify-between px-6 py-4 rounded-xl border transition-colors ${
                      darkMode
                        ? "bg-gradient-to-r from-indigo-900/30 to-slate-900/50 border-indigo-500/20"
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300"
                    }`}>
                      <div>
                        <p className={`text-xs uppercase font-mono tracking-widest font-bold ${
                          darkMode ? "text-indigo-400" : "text-blue-600"
                        }`}>💬 Conversation History</p>
                        <p className={`text-sm mt-1 ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}>{results.length} question{results.length !== 1 ? 's' : ''} answered • Scroll to see all responses</p>
                      </div>
                      {results.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => { console.log('[CALL_CLEAR_2] Clear button 2 clicked'); setResults([]); }}
                          className={`px-3.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-1.5 border ${
                            darkMode
                              ? "hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border-transparent hover:border-rose-500/20"
                              : "hover:bg-rose-100 text-slate-600 hover:text-rose-600 border-transparent hover:border-rose-300"
                          }`}
                          title="Clear all conversation history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Results List */}
                    <div className="space-y-4">
                      {results.map((result, idx) => (
                        <div key={idx} className="group">
                          {/* Question Bubble */}
                          <div className="mb-3 flex justify-end">
                            <div className={`max-w-2xl px-4 py-3 rounded-2xl rounded-tr-lg border transition-colors ${
                              darkMode
                                ? "bg-indigo-600/20 border-indigo-500/30"
                                : "bg-blue-100 border-blue-300 shadow-sm"
                            }`}>
                              <p className={`text-sm ${
                                darkMode ? "text-slate-100" : "text-slate-900"
                              }`}>{result.originalDoubt}</p>
                            </div>
                          </div>

                          {/* Answer Bubble */}
                          <div className="flex justify-start">
                            <div className={`max-w-3xl w-full p-6 rounded-2xl rounded-tl-lg border space-y-6 animate-fade-in transition-colors ${
                              darkMode
                                ? "bg-slate-900/80 border-white/10 hover:border-white/20"
                                : "bg-white border-slate-300 shadow-md hover:shadow-lg"
                            }`}>
                              
                              {/* Top Header with Subject & Confidence */}
                              <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b ${
                                darkMode ? "border-white/10" : "border-slate-300"
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg border flex items-center justify-center ${getSubjectIconClass(result.subject).color}`}>
                                    {getSubjectIconClass(result.subject).icon}
                                  </div>
                                  <div>
                                    <p className={`text-[10px] uppercase tracking-wider font-bold ${
                                      darkMode ? "text-slate-400" : "text-slate-600"
                                    }`}>Subject</p>
                                    <p className={`font-semibold ${
                                      darkMode ? "text-white" : "text-slate-900"
                                    }`}>{result.subject}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-right flex-col md:flex-row">
                                  <div className="flex items-center gap-2 flex-wrap justify-end">
                                    {result.detectedLanguages && result.detectedLanguages.length > 0 && (
                                      <span className={`flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase rounded border transition-colors ${
                                        darkMode
                                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                          : "bg-purple-100 text-purple-700 border-purple-300"
                                      }`}>
                                        <Languages className="w-2.5 h-2.5" />
                                        {result.detectedLanguages.join(', ')}
                                      </span>
                                    )}
                                    {result.isMultilingual && (
                                      <span className={`flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase rounded border transition-colors ${
                                        darkMode
                                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                          : "bg-blue-100 text-blue-700 border-blue-300"
                                      }`}>
                                        <Languages className="w-2.5 h-2.5" />
                                        Translated
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-[9px] uppercase font-bold ${
                                      darkMode ? "text-slate-400" : "text-slate-600"
                                    }`}>Confidence</p>
                                    <p className={`text-sm font-bold ${
                                      darkMode ? "text-emerald-400" : "text-green-600"
                                    }`}>{result.confidence}%</p>
                                  </div>
                                </div>
                              </div>

                              {/* Optimized Query Box */}
                              <div className={`p-4 rounded-xl border transition-colors ${
                                darkMode
                                  ? "bg-gradient-to-r from-indigo-900/20 to-slate-950 border-indigo-500/20"
                                  : "bg-blue-50 border-blue-200"
                              }`}>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <p className={`text-[10px] uppercase font-mono tracking-wider font-bold ${
                                    darkMode ? "text-indigo-400" : "text-blue-600"
                                  }`}>✨ Optimized Query</p>
                                  <button 
                                    onClick={() => copyToClipboard(result.rewrittenDoubt, `rewritten-${idx}`)}
                                    className={`px-2 py-1 rounded text-[9px] font-semibold transition-colors flex items-center gap-1 border ${
                                      copiedId === `rewritten-${idx}`
                                        ? "bg-emerald-500 text-white border-emerald-500"
                                        : darkMode
                                        ? "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                                        : "bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300"
                                    }`}
                                  >
                                    {copiedId === `rewritten-${idx}` ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        Copy
                                      </>
                                    )}
                                  </button>
                                </div>
                                <p className={`text-sm font-semibold leading-relaxed italic ${
                                  darkMode ? "text-white" : "text-slate-900"
                                }`}>"{result.rewrittenDoubt}"</p>
                              </div>

                              {/* Answer Section */}
                              {result.answer && (
                                <div className={`p-4 rounded-xl border transition-colors ${
                                  darkMode
                                    ? "bg-gradient-to-r from-emerald-900/20 to-slate-950 border-emerald-500/20"
                                    : "bg-emerald-50 border-emerald-200"
                                }`}>
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <p className={`text-[10px] uppercase font-mono tracking-wider font-bold ${
                                      darkMode ? "text-emerald-400" : "text-emerald-600"
                                    }`}>✅ Direct Answer</p>
                                    <button 
                                      onClick={() => copyToClipboard(result.answer, `answer-${idx}`)}
                                      className={`px-2 py-1 rounded text-[9px] font-semibold transition-colors flex items-center gap-1 border ${
                                        copiedId === `answer-${idx}`
                                          ? "bg-emerald-500 text-white border-emerald-500"
                                          : darkMode
                                          ? "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                                          : "bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300"
                                      }`}
                                    >
                                      {copiedId === `answer-${idx}` ? (
                                        <>
                                          <Check className="w-3 h-3" />
                                          Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          Copy
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <p className={`text-sm font-semibold leading-relaxed ${
                                    darkMode ? "text-emerald-100" : "text-emerald-900"
                                  }`}>{result.answer}</p>
                                </div>
                              )}

                              {/* Explanation Section */}
                              {result.explanation && (
                                <div className={`p-4 rounded-xl border transition-colors ${
                                  darkMode
                                    ? "bg-gradient-to-r from-cyan-900/20 to-slate-950 border-cyan-500/20"
                                    : "bg-cyan-50 border-cyan-200"
                                }`}>
                                  <p className={`text-[10px] uppercase font-mono tracking-wider font-bold mb-2 ${
                                    darkMode ? "text-cyan-400" : "text-cyan-600"
                                  }`}>📚 Detailed Explanation</p>
                                  <p className={`text-sm leading-relaxed ${
                                    darkMode ? "text-cyan-100" : "text-cyan-900"
                                  }`}>{result.explanation}</p>
                                </div>
                              )}

                              {/* Quality Score */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className={`p-3 rounded-lg transition-colors ${
                                  darkMode ? "bg-slate-950" : "bg-slate-100"
                                }`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[10px] font-semibold ${
                                      darkMode ? "text-slate-400" : "text-slate-600"
                                    }`}>Quality Score</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                      result.doubtQualityScore > 75 
                                        ? "bg-emerald-500/10 text-emerald-400" 
                                        : result.doubtQualityScore > 40
                                        ? "bg-amber-500/10 text-amber-400"
                                        : "bg-rose-500/10 text-rose-400"
                                    }`}>
                                      {result.doubtQualityScore}%
                                    </span>
                                  </div>
                                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                                    darkMode ? "bg-slate-800" : "bg-slate-300"
                                  }`}>
                                    <div 
                                      className={`h-full rounded-full ${
                                        result.doubtQualityScore > 75 
                                          ? "bg-emerald-500" 
                                          : result.doubtQualityScore > 40
                                          ? "bg-amber-500"
                                          : "bg-rose-500"
                                      }`}
                                      style={{ width: `${result.doubtQualityScore}%` }}
                                    />
                                  </div>
                                </div>

                                <div className={`p-3 rounded-lg transition-colors ${
                                  darkMode ? "bg-slate-950" : "bg-slate-100"
                                }`}>
                                  <p className={`text-[10px] font-semibold mb-2 ${
                                    darkMode ? "text-slate-400" : "text-slate-600"
                                  }`}>Confusion Level</p>
                                  <p className={`text-sm font-bold ${
                                    darkMode ? "text-indigo-400" : "text-blue-600"
                                  }`}>{result.confusionLevel}</p>
                                </div>
                              </div>

                              {/* Keywords */}
                              {result.recommendedKeywords.length > 0 && (
                                <div>
                                  <p className={`text-[10px] font-bold mb-2 uppercase ${
                                    darkMode ? "text-slate-400" : "text-slate-600"
                                  }`}>Search Keywords</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {result.recommendedKeywords.map((tag) => (
                                      <span key={tag} className={`px-2 py-1 rounded-full border text-[9px] font-mono cursor-pointer transition-colors ${
                                        darkMode
                                          ? "bg-slate-800 border-white/10 text-slate-300 hover:border-indigo-500/50"
                                          : "bg-slate-100 border-slate-300 text-slate-700 hover:border-blue-400"
                                      }`}>
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className={`flex flex-wrap gap-2 pt-3 border-t ${
                                darkMode ? "border-white/10" : "border-slate-300"
                              }`}>
                                <button 
                                  onClick={() => copyToClipboard(result.explanation, `explanation-${idx}`)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1.5 border ${
                                    darkMode
                                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10"
                                      : "bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300"
                                  }`}
                                >
                                  <Copy className="w-3 h-3" />
                                  Copy Explanation
                                </button>
                                <button 
                                  onClick={() => toggleStar(`${idx}-result`, undefined)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1.5 border ${
                                    hasStarredActive
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                      : darkMode
                                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10"
                                      : "bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300"
                                  }`}
                                >
                                  <Star className="w-3 h-3" fill="currentColor" />
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Divider */}
                          {idx < results.length - 1 && (
                            <div className="my-6 flex items-center gap-3">
                              <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent ${
                                darkMode ? "via-slate-700" : "via-slate-400"
                              }`} />
                              <span className={`text-[10px] font-mono uppercase ${
                                darkMode ? "text-slate-500" : "text-slate-600"
                              }`}>Q&A #{results.length - idx}</span>
                              <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent ${
                                darkMode ? "via-slate-700" : "via-slate-400"
                              }`} />
                            </div>
                          )}
                        </div>
                      ))}
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
                      <span className="font-mono font-bold text-white bg-indigo-500/10 px-1.5 py-0.5 rounded">
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

                <div className="mt-4 space-y-3">
                  <QuickQuiz result={result} onCorrect={(xp: number) => { awardActivity(xp); try { sendAnalytics({ type: 'quiz_correct', xp }); } catch {} }} />
                  <AnalyticsPanel />
                </div>
                <div className="mt-3 p-3 bg-slate-900/50 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="text-sm text-slate-300">Daily streak reminders</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setRemindersEnabled(prev => !prev); try { sendAnalytics({ type: 'toggle_reminders', enabled: !remindersEnabled }); } catch {} }} className={`px-3 py-1 text-xs rounded-lg transition-colors border ${remindersEnabled ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-600 dark:border-emerald-600' : 'bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-white/5'}`}>
                      {remindersEnabled ? 'Enabled' : 'Enable'}
                    </button>
                    <button onClick={() => { setShowReviewModal(true); try { sendAnalytics({ type: 'open_review_modal' }); } catch {} }} className="px-3 py-1 text-xs rounded-lg transition-colors border bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-white/5 dark:hover:bg-slate-700">Manage Reviews</button>
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
                console.log('[CALL_5] Saved doubt click setResults');
                setResults(prev => [savedItem.result, ...prev]);
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
                          console.log('[CALL_6] Library doubt click setResults');
                          setResults(prev => [doubt.result, ...prev]);
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

        {/* 5. STUDY MATERIALS & RESOURCES */}
        {activeTab === "resources" && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900/60 rounded-2xl border border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-amber-400" />
                Study Materials & Resources
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Browse curated videos, guides, courses, notes, and interactive tools by subject and difficulty.
              </p>
            </div>

            <StudyResources />
          </div>
        )}

        {/* 6. GAMES & QUIZZES */}
        {activeTab === "games" && (
          <div className="space-y-6">
            <GamesSection 
              onXPEarned={(xp: number) => { awardActivity(xp, "Completed a game"); try { sendAnalytics({ type: 'game_xp_earned', xp }); } catch {} }}
              userXP={gameState?.xp || 0}
            />
          </div>
        )}

      </main>

      {/* Humble Footer */}
      <footer className="py-8 mt-12 bg-slate-900/40 border-t border-white/5 text-center text-xs text-slate-500 space-y-1">
        <p>Clarify AI Study Companion • Built using Google Gemini 3.5 Models</p>
        <p className="text-[10px] font-mono text-slate-600">Secure full-stack educational environment | Latency auto-optimized</p>
        <div className="mt-2">
          <button onClick={() => setShowReviewModal(true)} className="text-[11px] text-slate-300 underline">Manage Review Requests</button>
        </div>
      </footer>

      <ReviewRequestsModal open={showReviewModal} onClose={() => setShowReviewModal(false)} />

    </div>
  );
}
