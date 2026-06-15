import React, { useState } from "react";
import { Zap, Check } from "lucide-react";

export default function QuickQuiz({ result, onCorrect }: any) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!result) {
    return (
      <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 text-sm text-slate-400">
        Quick quiz will appear after you generate a result.
      </div>
    );
  }

  const subject = result.subject || "General";
  const distractors = ["Mathematics", "Chemistry", "Biology", "Computer Science", "History"].filter(s => s !== subject);
  const choices = [subject, distractors[0], distractors[1] || distractors[0]];

  const handleSubmit = () => {
    setSubmitted(true);
    if (selected === subject) {
      onCorrect?.(10);
    }
  };

  return (
    <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-400"/> Quick Quiz</div>
        <div className="text-xs text-slate-400">Earn XP for correct answers</div>
      </div>

      <div className="text-[13px] text-slate-300">Which subject best fits this doubt?</div>

      <div className="grid grid-cols-1 gap-2">
        {choices.map((c, i) => (
          <label key={i} className={`p-2 rounded-lg border cursor-pointer ${selected===c? 'border-indigo-500 bg-indigo-600/10 text-white':'border-white/5 text-slate-300'}`}>
            <input type="radio" name="qq" className="hidden" checked={selected===c} onChange={() => setSelected(c)} />
            {c}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button disabled={submitted} onClick={handleSubmit} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold">
          Submit
        </button>
        {submitted && (
          <div className="text-xs text-slate-300 flex items-center gap-2">
            {selected===subject? (
              <><Check className="w-4 h-4 text-emerald-400"/> Correct! +10 XP</>
            ) : (
              <span className="text-rose-400">Not quite — try another query.</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
