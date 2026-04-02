"use client";

import { useMemo, useState } from 'react';

import { scoreCheckIn } from '../../lib/checkin';
import { checkInQuestions } from '../../lib/resilience-model';

const scale = [0, 1, 2, 3, 4];

export default function WellbeingCheckIn() {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const result = useMemo(() => scoreCheckIn(answers), [answers]);

  return (
    <section className="rounded-2xl bg-white p-4 sm:p-6 shadow-soft border border-indigo-100">
      <h2 className="text-xl sm:text-2xl font-bold text-indigo-800">Weekly Resilience Check-In</h2>
      <p className="mt-2 text-sm text-gray-600">
        Rate each statement from 0 (not at all) to 4 (nearly every day).
      </p>

      <div className="mt-6 space-y-6">
        {checkInQuestions.map((question) => (
          <fieldset key={question.id} className="rounded-xl border border-indigo-100 p-3 sm:p-4">
            <legend className="font-medium text-sm sm:text-base text-indigo-900">{question.prompt}</legend>
            <div className="mt-3 grid grid-cols-5 gap-2 max-w-xs">
              {scale.map((value) => {
                const isActive = answers[question.id] === value;
                return (
                  <button
                    key={`${question.id}-${value}`}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
                    className={`px-0 py-2.5 text-sm rounded-lg border transition ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-indigo-50 p-3 sm:p-4 border border-indigo-100">
        <p className="text-sm text-indigo-900 font-medium">Resilience status: {result.riskLevel.toUpperCase()}</p>
        <p className="text-sm text-gray-700 mt-1">{result.summary}</p>
        <p className="text-xs text-gray-600 mt-2">Current score: {result.total}/{result.max} ({result.percent}%)</p>
        <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-1">
          {result.recommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
        {(result.riskLevel === 'high' || result.riskLevel === 'critical') && (
          <a
            href="https://988lifeline.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 w-full sm:w-auto text-center px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold no-underline hover:bg-red-700"
          >
            Immediate Support: 988
          </a>
        )}
      </div>
    </section>
  );
}
