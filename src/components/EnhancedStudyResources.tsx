import React, { useState } from "react";
import { BookOpen, Search, Star, Filter, Download, ExternalLink, Award, Users, BarChart3 } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  subject: string;
  type: "tutorial" | "article" | "video" | "practice" | "book";
  difficulty: "beginner" | "intermediate" | "advanced";
  rating: number;
  downloads: number;
  instructors: string;
  duration?: string;
}

interface StudyResourcesProps {
  onClose: () => void;
}

export default function StudyResources({ onClose }: StudyResourcesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const resources: Resource[] = [
    {
      id: "1",
      title: "Calculus Fundamentals: Limits & Continuity",
      subject: "Mathematics",
      type: "tutorial",
      difficulty: "beginner",
      rating: 4.8,
      downloads: 2345,
      instructors: "Dr. James Wilson",
      duration: "4.5 hours",
    },
    {
      id: "2",
      title: "Quantum Mechanics Deep Dive",
      subject: "Physics",
      type: "article",
      difficulty: "advanced",
      rating: 4.6,
      downloads: 1890,
      instructors: "Prof. Sarah Chen",
    },
    {
      id: "3",
      title: "Chemical Bonding Explained",
      subject: "Chemistry",
      type: "video",
      difficulty: "intermediate",
      rating: 4.9,
      downloads: 3456,
      instructors: "Dr. Michael Brown",
      duration: "2.5 hours",
    },
    {
      id: "4",
      title: "Biology: Cell Structures & Functions",
      subject: "Biology",
      type: "practice",
      difficulty: "beginner",
      rating: 4.7,
      downloads: 1234,
      instructors: "Dr. Emma Davis",
    },
    {
      id: "5",
      title: "Advanced Algebra Problem Sets",
      subject: "Mathematics",
      type: "practice",
      difficulty: "advanced",
      rating: 4.5,
      downloads: 967,
      instructors: "Prof. Robert King",
    },
    {
      id: "6",
      title: "Physics Mechanics: Comprehensive Guide",
      subject: "Physics",
      type: "book",
      difficulty: "intermediate",
      rating: 4.8,
      downloads: 2105,
      instructors: "Dr. Thomas Harris",
    },
  ];

  const subjects = ["all", "Mathematics", "Physics", "Chemistry", "Biology"];
  const types = ["all", "tutorial", "article", "video", "practice", "book"];
  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.instructors.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === "all" || res.subject === selectedSubject;
    const matchesType = selectedType === "all" || res.type === selectedType;
    const matchesDifficulty = selectedDifficulty === "all" || res.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesType && matchesDifficulty;
  });

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((bid) => bid !== id) : [...prev, id]
    );
  };

  const TypeIcon = ({ type }: { type: string }) => {
    const icons = {
      tutorial: "📚",
      article: "📄",
      video: "🎥",
      practice: "✏️",
      book: "📖",
    };
    return <span>{icons[type as keyof typeof icons]}</span>;
  };

  const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
    const colors = {
      beginner: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
      intermediate: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
      advanced: "bg-rose-500/20 border-rose-500/40 text-rose-300",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[difficulty as keyof typeof colors]}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center z-50 p-4 backdrop-blur-xl overflow-y-auto">
      <style>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .modal-card { animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .resource-card {
          background: linear-gradient(135deg, rgba(20, 30, 48, 0.8) 0%, rgba(15, 23, 42, 0.5) 100%);
          transition: all 0.3s ease;
        }
        .resource-card:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 15px 40px rgba(99, 102, 241, 0.1);
        }
        .filter-badge {
          transition: all 0.3s ease;
        }
        .filter-badge.active {
          background: rgba(99, 102, 241, 0.3);
          border-color: rgba(99, 102, 241, 0.6);
          color: rgba(99, 102, 241, 1);
        }
      `}
      </style>

      <div className="modal-card bg-slate-950 border border-slate-700/50 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="relative z-20 p-8 border-b border-slate-700/30 bg-gradient-to-r from-slate-900/80 via-indigo-900/30 to-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-400/30 to-blue-600/30 flex items-center justify-center border border-indigo-400/60">
                <BookOpen className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Study Resources Library</h2>
                <p className="text-xs text-slate-400 mt-1">📚 Curated Learning Materials & Expert Content</p>
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

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search resources, instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="relative z-10 px-8 py-6 border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-300">FILTERS:</span>
          </div>

          <div className="space-y-3">
            {/* Subject Filter */}
            <div>
              <p className="text-xs text-slate-400 font-bold mb-2">SUBJECT</p>
              <div className="flex gap-2 flex-wrap">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`filter-badge px-3 py-1 rounded-full text-sm font-semibold border transition-all ${
                      selectedSubject === subject
                        ? "bg-indigo-500/30 border-indigo-500/60 text-indigo-300"
                        : "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-slate-600/50"
                    }`}
                  >
                    {subject === "all" ? "All Subjects" : subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Type & Difficulty Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-bold mb-2">TYPE</p>
                <div className="flex gap-2 flex-wrap">
                  {types.slice(0, 4).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`filter-badge px-3 py-1 rounded-full text-sm font-semibold border transition-all ${
                        selectedType === type
                          ? "bg-indigo-500/30 border-indigo-500/60 text-indigo-300"
                          : "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-slate-600/50"
                      }`}
                    >
                      {type === "all" ? "All" : type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-bold mb-2">DIFFICULTY</p>
                <div className="flex gap-2 flex-wrap">
                  {difficulties.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`filter-badge px-3 py-1 rounded-full text-sm font-semibold border transition-all ${
                        selectedDifficulty === diff
                          ? "bg-indigo-500/30 border-indigo-500/60 text-indigo-300"
                          : "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-slate-600/50"
                      }`}
                    >
                      {diff === "all" ? "All Levels" : diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="relative z-10 flex-1 overflow-y-auto p-8">
          <p className="text-sm text-slate-400 mb-4">
            Showing <span className="font-bold text-indigo-400">{filteredResources.length}</span> resources
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="resource-card border border-slate-700/50 rounded-xl p-5 group">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      <TypeIcon type={resource.type} />
                    </span>
                    <span className="px-2 py-1 bg-slate-700/50 rounded text-xs font-bold text-slate-300">
                      {resource.type}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleBookmark(resource.id)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        bookmarkedIds.includes(resource.id)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-500 hover:text-yellow-400"
                      }`}
                    />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-indigo-400 transition">
                  {resource.title}
                </h3>

                {/* Metadata */}
                <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
                  <span>📍 {resource.subject}</span>
                  {resource.duration && <span>⏱️ {resource.duration}</span>}
                </div>

                {/* Difficulty & Rating */}
                <div className="flex items-center justify-between mb-4">
                  <DifficultyBadge difficulty={resource.difficulty} />
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-white">{resource.rating}</span>
                  </div>
                </div>

                {/* Instructor & Stats */}
                <div className="text-xs text-slate-400 space-y-2 mb-4 pb-4 border-b border-slate-700/30">
                  <p className="flex items-center gap-1">
                    <span>👨‍🏫</span>
                    {resource.instructors}
                  </p>
                  <p className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    {resource.downloads.toLocaleString()} downloads
                  </p>
                </div>

                {/* Action Button */}
                <button className="w-full px-3 py-2 bg-gradient-to-r from-indigo-500/30 to-blue-500/30 hover:from-indigo-500/50 hover:to-blue-500/50 border border-indigo-400/50 rounded-lg text-indigo-300 font-semibold text-sm transition-all flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View Resource
                </button>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
              <p className="text-slate-400 text-lg font-semibold">No resources found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
