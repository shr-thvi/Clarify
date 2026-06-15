import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Lock,
  Trash2,
  AlertCircle,
  Check,
  Moon,
  Sun,
  Bell,
  Shield,
  Palette,
  ChevronRight,
  Edit2,
  Eye,
  EyeOff
} from "lucide-react";
import { User as UserType } from "../types";

type SettingsSection = "overview" | "password";

interface ProfilePageProps {
  user: UserType | null;
  initialSection?: SettingsSection;
  darkMode: boolean;
  colorTheme: string;
  notifications: boolean;
  privateProfile: boolean;
  onUserUpdate: (user: UserType) => void;
  onToggleDarkMode: () => void;
  onChangeTheme: (theme: string) => void;
  onToggleNotifications: () => void;
  onTogglePrivateProfile: () => void;
  onOpenResources: () => void;
  onLogout: () => void;
  onClose: () => void;
}

export default function ProfilePage({
  user,
  initialSection = "overview",
  darkMode,
  colorTheme,
  notifications,
  privateProfile,
  onUserUpdate,
  onToggleDarkMode,
  onChangeTheme,
  onToggleNotifications,
  onTogglePrivateProfile,
  onOpenResources,
  onLogout,
  onClose,
}: ProfilePageProps) {
  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user?.name, user?.email]);

  const handleSaveProfile = async () => {
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim()) {
      setError("Name and email cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Profile update failed");

      const updatedUser = data.user;
      if (updatedUser) {
        onUserUpdate(updatedUser);
      }

      setSuccess(data.message || "Profile updated successfully!");
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || "Profile update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Password change failed");

      setSuccess(data.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setActiveSection("overview");
    } catch (err: any) {
      setError(err.message || "Password change failed");
    } finally {
      setIsLoading(false);
    }
  };

  const closePasswordForm = () => {
    setActiveSection("overview");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswords(false);
    setError(null);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Account deletion failed");

      setSuccess(data.message || "Account deleted successfully");
      setTimeout(() => onLogout(), 800);
    } catch (err: any) {
      setError(err.message || "Account deletion failed");
      setIsLoading(false);
    }
  };

  const themeOptions = [
    { name: "indigo", buttonClass: "bg-indigo-600 border-indigo-400" },
    { name: "violet", buttonClass: "bg-violet-600 border-violet-400" },
    { name: "blue", buttonClass: "bg-blue-600 border-blue-400" },
    { name: "emerald", buttonClass: "bg-emerald-600 border-emerald-400" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-400" />
            Account Settings
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenResources}
              className="px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-700/40 border border-slate-700/50 transition-colors"
            >
              View Study Resources
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Success Message */}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3 text-sm text-emerald-300">
            <Check className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-3 text-sm text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Profile Information
            </h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 focus:border-indigo-600/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 focus:border-indigo-600/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setName(user?.name || "");
                    setEmail(user?.email || "");
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Name</span>
                </div>
                <span className="font-semibold text-white">{name}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email</span>
                </div>
                <span className="font-semibold text-white">{email}</span>
              </div>
            </div>
          )}
        </div>

        {/* Security Options */}
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              Security
            </h2>
            {activeSection === "password" && (
              <button
                onClick={closePasswordForm}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Back to Options
              </button>
            )}
          </div>

          {activeSection === "overview" ? (
            <button
              onClick={() => {
                setActiveSection("password");
                setError(null);
                setSuccess(null);
              }}
              className="w-full p-4 bg-slate-950/50 hover:bg-slate-950/70 border border-white/5 hover:border-amber-500/30 rounded-xl transition-all text-left flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Change Password</p>
                  <p className="text-xs text-slate-400">Update your current password with a new secure password.</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm font-semibold text-amber-300">Change Password</p>
                <p className="text-xs text-slate-400 mt-1">Enter your old password, then choose and confirm your new password.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 focus:border-indigo-600/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-400"
                      title={showPasswords ? "Hide passwords" : "Show passwords"}
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    New Password
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 focus:border-indigo-600/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Confirm Password
                  </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 focus:border-indigo-600/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
                />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex-1"
                >
                  Update Password
                </button>
                <button
                  onClick={closePasswordForm}
                  disabled={isLoading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme & Appearance */}
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Palette className="w-5 h-5 text-violet-400" />
            Appearance
          </h2>
          
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg hover:bg-slate-950/70 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-4 h-4 text-violet-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
              <div>
                <p className="text-sm font-semibold text-white">Dark Mode</p>
                <p className="text-xs text-slate-400">{darkMode ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? "bg-indigo-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Color Theme
            </label>
            <div className="grid grid-cols-4 gap-2">
              {themeOptions.map((t) => (
                <button
                  key={t.name}
                  onClick={() => onChangeTheme(t.name)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold uppercase transition-all border-2 ${
                    colorTheme === t.name
                      ? `${t.buttonClass} text-white`
                      : "bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Privacy & Notifications */}
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Privacy & Notifications
          </h2>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg hover:bg-slate-950/70 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-sm font-semibold text-white">Email Notifications</p>
                <p className="text-xs text-slate-400">{notifications ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
            <button
              onClick={onToggleNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? "bg-emerald-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg hover:bg-slate-950/70 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-sm font-semibold text-white">Private Profile</p>
                <p className="text-xs text-slate-400">{privateProfile ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
            <button
              onClick={onTogglePrivateProfile}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privateProfile ? "bg-blue-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privateProfile ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-slate-900/60 border border-rose-500/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-rose-400">
            <AlertCircle className="w-5 h-5" />
            Danger Zone
          </h2>
          <button
            onClick={handleDeleteAccount}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 rounded-lg text-sm font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account Permanently
          </button>
          <p className="text-xs text-slate-400">This action cannot be undone. All your data will be permanently deleted.</p>
        </div>

      </main>
    </div>
  );
}
