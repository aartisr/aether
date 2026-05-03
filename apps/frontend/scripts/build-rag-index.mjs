import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(scriptDir, '..');
const configPath = path.join(frontendRoot, 'rag.config.json');

const DEFAULT_TARGET_WORDS = 420;
const DEFAULT_OVERLAP_WORDS = 60;

const stopWords = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'against',
  'all',
  'am',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'can',
  'could',
  'did',
  'do',
  'does',
  'doing',
  'down',
  'during',
  'each',
  'few',
  'for',
  'from',
  'further',
  'had',
  'has',
  'have',
  'having',
  'he',
  'her',
  'here',
  'hers',
  'herself',
  'him',
  'himself',
  'his',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'itself',
  'just',
  'me',
  'more',
  'most',
  'my',
  'myself',
  'no',
  'nor',
  'not',
  'now',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'our',
  'ours',
  'ourselves',
  'out',
  'over',
  'own',
  'same',
  'she',
  'should',
  'so',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'theirs',
  'them',
  'themselves',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  'we',
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
  'yourself',
  'yourselves',
]);

async function main() {
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
  const targetWords = config.chunking?.targetWords ?? DEFAULT_TARGET_WORDS;
  const overlapWords = config.chunking?.overlapWords ?? DEFAULT_OVERLAP_WORDS;
  const documents = [];

  for (const source of config.sources ?? []) {
    const files = await collectSourceFiles(source);

    for (const filePath of files) {
      const raw = await fs.readFile(filePath, 'utf8');
      const relativePath = toPosix(path.relative(frontendRoot, filePath));
      const repoRelativePath = toPosix(path.relative(path.resolve(frontendRoot, '../..'), filePath));
      const title = getTitle(raw, source, filePath);
      const url = getUrl(source, filePath);
      const chunks = createChunks(raw, {
        title,
        extension: path.extname(filePath),
        targetWords,
        overlapWords,
      });

      chunks.forEach((chunk, index) => {
        const text = compactWhitespace(chunk.text);
        if (!text || countWords(text) < 18) {
          return;
        }

        const terms = getTermCounts(text);
        const termCount = Object.values(terms).reduce((sum, value) => sum + value, 0);

        documents.push({
          id: `${slugify(source.id)}-${slugify(path.basename(filePath, path.extname(filePath)))}-${String(index + 1).padStart(2, '0')}`,
          title,
          sourceId: source.id,
          sourcePath: repoRelativePath,
          localPath: relativePath,
          url,
          pageId: source.pageId,
          visibility: source.visibility ?? 'knowledge-base',
          heading: chunk.heading,
          text,
          terms,
          termCount,
          contentHash: sha256(`${title}\n${chunk.heading}\n${text}`),
        });
      });
    }
  }

  const stats = buildStats(documents);
  const output = {
    schemaVersion: 1,
    siteName: config.siteName ?? 'Website',
    retrieval: {
      type: 'free-bm25',
      description: 'Static lexical RAG index with BM25-style scoring and extractive answers.',
    },
    stats,
    chunks: documents,
  };

  const outputPath = path.resolve(frontendRoot, config.outputPath ?? 'src/generated/rag-index.json');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);

  console.log(`Built free RAG index with ${documents.length} chunks at ${toPosix(path.relative(frontendRoot, outputPath))}.`);
}

async function collectSourceFiles(source) {
  const absolutePath = path.resolve(frontendRoot, source.path);

  if (source.type === 'file') {
    return [absolutePath];
  }

  if (source.type !== 'directory') {
    throw new Error(`Unsupported RAG source type: ${source.type}`);
  }

  const extensions = new Set(source.extensions ?? ['.md', '.txt']);
  const excludedParts = new Set(source.exclude ?? []);
  const files = await walk(absolutePath);

  return files
    .filter((filePath) => extensions.has(path.extname(filePath)))
    .filter((filePath) => {
      const relativeParts = path.relative(absolutePath, filePath).split(path.sep);
      return !relativeParts.some((part) => excludedParts.has(part));
    })
    .sort();
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function createChunks(raw, options) {
  const text = options.extension === '.ts' || options.extension === '.tsx' ? extractStringLiterals(raw) : cleanMarkdown(raw);
  const sections = splitIntoSections(text, options.title);

  return sections.flatMap((section) =>
    chunkSection(section, {
      targetWords: options.targetWords,
      overlapWords: options.overlapWords,
    }),
  );
}

function splitIntoSections(text, fallbackHeading) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let currentHeading = fallbackHeading;
  let buffer = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      flush();
      currentHeading = headingMatch[1].replace(/#+$/, '').trim();
      continue;
    }

    buffer.push(line);
  }

  flush();
  return sections.length > 0 ? sections : [{ heading: fallbackHeading, text }];

  function flush() {
    const sectionText = compactWhitespace(buffer.join('\n'));
    if (sectionText) {
      sections.push({ heading: currentHeading, text: sectionText });
    }
    buffer = [];
  }
}

function chunkSection(section, { targetWords, overlapWords }) {
  const words = section.text.split(/\s+/).filter(Boolean);

  if (words.length <= targetWords) {
    return [section];
  }

  const chunks = [];
  const step = Math.max(80, targetWords - overlapWords);

  for (let start = 0; start < words.length; start += step) {
    const chunkWords = words.slice(start, start + targetWords);
    if (chunkWords.length < 24) {
      break;
    }

    chunks.push({
      heading: section.heading,
      text: chunkWords.join(' '),
    });
  }

  return chunks;
}

function cleanMarkdown(raw) {
  return raw
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}[-*+]\s+/gm, '- ')
    .replace(/^\s{0,3}\d+\.\s+/gm, '- ');
}

function extractStringLiterals(raw) {
  const values = [];
  const stringPattern = /(['"`])((?:\\.|(?!\1)[\s\S])*)\1/g;
  let match;

  while ((match = stringPattern.exec(raw)) !== null) {
    const candidate = match[2]
      .replace(/\\n/g, ' ')
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\`/g, '`')
      .replace(/\$\{[^}]+}/g, ' ');

    if (countWords(candidate) >= 3) {
      values.push(candidate);
    }
  }

  return values.join('\n\n');
}

function getTitle(raw, source, filePath) {
  if (source.title) {
    return source.title;
  }

  const frontmatterTitle = raw.match(/^---[\s\S]*?\ntitle:\s*["']?(.+?)["']?\s*\n[\s\S]*?---/m)?.[1];
  if (frontmatterTitle) {
    return frontmatterTitle.trim();
  }

  const markdownTitle = raw.match(/^#\s+(.+)$/m)?.[1];
  if (markdownTitle) {
    return markdownTitle.trim();
  }

  return titleCase(path.basename(filePath, path.extname(filePath)).replace(/[-_]+/g, ' '));
}

function getUrl(source, filePath) {
  if (source.type === 'file') {
    return source.url;
  }

  const basename = path.basename(filePath, path.extname(filePath));
  if (source.urlPrefix?.startsWith('http')) {
    return `${source.urlPrefix}/${path.basename(filePath)}`;
  }

  return `${source.urlPrefix}/${basename}`.replace(/\/+/g, '/');
}

function buildStats(chunks) {
  const documentFrequency = {};
  const totalTermCount = chunks.reduce((sum, chunk) => sum + chunk.termCount, 0);

  for (const chunk of chunks) {
    for (const term of Object.keys(chunk.terms)) {
      documentFrequency[term] = (documentFrequency[term] ?? 0) + 1;
    }
  }

  const documentCount = chunks.length;
  const idf = Object.fromEntries(
    Object.entries(documentFrequency)
      .map(([term, frequency]) => [term, Number(Math.log(1 + (documentCount - frequency + 0.5) / (frequency + 0.5)).toFixed(6))])
      .sort(([left], [right]) => left.localeCompare(right)),
  );

  return {
    documentCount,
    averageTermCount: documentCount > 0 ? Number((totalTermCount / documentCount).toFixed(2)) : 0,
    idf,
  };
}

function getTermCounts(input) {
  return tokenize(input).reduce((acc, term) => {
    acc[term] = (acc[term] ?? 0) + 1;
    return acc;
  }, {});
}

function tokenize(input) {
  return input
    .toLowerCase()
    .replace(/['’]/g, '')
    .match(/[a-z0-9]+/g)
    ?.filter((term) => term.length > 2 && !stopWords.has(term))
    .map(stemTerm) ?? [];
}

function stemTerm(term) {
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

function compactWhitespace(input) {
  return input.replace(/\s+/g, ' ').trim();
}

function countWords(input) {
  return input.split(/\s+/).filter(Boolean).length;
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(input) {
  return input.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toPosix(input) {
  return input.split(path.sep).join('/');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
