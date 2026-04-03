import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
      <section className="max-w-5xl w-full text-center space-y-6 md:space-y-8">
        <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white/70 p-3 shadow-soft border border-indigo-100">
          <Image
            src="/aether-logo.svg"
            alt="Aether logo"
            width={1080}
            height={360}
            priority
            className="h-auto w-full"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-indigo-800 drop-shadow-lg leading-tight">
          Aether: Student Resiliency Ecosystem
        </h1>
        <p className="text-base sm:text-lg md:text-2xl text-gray-700 max-w-3xl mx-auto">
          A research-driven, privacy-first platform for student mental health, powered by
          multi-modal AI and peer support.
        </p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 md:gap-4 justify-center mt-6 md:mt-8">
          <Link
            href="/echo"
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
          >
            Try Echo Chamber
          </Link>
          <Link
            href="/resilience-pathway"
            className="w-full sm:w-auto px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold shadow hover:bg-teal-700 transition"
          >
            Open Resilience Hub
          </Link>
          <Link
            href="/about"
            className="w-full sm:w-auto px-6 py-3 bg-white border border-indigo-600 text-indigo-700 rounded-lg font-semibold shadow hover:bg-indigo-50 transition"
          >
            Learn More
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-left mt-6 md:mt-8">
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
          <article className="bg-white/80 rounded-xl p-4 shadow-soft border border-indigo-100">
            <h2 className="text-indigo-800 font-semibold">Evidence-Based Pathways</h2>
            <p className="text-sm text-gray-600 mt-2">Integrated check-in, safety planning, and care navigation patterns grounded in leading student wellbeing programs.</p>
          </article>
        </div>
      </section>
    </section>
  );
}
