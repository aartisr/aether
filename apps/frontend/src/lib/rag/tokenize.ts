const stopWords = new Set([
  'about',
  'after',
  'again',
  'against',
  'all',
  'and',
  'any',
  'are',
  'because',
  'been',
  'before',
  'being',
  'between',
  'both',
  'but',
  'can',
  'could',
  'did',
  'does',
  'doing',
  'during',
  'each',
  'few',
  'for',
  'from',
  'had',
  'has',
  'have',
  'having',
  'here',
  'how',
  'into',
  'its',
  'itself',
  'just',
  'more',
  'most',
  'nor',
  'not',
  'now',
  'off',
  'once',
  'only',
  'other',
  'our',
  'ours',
  'out',
  'over',
  'own',
  'same',
  'should',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'too',
  'under',
  'until',
  'very',
  'was',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'whom',
  'why',
  'will',
  'with',
  'you',
  'your',
  'yours',
]);

export function tokenizeForRag(input: string) {
  return (
    input
      .toLowerCase()
      .replace(/['’]/g, '')
      .match(/[a-z0-9]+/g)
      ?.filter((term) => term.length > 2 && !stopWords.has(term))
      .map(stemTerm) ?? []
  );
}

export function countTerms(terms: string[]) {
  return terms.reduce<Record<string, number>>((acc, term) => {
    acc[term] = (acc[term] ?? 0) + 1;
    return acc;
  }, {});
}

export function normalizeForPhraseSearch(input: string) {
  return tokenizeForRag(input).join(' ');
}

function stemTerm(term: string) {
  if (term.length > 5 && term.endsWith('ing')) {
    return term.slice(0, -3);
  }
  if (term.length > 4 && term.endsWith('ed')) {
    return term.slice(0, -2);
  }
  if (term.length > 4 && term.endsWith('s')) {
    return term.slice(0, -1);
  }
  return term;
}
