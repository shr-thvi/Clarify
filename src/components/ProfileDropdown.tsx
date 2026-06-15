import React, { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, ChevronDown, Moon, Sun, Edit2, Check, X, Lock, BookOpen } from "lucide-react";
import { User as UserType } from "../types";

type ProfileSection = "overview" | "password";

interface ProfileDropdownProps {
  user: UserType | null;
  darkMode: boolean;
  colorTheme: string;
  notifications: boolean;
  privateProfile: boolean;
  onUserUpdate: (user: UserType) => void;
  onToggleDarkMode: () => void;
  onChangeTheme: (theme: string) => void;
  onToggleNotifications: () => void;
  onTogglePrivateProfile: () => void;
  onOpenProfile: (section?: ProfileSection) => void;
  onOpenResources: () => void;
  onLogout: () => void;
}

export default function ProfileDropdown({
  user,
  darkMode,
  colorTheme,
  notifications,
  privateProfile,
  onUserUpdate,
  onToggleDarkMode,
  onChangeTheme,
  onToggleNotifications,
  onTogglePrivateProfile,
  onOpenProfile,
  onOpenResources,
  onLogout,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setEditedName(user?.name || "");
  }, [user?.name]);

  const handleSaveName = async () => {
    if (user && editedName.trim()) {
      const updatedUser = { ...user, name: editedName } as UserType;
      onUserUpdate(updatedUser);
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.name || "");
    setIsEditingName(false);
  };

  const themeColors = [
    { name: "indigo", color: "bg-indigo-600" },
    { name: "violet", color: "bg-violet-600" },
    { name: "blue", color: "bg-blue-600" },
    { name: "emerald", color: "bg-emerald-600" },
    { name: "light", color: "bg-slate-100 border-slate-300" },
    { name: "vibrant", color: "bg-purple-400" },
    { name: "bright", color: "bg-pink-500" }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/50 transition-all"
        title="Profile menu"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold text-slate-200">{user?.name?.split(" ")[0]}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden">
          
          {/* User Info Section */}
          <div className="p-4 border-b border-slate-700/30 bg-slate-800/30">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">
                  Logged in as
                </p>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm bg-slate-950 border border-indigo-500/30 rounded text-white focus:outline-none focus:border-indigo-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-2 py-1 bg-slate-700/20 hover:bg-slate-700/30 border border-slate-600/30 rounded text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 hover:bg-slate-700/40 rounded text-slate-400 hover:text-indigo-400"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Settings Section */}
          <div className="p-4 border-b border-slate-700/30 space-y-4">
            
            {/* Dark Mode Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {darkMode ? <Moon className="w-3.5 h-3.5 inline mr-1" /> : <Sun className="w-3.5 h-3.5 inline mr-1" />}
                  Dark Mode
                </label>
                <button
                  onClick={onToggleDarkMode}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    darkMode ? "bg-indigo-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                {darkMode ? "Enabled" : "Disabled"}
              </p>
            </div>

            {/* Color Theme */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
                <Settings className="w-3.5 h-3.5 inline mr-1" />
                Color Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {themeColors.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => { onChangeTheme(t.name); setIsOpen(false); }}
                    className={`p-3 rounded-lg border-2 transition-all text-xs font-semibold capitalize text-center ${
                      colorTheme === t.name
                        ? `${t.color} border-white`
                        : `${t.color} opacity-40 hover:opacity-60 border-transparent`
                    }`}
                    title={t.name}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Notifications
                </label>
                <button
                  onClick={onToggleNotifications}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notifications ? "bg-indigo-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                {notifications ? "Enabled" : "Disabled"}
              </p>
            </div>

            {/* Private Profile */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Private Profile
                </label>
                <button
                  onClick={onTogglePrivateProfile}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    privateProfile ? "bg-indigo-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privateProfile ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                {privateProfile ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-800/20 border-t border-slate-700/30">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenProfile("password");
              }}
              className="w-full mb-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenProfile("overview");
              }}
              className="w-full mb-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-700/40 border border-slate-600/30 hover:border-slate-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Account Settings
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenResources();
              }}
              className="w-full px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-200 hover:text-white hover:bg-indigo-600/10 border border-indigo-500/20 hover:border-indigo-400/40 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Study Resources
            </button>
          </div>

          {/* Logout Button */}
          <div className="p-3 bg-slate-800/20 border-t border-slate-700/30">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
