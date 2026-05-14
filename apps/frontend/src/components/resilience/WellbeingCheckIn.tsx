"use client";

import { useMemo, useState } from 'react';

import { scoreCheckIn } from '../../lib/checkin';
import { checkInQuestions } from '../../lib/resilience-model';
import { HubAction, HubLinkAction, HubPanel, HubSection } from './ResilienceHubPrimitives';

const scale = [0, 1, 2, 3, 4];

export default function WellbeingCheckIn() {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const result = useMemo(() => scoreCheckIn(answers), [answers]);
  const answeredCount = Object.keys(answers).length;
  const statusTone: 'stabilize' | 'practice' | 'belong' =
    result.riskLevel === 'critical' || result.riskLevel === 'high'
      ? 'stabilize'
      : result.riskLevel === 'moderate'
        ? 'practice'
        : 'belong';

  return (
    <HubSection
      id="check-in"
      tone="belong"
      eyebrow="Private pulse"
      title="Weekly Resilience Check-In"
      description="Rate each statement from 0 (not at all) to 4 (nearly every day). This is guidance, not a diagnosis."
      aside={
        <HubPanel className="px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Completed</p>
          <p className="text-2xl font-black text-slate-950">{answeredCount}/{checkInQuestions.length}</p>
        </HubPanel>
      }
    >

      <div className="mt-6 space-y-6">
        {checkInQuestions.map((question) => (
          <fieldset key={question.id} className="rounded-xl border border-slate-200 p-3 sm:p-4">
            <legend className="font-bold text-sm sm:text-base text-slate-900">{question.prompt}</legend>
            <div className="mt-3 grid grid-cols-5 gap-2 max-w-xs">
              {scale.map((value) => {
                const isActive = answers[question.id] === value;
                return (
                  <HubAction
                    key={`${question.id}-${value}`}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
                    tone="belong"
                    variant={isActive ? 'solid' : 'outline'}
                    className="px-0"
                  >
                    {value}
                  </HubAction>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <HubPanel tone={statusTone} className="mt-6 p-3 sm:p-4">
        <p className="text-sm font-black">Resilience status: {result.riskLevel.toUpperCase()}</p>
        <p className="text-sm mt-1">{result.summary}</p>
        <p className="text-xs mt-2">Current score: {result.total}/{result.max} ({result.percent}%)</p>
        <ul className="mt-3 list-disc pl-5 text-sm space-y-1">
          {result.recommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
        {(result.riskLevel === 'high' || result.riskLevel === 'critical') && (
          <HubLinkAction
            href="https://988lifeline.org/"
            target="_blank"
            rel="noopener noreferrer"
            tone="stabilize"
            className="mt-4 w-full sm:w-auto"
          >
            Immediate Support: 988
          </HubLinkAction>
        )}
      </HubPanel>
    </HubSection>
  );
}
