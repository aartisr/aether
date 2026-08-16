# Soothing Support UX Benchmark: 25-Product Pattern Review

Status: design reference  
Last reviewed: 2026-08-16

## Scope

This is a pattern review, not a ranking, endorsement, or clinical comparison. It examines public support, wellbeing, crisis, student, and care-navigation experiences for interaction patterns that reduce decision fatigue. Aether must not copy another service's clinical claims, proprietary flows, voice, or visual identity.

## Reference set

1. [988 Lifeline](https://988lifeline.org/get-help/)
2. [Crisis Text Line](https://www.crisistextline.org/text-us/)
3. [The Trevor Project](https://www.thetrevorproject.org/get-help/)
4. [Mental Health America Screening](https://screening.mhanational.org/)
5. [NAMI](https://www.nami.org/support-education/)
6. [The Jed Foundation](https://jedfoundation.org/)
7. [Active Minds](https://activeminds.org/)
8. [Student Minds](https://www.studentminds.org.uk/)
9. [ReachOut Australia](https://au.reachout.com/)
10. [The Mix](https://www.themix.org.uk/)
11. [YoungMinds](https://www.youngminds.org.uk/)
12. [Headspace](https://www.headspace.com/)
13. [Calm](https://www.calm.com/)
14. [Wysa](https://www.wysa.com/)
15. [Woebot Health](https://woebothealth.com/)
16. [Youper](https://www.youper.ai/)
17. [MindShift CBT](https://www.anxietycanada.com/resources/mindshift-cbt/)
18. [Togetherall](https://togetherall.com/)
19. [7 Cups](https://www.7cups.com/)
20. [TalkLife](https://www.talklife.com/)
21. [Lyra Health](https://www.lyrahealth.com/)
22. [Spring Health](https://www.springhealth.com/what-we-do/one-connected-mental-health-platform)
23. [Modern Health](https://www.modernhealth.com/)
24. [Sanvello](https://www.sanvello.com/)
25. [SilverCloud](https://www.amwell.com/cm/behavioral-health/silvercloud/)

## What the strongest experiences have in common

| Pattern | Why it feels calmer | Aether rule |
| --- | --- | --- |
| Immediate safety route | Help is visible before a person has to explain themselves. | Keep emergency and crisis routes persistent, concise, and outside feature gating. |
| Need-led entry | People recognize a current need more easily than a product feature. | Ask what would help now: calm, a next step, or orientation. |
| Small, reversible choices | Three clear choices are easier than a dashboard of competing cards. | Use one primary action per card and avoid forced disclosure. |
| Explain what happens next | Predictability lowers hesitation. | State the outcome and boundary beside every support action. |
| Private-first reassurance | Privacy language lowers the cost of starting. | Explain data handling in plain language before reflection or AI use. |
| Progressive disclosure | Details remain available without dominating the first screen. | Put secondary navigation, policies, and methodology behind native `details` or a deliberate next page. |
| A short action before a long program | A small win creates agency without a commitment burden. | Offer a grounding cue, check-in, or question before multi-step pathways. |
| Warm handoff, not a dead end | A result is useful only when it suggests an appropriate next move. | End each flow with one safe next action and a visible return route. |
| Honest service boundaries | Clear limits protect trust and safety. | Do not frame Aether or its AI as diagnosis, treatment, or crisis care. |
| Choice and accessibility | People differ in how they want to engage. | Support keyboard access, reduced motion, readable language, and multiple routes without presenting all routes at once. |

## Evidence-informed Aether workflow

```text
Arrive
  -> See safety, privacy, and a non-demanding welcome
  -> Choose the closest need
       -> "I need a calmer moment" -> private reflection / grounding
       -> "I want one practical next step" -> brief check-in / plan
       -> "I am not sure where to begin" -> source-grounded question
  -> Complete one focused action
  -> Receive one clear handoff and an easy return path
```

This deliberately avoids making a visitor identify a condition, disclose sensitive history, or compare every Aether feature before they receive value.

## Implemented decisions

- The homepage primary call to action now moves to a need-led first-step router rather than sending everyone to a single product surface.
- The three routes use human language and describe the first outcome, not internal feature names.
- Route availability respects page flags, so an unavailable pathway is never offered as a first-visit choice.
- Deep navigation is retained but disclosed only when a visitor chooses “Explore every Aether path.”
- Existing reduced-motion, visible-focus, and safety-boundary work remains a release requirement.

## Release guardrails

Before publishing a support-flow change, verify:

1. A visitor can find urgent help without completing a form or opening an accordion.
2. The first viewport has one primary decision and no competing feature catalog.
3. Every action states what happens next and has a usable keyboard focus state.
4. Sensitive input is optional unless strictly necessary for the immediate action.
5. AI language is bounded: source-grounded support, never diagnosis or emergency care.
6. An unavailable or disabled page cannot be promoted from another page.

## Primary-source anchors

The most directly applicable evidence came from the providers' own public service pages: [988's multiple help modes and expectation-setting](https://988lifeline.org/get-help/), [Crisis Text Line's concise four-step flow](https://www.crisistextline.org/text-us/), [The Trevor Project's low-disclosure entry, calming exercise, and quick exit](https://www.thetrevorproject.org/get-help/), [MHA's confidential screening plus next-step model](https://screening.mhanational.org/screening-tools/), and [Spring Health's short assessment-to-plan-to-guidance sequence](https://www.springhealth.com/what-we-do/one-connected-mental-health-platform).
