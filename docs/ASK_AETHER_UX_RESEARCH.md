# Ask Aether: Search and Answer UX Research

## Design objective

Ask Aether serves people who may arrive distracted, stressed, or uncertain where to begin. The experience should reduce the first decision to one action: express a need. It should then make an answer easy to trust and one next move easy to take.

## Comparative set

The review covered these 25 search, answer, documentation, and support experiences: ChatGPT Search, Perplexity, Claude, Google AI Mode, Microsoft Copilot, Bing Search, You.com, Kagi, Brave Search, Phind, Elicit, Consensus, NotebookLM, Notion AI, Slack AI, Linear, Intercom Fin, Zendesk AI, Help Scout, Algolia DocSearch, Stripe Docs, Vercel Docs, GitHub Docs, Shopify Help Center, and Airbnb Help.

This is a pattern study rather than a feature-copying exercise. Aether intentionally does not add web search, account memory, uploads, tracking, or a dense command palette to a student-support journey.

## Repeatedly strong patterns

| Pattern | Why it reduces effort | Aether application |
| --- | --- | --- |
| One prominent input | Visitors immediately know where to begin. | The Ask page leads with one plain-language question and one composer. |
| A small set of intent-led starters | Helps people who cannot yet phrase a question. | Three human situations replace duplicated prompt lists. |
| Contextual follow-ups | Keeps the conversation moving without a new search. | Two follow-up chips appear only after an answer. |
| Sources adjacent to answers | Lets people verify important information without navigating away first. | Sources are available under each answer, collapsed until wanted. |
| One strongest next action | Converts understanding into progress without a decision grid. | Each response shows one primary next step. |
| Explicit bounds | Trust rises when a system says what it can and cannot do. | Grounding and crisis-care boundaries are visible but quiet. |
| Fresh-start control | A new thought should not require a page reload. | A subtle **Start fresh** control appears after a conversation begins. |
| Mobile-first composition | Mobile users need a short, thumb-friendly path. | The composer is always visible, with a send keyboard affordance and no sidebar. |

## Evidence used

- [ChatGPT Search](https://help.openai.com/en/articles/9237897-chatgpt-search) demonstrates direct answers with relevant links rather than forcing a separate search journey.
- [Perplexity’s product explanation](https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work) highlights citations and contextual follow-up as the core answer loop.
- [Google AI Mode](https://support.google.com/websearch/answer/16011537?hl=en) combines one bottom composer, follow-up questions, source links, and clear guidance to double-check important information.
- [Intercom Copilot](https://www.intercom.com/help/en/articles/8587194-how-to-use-copilot) makes source selection and source verification visible, while retaining thread context for follow-ups.
- [Algolia’s documentation-search redesign](https://www.algolia.com/blog/ux/taking-documentation-search-to-new-heights-with-algolia-and-autocomplete/) reinforces staying focused in the query, supporting refinements, keyboard use, previews, and purposeful mobile design.

## Deliberate exclusions

The following familiar patterns were not adopted because they would increase cognitive load or conflict with Aether’s safety posture: model pickers, dense source grids, automatic query rewriting disclosures in the primary flow, persistent history, uploads, ranking controls, and technical retrieval metrics.

## Success measures

1. A first-time visitor can send a question or choose a starter without scrolling.
2. An answer exposes one clear next step and sources without showing more than necessary.
3. The full workflow remains comfortable at 320 px wide and keyboard-operable.
4. Safety language is always reachable without dominating the interaction.
