import React, { useState } from "react";
import { BookOpen, ExternalLink, Download, Play, FileText, Users, Award, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  subject: string;
  type: "video" | "article" | "pdf" | "course" | "interactive";
  icon: React.ReactNode;
  description: string;
  link: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration?: string;
}

const STUDY_RESOURCES: Resource[] = [
  // Physics
  {
    id: "1",
    title: "AC Current Fundamentals",
    subject: "Physics",
    type: "video",
    icon: <Play className="w-4 h-4" />,
    description: "Complete guide to understanding alternating current, sine waves, and AC circuits",
    link: "https://www.youtube.com/results?search_query=ac+current+physics",
    difficulty: "beginner",
    duration: "45 min"
  },
  {
    id: "2",
    title: "Physics Formulas & Equations",
    subject: "Physics",
    type: "pdf",
    icon: <Download className="w-4 h-4" />,
    description: "Comprehensive PDF with all major physics formulas organized by topic",
    link: "https://www.duckduckgo.com/?q=physics+formulas+pdf",
    difficulty: "intermediate"
  },
  {
    id: "3",
    title: "Khan Academy - Circuits & Electricity",
    subject: "Physics",
    type: "course",
    icon: <Users className="w-4 h-4" />,
    description: "Interactive lessons on electrical circuits, current, voltage, and resistance",
    link: "https://www.khanacademy.org/science/physics/circuits-topic",
    difficulty: "beginner"
  },

  // Mathematics
  {
    id: "4",
    title: "Calculus Integration Techniques",
    subject: "Mathematics",
    type: "video",
    icon: <Play className="w-4 h-4" />,
    description: "Master integration methods: substitution, by parts, partial fractions",
    link: "https://www.youtube.com/results?search_query=integration+calculus+tutorial",
    difficulty: "intermediate",
    duration: "60 min"
  },
  {
    id: "5",
    title: "Interactive Graphing Calculator",
    subject: "Mathematics",
    type: "interactive",
    icon: <Lightbulb className="w-4 h-4" />,
    description: "Visualize mathematical functions and understand behavior instantly",
    link: "https://www.desmos.com/calculator",
    difficulty: "beginner"
  },
  {
    id: "6",
    title: "Mathematics Study Guide",
    subject: "Mathematics",
    type: "article",
    icon: <FileText className="w-4 h-4" />,
    description: "Comprehensive guide covering algebra, geometry, calculus fundamentals",
    link: "https://tutorial.math.lamar.edu/",
    difficulty: "intermediate"
  },

  // Computer Science
  {
    id: "7",
    title: "Java Programming Fundamentals",
    subject: "Computer Science",
    type: "course",
    icon: <Users className="w-4 h-4" />,
    description: "Learn Java basics: loops, data structures, OOP principles with examples",
    link: "https://www.codecademy.com/learn/learn-java",
    difficulty: "beginner"
  },
  {
    id: "8",
    title: "Data Structures & Algorithms",
    subject: "Computer Science",
    type: "video",
    icon: <Play className="w-4 h-4" />,
    description: "Master arrays, linked lists, trees, graphs, sorting & searching algorithms",
    link: "https://www.youtube.com/results?search_query=data+structures+algorithms",
    difficulty: "advanced",
    duration: "2 hours"
  },
  {
    id: "9",
    title: "Python Debugging Guide",
    subject: "Computer Science",
    type: "article",
    icon: <FileText className="w-4 h-4" />,
    description: "Complete guide to debugging techniques, print statements, debuggers",
    link: "https://realpython.com/python-debugging-pdb/",
    difficulty: "beginner"
  },

  // Chemistry
  {
    id: "10",
    title: "Chemical Reactions & Equations",
    subject: "Chemistry",
    type: "video",
    icon: <Play className="w-4 h-4" />,
    description: "Understand balancing equations, stoichiometry, and reaction types",
    link: "https://www.youtube.com/results?search_query=chemical+reactions+equations",
    difficulty: "beginner",
    duration: "50 min"
  },
  {
    id: "11",
    title: "Chemistry Interactive Lab",
    subject: "Chemistry",
    type: "interactive",
    icon: <Lightbulb className="w-4 h-4" />,
    description: "Virtual chemistry lab to perform safe experiments and visualizations",
    link: "https://www.chemdoodle.com/",
    difficulty: "intermediate"
  },

  // Biology
  {
    id: "12",
    title: "Cell Biology Essentials",
    subject: "Biology",
    type: "course",
    icon: <Users className="w-4 h-4" />,
    description: "Learn cell structure, functions, mitosis, and cellular processes",
    link: "https://www.khanacademy.org/science/biology",
    difficulty: "beginner"
  },
  {
    id: "13",
    title: "Biology Study Notes",
    subject: "Biology",
    type: "pdf",
    icon: <Download className="w-4 h-4" />,
    description: "Detailed notes on anatomy, genetics, ecology, and evolution",
    link: "https://www.duckduckgo.com/?q=biology+study+notes+pdf",
    difficulty: "intermediate"
  }
];

export default function StudyResources() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const subjects = Array.from(new Set(STUDY_RESOURCES.map((r) => r.subject)));
  const difficulties = ["all", "beginner", "intermediate", "advanced"];

  const filteredResources = STUDY_RESOURCES.filter((resource) => {
    const subjectMatch = selectedSubject === null || resource.subject === selectedSubject;
    const difficultyMatch =
      selectedDifficulty === "all" || resource.difficulty === selectedDifficulty;
    return subjectMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "intermediate":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "advanced":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-4 h-4" />;
      case "pdf":
        return <Download className="w-4 h-4" />;
      case "article":
        return <FileText className="w-4 h-4" />;
      case "course":
        return <Users className="w-4 h-4" />;
      case "interactive":
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Study Materials & Resources</h3>
          <p className="text-xs text-slate-400">Curated learning materials from top educational platforms</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 p-5 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/30 shadow-sm">
        {/* Subject Filter */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block text-slate-900 dark:text-slate-300">
            Filter by Subject
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubject(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSubject === null
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/30 dark:hover:text-white dark:hover:bg-slate-700"
              }`}
            >
              All Subjects
            </button>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSubject === subject
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/30 dark:hover:text-white dark:hover:bg-slate-700"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-2 block text-slate-900 dark:text-slate-300">
            Filter by Difficulty
          </label>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  selectedDifficulty === diff
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/30 dark:hover:text-white dark:hover:bg-slate-700"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="p-4 bg-slate-900/60 border border-slate-700/30 rounded-lg hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/10"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  {getTypeIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {resource.title}
                  </h4>
                  <p className="text-[10px] text-slate-400">{resource.subject}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 mb-3 line-clamp-2">
              {resource.description}
            </p>

            {/* Tags */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-[10px] font-semibold border capitalize ${getDifficultyColor(resource.difficulty)}`}>
                  {resource.difficulty}
                </span>
                {resource.duration && (
                  <span className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-700/40 text-slate-300 border border-slate-600/20">
                    {resource.duration}
                  </span>
                )}
              </div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">
                {resource.type}
              </span>
            </div>

            {/* Link Button */}
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Access Resource
            </a>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No resources found matching your filters</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 p-4 bg-gradient-to-r from-slate-900/60 to-slate-800/40 border border-slate-700/30 rounded-lg">
        <div className="text-center">
          <p className="text-lg font-bold text-indigo-400">{STUDY_RESOURCES.length}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Resources</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-400">{STUDY_RESOURCES.filter((r) => r.difficulty === "beginner").length}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Beginner</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-amber-400">{STUDY_RESOURCES.filter((r) => r.difficulty === "intermediate").length}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Intermediate</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-rose-400">{STUDY_RESOURCES.filter((r) => r.difficulty === "advanced").length}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Advanced</p>
        </div>
      </div>
    </div>
  );
}
