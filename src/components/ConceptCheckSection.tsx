import React, { useState } from 'react';
import { CheckCircle2, XCircle, Compass } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data/curriculum';
import { Language, LearningStage } from '../types/physics';

interface ConceptCheckSectionProps {
  language: Language;
  onJumpToStage: (stage: LearningStage) => void;
}

export const ConceptCheckSection: React.FC<ConceptCheckSectionProps> = ({
  language,
  onJumpToStage,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = QUIZ_QUESTIONS.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctOptionId ? 1 : 0);
  }, 0);

  return (
    <section id="concept-check" className="py-12 border-t border-slate-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-medium text-sky-700 mb-1.5">
            {language === 'zh-TW' ? '高中物理隨堂檢核' : 'Interactive Concept Check'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {language === 'zh-TW'
              ? '檢驗你對「次波與包絡面」的理解'
              : 'Verify Your Understanding of Wavelets & Envelopes'}
          </h2>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="font-mono tabular-nums text-slate-600">
            {language === 'zh-TW'
              ? `作答進度 ${answeredCount}/${QUIZ_QUESTIONS.length} · 答對 ${correctCount} 題`
              : `Answered ${answeredCount}/${QUIZ_QUESTIONS.length} · ${correctCount} Correct`}
          </span>
          {answeredCount > 0 && (
            <button
              type="button"
              onClick={() => setSelectedAnswers({})}
              className="text-xs font-medium text-sky-700 hover:underline cursor-pointer"
            >
              {language === 'zh-TW' ? '清除作答' : 'Clear Answers'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {QUIZ_QUESTIONS.map((q) => {
          const chosen = selectedAnswers[q.id];
          const isAnswered = Boolean(chosen);
          const isCorrect = chosen === q.correctOptionId;

          return (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6"
            >
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                {q.question[language]}
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                {q.options.map((opt) => {
                  const selected = chosen === opt.id;
                  const optionIsCorrect = opt.id === q.correctOptionId;

                  let buttonClasses =
                    'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';
                  if (isAnswered) {
                    if (optionIsCorrect) {
                      buttonClasses =
                        'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium';
                    } else if (selected) {
                      buttonClasses =
                        'bg-red-50 border-red-400 text-red-900';
                    } else {
                      buttonClasses =
                        'bg-white border-slate-200 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [q.id]: opt.id,
                        }))
                      }
                      className={`w-full min-h-[44px] px-4 py-3 text-left text-sm rounded-lg border transition-colors flex items-center justify-between gap-3 cursor-pointer ${buttonClasses}`}
                    >
                      <span>{opt.label[language]}</span>
                      {isAnswered && optionIsCorrect && (
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-600 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {isAnswered && selected && !optionIsCorrect && (
                        <XCircle
                          className="w-4 h-4 text-red-600 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm leading-relaxed text-slate-700">
                    <span
                      className={`font-semibold mr-2 ${
                        isCorrect ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {isCorrect
                        ? language === 'zh-TW'
                          ? '答對了：'
                          : 'Correct:'
                        : language === 'zh-TW'
                          ? '觀念解析：'
                          : 'Explanation:'}
                    </span>
                    {q.explanation[language]}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onJumpToStage(q.relatedStage);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
                    <span>
                      {language === 'zh-TW'
                        ? `查看階段 ${q.relatedStage} 模擬`
                        : `Inspect Stage ${q.relatedStage}`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
