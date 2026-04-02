import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <section className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-extrabold text-indigo-800 drop-shadow-lg">
          Aether: Student Resiliency Ecosystem
        </h1>
        <p className="text-lg md:text-2xl text-gray-700">
          A research-driven, privacy-first platform for student mental health, powered by
          multi-modal AI and peer support.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
          <Link
            href="/echo"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
          >
            Try Echo Chamber
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 bg-white border border-indigo-600 text-indigo-700 rounded-lg font-semibold shadow hover:bg-indigo-50 transition"
          >
            Learn More
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-8">
          <article className="bg-white/80 rounded-xl p-4 shadow-soft border border-indigo-100">
            <h2 className="text-indigo-800 font-semibold">Privacy by Default</h2>
            <p className="text-sm text-gray-600 mt-2">Local-first processing and explicit consent patterns.</p>
          </article>
          <article className="bg-white/80 rounded-xl p-4 shadow-soft border border-indigo-100">
            <h2 className="text-indigo-800 font-semibold">Human-Centered AI</h2>
            <p className="text-sm text-gray-600 mt-2">AI supports triage while preserving human oversight.</p>
          </article>
          <article className="bg-white/80 rounded-xl p-4 shadow-soft border border-indigo-100">
            <h2 className="text-indigo-800 font-semibold">Accessible Experience</h2>
            <p className="text-sm text-gray-600 mt-2">Keyboard-friendly, readable, and responsive across devices.</p>
          </article>
        </div>
      </section>
    </section>
  );
}
