import React, { useState } from "react";
import { Gamepad2, Trophy, Zap, Brain, Lightbulb, Award, BookMarked, CheckCircle, RotateCcw } from "lucide-react";

interface GamesSectionProps {
  onXPEarned?: (xp: number) => void;
  userXP?: number;
}

export default function GamesSection({ onXPEarned, userXP = 0 }: GamesSectionProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedGames, setCompletedGames] = useState<string[]>([]);

  // Quiz Data
  const quizzes = [
    {
      id: "mcq",
      title: "Multiple Choice Master",
      icon: Brain,
      description: "Test your knowledge with MCQ questions",
      difficulty: "Medium",
      reward: 15,
      questions: [
        {
          q: "What is the powerhouse of the cell?",
          options: ["Nucleus", "Mitochondria", "Ribosome", "Vacuole"],
          correct: 1,
          explanation: "Mitochondria is where ATP energy is produced"
        },
        {
          q: "Which element has the atomic number 6?",
          options: ["Oxygen", "Hydrogen", "Carbon", "Nitrogen"],
          correct: 2,
          explanation: "Carbon (C) is element number 6 on the periodic table"
        },
        {
          q: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correct: 2,
          explanation: "Paris is the beautiful capital of France"
        }
      ]
    },
    {
      id: "trueFalse",
      title: "True or False Blitz",
      icon: Lightbulb,
      description: "Quick true/false questions - test your reflexes!",
      difficulty: "Easy",
      reward: 10,
      questions: [
        {
          q: "The Great Wall of China is visible from space with the naked eye.",
          correct: 0,
          options: ["True", "False"],
          explanation: "This is a common myth - it cannot be seen from space"
        },
        {
          q: "Water boils at 100°C at sea level.",
          correct: 0,
          options: ["True", "False"],
          explanation: "Correct! Water boils at 100°C (212°F) at standard atmospheric pressure"
        },
        {
          q: "The human brain is 60% fat.",
          correct: 0,
          options: ["True", "False"],
          explanation: "True! The brain's dry weight is about 60% fat"
        }
      ]
    },
    {
      id: "fillBlank",
      title: "Fill the Blank",
      icon: BookMarked,
      description: "Complete the sentences with the correct words",
      difficulty: "Medium",
      reward: 12,
      questions: [
        {
          q: "Photosynthesis is the process by which plants convert _______ into chemical energy.",
          correct: 0,
          options: ["sunlight", "water", "oxygen", "carbon dioxide"],
          explanation: "Plants use sunlight energy in photosynthesis"
        },
        {
          q: "The _______ is responsible for pumping blood throughout the body.",
          correct: 0,
          options: ["brain", "heart", "lungs", "liver"],
          explanation: "The heart pumps blood through the circulatory system"
        },
        {
          q: "Isaac Newton discovered the law of _______.",
          correct: 0,
          options: ["motion", "gravity", "thermodynamics", "relativity"],
          explanation: "Newton formulated the law of universal gravitation"
        }
      ]
    },
    {
      id: "scramble",
      title: "Word Scramble",
      icon: Award,
      description: "Unscramble the jumbled letters to form words",
      difficulty: "Easy",
      reward: 8,
      questions: [
        {
          q: "TPHOYSENSISH",
          correct: 0,
          options: ["Photosynthesis", "Photography", "Philosophy", "Phonetics"],
          explanation: "Photosynthesis - the biological process in plants"
        },
        {
          q: "TERENECLI",
          correct: 0,
          options: ["Electricity", "Electronic", "Electron", "Element"],
          explanation: "Electricity - the flow of electrical charge"
        },
        {
          q: "AYGRTVI",
          correct: 0,
          options: ["Gravity", "Gravy", "Grave", "Gravel"],
          explanation: "Gravity - the fundamental force attracting objects"
        }
      ]
    }
  ];

  // Daily Challenge
  const dailyChallenges = [
    { title: "Answer 5 Questions", xp: 50, completed: completedGames.length > 0 },
    { title: "Score 100% on a Quiz", xp: 75, completed: completedGames.includes("perfect") },
    { title: "Achieve 10 Streak", xp: 100, completed: streak >= 10 }
  ];

  const handleQuizComplete = (quizId: string, correct: boolean, reward: number) => {
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setUserScore(userScore + reward);
      onXPEarned?.(reward);

      if (!completedGames.includes(quizId)) {
        setCompletedGames([...completedGames, quizId]);
      }
    } else {
      setStreak(0);
    }
  };

  if (!activeGame) {
    return (
      <div className="w-full space-y-6">
        {/* Games Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-purple-950 flex items-center gap-2">
              <Gamepad2 className="w-8 h-8 text-purple-600" />
              Games & Quizzes
            </h2>
            <p className="text-purple-700 mt-2">Have fun while learning! Earn XP and climb the leaderboard</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600">{userScore + userXP}</div>
            <div className="text-sm text-purple-700">Total XP</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-100/80 to-purple-50/60 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-semibold">Current Streak</p>
                <p className="text-3xl font-bold text-purple-950 mt-2">{streak}</p>
              </div>
              <Zap className="w-10 h-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-100/80 to-pink-50/60 border border-pink-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-700 font-semibold">Games Completed</p>
                <p className="text-3xl font-bold text-pink-950 mt-2">{completedGames.length}</p>
              </div>
              <Trophy className="w-10 h-10 text-pink-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-100/80 to-amber-50/60 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-semibold">Quiz Score</p>
                <p className="text-3xl font-bold text-amber-950 mt-2">{userScore}</p>
              </div>
              <Award className="w-10 h-10 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Daily Challenges */}
        <div className="bg-white border border-purple-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-purple-950 mb-4">📅 Daily Challenges</h3>
          <div className="space-y-3">
            {dailyChallenges.map((challenge, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent border border-purple-100 rounded-lg">
                <div className="flex items-center gap-3">
                  {challenge.completed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-purple-300"></div>
                  )}
                  <span className="text-purple-900 font-semibold">{challenge.title}</span>
                </div>
                <span className="text-sm font-bold text-purple-600">+{challenge.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* Game Selection */}
        <div>
          <h3 className="text-xl font-bold text-purple-950 mb-4">Choose Your Game</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => {
              const Icon = quiz.icon;
              const isCompleted = completedGames.includes(quiz.id);
              return (
                <button
                  key={quiz.id}
                  onClick={() => setActiveGame(quiz.id)}
                  className="group bg-gradient-to-br from-purple-100/80 to-purple-50/60 border border-purple-200 rounded-2xl p-6 hover:border-purple-400 hover:shadow-lg transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="w-8 h-8 text-purple-600" />
                    {isCompleted && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                  </div>
                  <h3 className="text-lg font-bold text-purple-950 group-hover:text-purple-700">{quiz.title}</h3>
                  <p className="text-sm text-purple-700 mt-2">{quiz.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-semibold text-purple-600 bg-purple-200/50 px-3 py-1 rounded-full">
                      {quiz.difficulty}
                    </span>
                    <span className="text-sm font-bold text-purple-600">+{quiz.reward} XP</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="bg-white border border-purple-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-purple-950 mb-4">🏆 Top Learners</h3>
          <div className="space-y-3">
            {[
              { rank: 1, name: "Alex Master", score: 2840, badge: "🥇" },
              { rank: 2, name: "Quiz Queen", score: 2650, badge: "🥈" },
              { rank: 3, name: "Study Ninja", score: 2420, badge: "🥉" }
            ].map((player) => (
              <div key={player.rank} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{player.badge}</span>
                  <span className="font-semibold text-purple-950">{player.name}</span>
                </div>
                <span className="font-bold text-purple-600">{player.score} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz View
  const quiz = quizzes.find(q => q.id === activeGame);
  return <QuizGame quiz={quiz} onComplete={() => { setActiveGame(null); handleQuizComplete(activeGame, true, quiz?.reward || 0); }} onBack={() => setActiveGame(null)} />;
}

// Quiz Game Component
function QuizGame({ quiz, onComplete, onBack }: any) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const question = quiz.questions[currentQ];
  const isCorrect = selected === question.correct;

  const handleNext = () => {
    if (isCorrect) setScore(score + 1);
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-2">
          ← Back
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-purple-950">{quiz.title}</h2>
          <p className="text-sm text-purple-700">Question {currentQ + 1} of {quiz.questions.length}</p>
        </div>
        <div className="w-20"></div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 h-full transition-all" style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}></div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-purple-200 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-purple-950 mb-6">{question.q}</h3>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {question.options.map((option: string, idx: number) => (
            <button
              key={idx}
              onClick={() => !submitted && setSelected(idx)}
              disabled={submitted}
              className={`w-full p-4 rounded-xl border-2 font-semibold transition-all text-left ${
                selected === idx
                  ? "border-purple-600 bg-purple-100/50 text-purple-950"
                  : submitted && idx === question.correct
                  ? "border-emerald-500 bg-emerald-100/30 text-emerald-950"
                  : submitted && idx !== question.correct && selected === idx
                  ? "border-red-500 bg-red-100/30 text-red-950"
                  : "border-purple-200 bg-white text-purple-900 hover:border-purple-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {submitted && (
          <div className={`p-4 rounded-xl mb-6 ${isCorrect ? "bg-emerald-100/50 border border-emerald-300" : "bg-red-100/50 border border-red-300"}`}>
            <p className={`font-semibold ${isCorrect ? "text-emerald-900" : "text-red-900"}`}>
              {isCorrect ? "✨ Correct!" : "❌ Not quite right"}
            </p>
            <p className={`text-sm mt-2 ${isCorrect ? "text-emerald-800" : "text-red-800"}`}>{question.explanation}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-4">
          <button
            onClick={() => setSubmitted(true)}
            disabled={submitted || selected === null}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
          >
            {submitted ? (currentQ < quiz.questions.length - 1 ? "Next Question →" : "Finish Quiz") : "Submit"}
          </button>
          {submitted && (
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
            >
              {currentQ < quiz.questions.length - 1 ? "Next →" : "Done! 🎉"}
            </button>
          )}
        </div>
      </div>

      {/* Score Card */}
      {submitted && (
        <div className="bg-gradient-to-r from-purple-100/80 to-fuchsia-100/60 border border-purple-200 rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold text-purple-700 mb-2">Questions Correct</p>
          <p className="text-4xl font-bold text-purple-950">{score}/{quiz.questions.length}</p>
        </div>
      )}
    </div>
  );
}
