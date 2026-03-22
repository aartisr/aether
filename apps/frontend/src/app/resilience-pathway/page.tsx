import React from 'react';
import Link from 'next/link';

const stages = [
  {
    title: 'Catharsis',
    desc: 'Echo recording of raw thoughts in a safe, anonymized space.'
  },
  {
    title: 'Detection',
    desc: 'AI detects a threshold violation (Crisis Intensity Score > 0.85) using local analysis.'
  },
  {
    title: 'UI Pivot',
    desc: 'System shifts to a low-stimulus, high-contrast intervention mode for crisis support.'
  },
  {
    title: 'Warm Handoff',
    desc: 'Direct VoIP link to a human counselor with a pre-populated context packet.'
  },
  {
    title: 'Stabilization',
    desc: 'Post-crisis grounding and scheduled check-ins for ongoing support.'
  }
];

export default function ResiliencePathway() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">The Resilience Pathway</h1>
        <p className="text-lg text-gray-700">Aether guides students through a research-driven, staged journey from catharsis to stabilization, ensuring human-in-the-loop support at every step.</p>
        <ol className="mt-8 space-y-6">
          {stages.map((stage, i) => (
            <li key={stage.title} className="flex flex-col md:flex-row items-center gap-4">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow">{i+1}</span>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-indigo-700">{stage.title}</h3>
                <p className="text-gray-600 text-sm">{stage.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="text-xs text-gray-400 mt-6">For more details, see the <Link href="/about" className="underline text-indigo-600">About</Link> page and the project README.</div>
      </div>
    </section>
  );
}
