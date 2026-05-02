import React from 'react';
import { createItemListJsonLd, createPageMetadata, createWebPageJsonLd, siteName, toAbsoluteUrl } from '../../lib/site';
import {
  featuredMentors,
  mentorContributionPillars,
  mentorConstellationNodes,
  mentorFAQs,
  mentorImpactStats,
  mentorRecognitionRituals,
} from '../../lib/mentor-recognition';
import { CardGrid, JsonLd, PageBackdrop, PageContainer, PageHero, SurfaceCard } from '../../components/page/PagePrimitives';
import { assertPageEnabledForRequest } from '../../lib/page-flags';

export const metadata = createPageMetadata({
  title: `Mentor Appreciation | ${siteName}`,
  description:
    'A dedicated gratitude and recognition page for the mentors who shaped Aether through strategic guidance, ethical rigor, and human-centered critique.',
  path: '/mentors',
  keywords: [
    'mentor appreciation',
    'project mentors',
    'acknowledgements',
    'student innovation mentorship',
    'academic project gratitude',
  ],
});

export default function MentorsPage() {
  assertPageEnabledForRequest('mentors');

  const webPageJsonLd = createWebPageJsonLd({
    name: `${siteName} Mentor Appreciation`,
    path: '/mentors',
    description:
      'Recognition of the mentors and advisors whose feedback shaped Aether architecture, ethics, and student-centered design.',
    about: ['mentorship', 'acknowledgements', 'student resilience innovation'],
  });

  const itemListJsonLd = createItemListJsonLd(
    mentorContributionPillars.map((item) => ({
      name: item.title,
      description: item.description,
      url: toAbsoluteUrl('/mentors'),
    })),
  );

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: mentorFAQs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const mentorPeopleJsonLd = {
    '@context': 'https://schema.org',
    '@graph': featuredMentors.flatMap((mentor) =>
      mentor.people.map((person) => {
        const worksFor = 'worksFor' in person ? person.worksFor : undefined;

        return {
          '@type': 'Person',
          name: person.name,
          jobTitle: person.jobTitle,
          description: mentor.gratitude,
          ...(worksFor
            ? {
                worksFor: {
                  '@type': 'Organization',
                  name: worksFor,
                },
              }
            : {}),
        };
      }),
    ),
  };

  return (
    <PageBackdrop>
      <JsonLd
        idPrefix="mentors-jsonld"
        data={[webPageJsonLd, itemListJsonLd, faqJsonLd, mentorPeopleJsonLd]}
      />

      <PageContainer className="max-w-6xl space-y-8">
        <PageHero
          kicker="Mentor Appreciation"
          title="The Mentors Behind Aether"
          description="This project exists because mentors gave more than advice. They gave precision, challenge, and care at every critical turning point."
        />

        <SurfaceCard className="bg-gradient-to-r from-sky-50 via-white to-emerald-50">
          <h2 className="text-2xl font-bold text-slate-900">A Public Thank You</h2>
          <p className="mt-3 text-slate-700 leading-7">
            Aether was shaped in rooms where mentors asked harder questions than we expected and offered steadier support than we deserved. They challenged assumptions, redirected weak decisions, and helped us build a system that protects students while remaining practical to implement.
          </p>
          <p className="mt-3 text-slate-700 leading-7">
            This page is a standing acknowledgment that mentorship is core infrastructure. It is as important to project quality as code, design, and research.
          </p>
        </SurfaceCard>

        <section aria-label="Featured Mentor Gratitude" className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {featuredMentors.map((mentor, index) => (
            <SurfaceCard
              key={mentor.name}
              className="bg-[linear-gradient(135deg,_rgba(14,165,233,0.08),_rgba(16,185,129,0.06),_rgba(255,255,255,1))]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Featured Mentor {index + 1}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Thank You, {mentor.name}</h2>
              <p className="mt-1 text-sm text-sky-800 font-semibold">{mentor.title}</p>
              <p className="mt-4 text-slate-700 leading-7">{mentor.gratitude}</p>
            </SurfaceCard>
          ))}
        </section>

        <section aria-label="Mentor Impact" className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {mentorImpactStats.map((item) => (
            <SurfaceCard key={item.label} className="h-full">
              <p className="text-sm uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-4xl font-extrabold text-sky-700">{item.value}</p>
              <p className="mt-3 text-sm text-slate-700 leading-6">{item.note}</p>
            </SurfaceCard>
          ))}
        </section>

        <SurfaceCard>
          <h2 className="text-2xl font-bold text-slate-900">How Mentors Changed the Build</h2>
          <CardGrid items={mentorContributionPillars} columns="two" className="mt-4" />
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="text-2xl font-bold text-slate-900">Mentor Constellation</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Mentorship influence appears in clusters. Guidance, encouragement, rigor, and integrity connect across every release.
          </p>
          <CardGrid
            items={mentorConstellationNodes.map((node) => ({
              title: node.label,
              description: node.note,
              eyebrow: 'Node',
            }))}
            columns="four"
            className="mt-4"
            itemClassName="relative overflow-hidden"
          />
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="text-2xl font-bold text-slate-900">Recognition Rituals We Commit To</h2>
          <ol className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {mentorRecognitionRituals.map((item, index) => (
              <li key={item.title} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Ritual {index + 1}</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p>
              </li>
            ))}
          </ol>
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="text-2xl font-bold text-slate-900">Mentor Recognition FAQ</h2>
          <div className="mt-4 space-y-3">
            {mentorFAQs.map((item) => (
              <details key={item.question} className="rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.question}</summary>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.answer}</p>
              </details>
            ))}
          </div>
        </SurfaceCard>
      </PageContainer>
    </PageBackdrop>
  );
}
