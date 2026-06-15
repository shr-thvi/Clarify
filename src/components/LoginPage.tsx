import React, { useState } from "react";
import { LogIn, Mail, Lock, AlertCircle, Sparkles } from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (token: string, user: { id: string; email: string; name: string }) => void;
  onSwitchToSignup: () => void;
}

export default function LoginPage({ onLoginSuccess, onSwitchToSignup }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Store token
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      {/* Ambient glow background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg blur opacity-75" />
              <div className="relative w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
              Clarify
            </span>
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-slate-400">Sign in to your account to continue learning</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2 text-sm text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-white/5 focus:border-indigo-600/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-white/5 focus:border-indigo-600/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 bg-slate-950 accent-indigo-600"
            />
            <span className="text-slate-400">Keep me signed in for 30 days</span>
          </label>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-t-2 border-r-2 border-white animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-slate-900/60 text-slate-400">New to Clarify?</span>
          </div>
        </div>

        {/* Sign up link */}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="w-full py-2.5 bg-slate-950 border border-indigo-600/30 hover:border-indigo-600 text-indigo-400 hover:text-indigo-300 rounded-lg font-semibold text-sm uppercase tracking-wider transition-colors"
        >
          Create Account
        </button>

        {/* Demo credentials hint */}
        <div className="mt-6 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Demo Credentials:</p>
          <p>Email: demo@clarify.com</p>
          <p>Password: demo123</p>
          <p className="text-slate-500 text-[10px] mt-2">Or create a new account above</p>
        </div>
      </div>
    </div>
  );
}
