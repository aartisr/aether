import fs from 'node:fs';
import path from 'node:path';

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  lastModified?: string;
  excerpt: string;
  tags: string[];
  readingTimeMinutes: number;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

export type BlogSourceAdapter = {
  listPosts: () => Promise<BlogPostMeta[]>;
  getPostBySlug: (slug: string) => Promise<BlogPost | null>;
};

type FrontMatter = {
  title?: string;
  date?: string;
  excerpt?: string;
  tags?: string;
};

const BLOG_REVALIDATE_SECONDS = 300;

let allPostsPromise: Promise<BlogPostMeta[]> | null = null;
const postBySlugPromise = new Map<string, Promise<BlogPost | null>>();

const blogSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSafeBlogSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && blogSlugPattern.test(slug);
}

function resolveBlogDir(): string {
  const configuredDir = process.env.BLOG_CONTENT_DIR;

  if (configuredDir) {
    const absoluteConfiguredDir = path.isAbsolute(configuredDir)
      ? configuredDir
      : path.resolve(process.cwd(), configuredDir);

    if (fs.existsSync(absoluteConfiguredDir)) {
      return absoluteConfiguredDir;
    }
  }

  const candidates = [
    path.resolve(process.cwd(), 'content/blog'),
    path.resolve(process.cwd(), '../../content/blog'),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  return found ?? candidates[0];
}

const BLOG_DIR = resolveBlogDir();

function parseFrontMatter(raw: string): { frontMatter: FrontMatter; content: string } {
  if (!raw.startsWith('---\n')) {
    return { frontMatter: {}, content: raw.trim() };
  }

  const end = raw.indexOf('\n---\n', 4);
  if (end < 0) {
    return { frontMatter: {}, content: raw.trim() };
  }

  const frontMatterBlock = raw.slice(4, end).trim();
  const content = raw.slice(end + 5).trim();
  const frontMatter: FrontMatter = {};

  for (const line of frontMatterBlock.split('\n')) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (key === 'title' || key === 'date' || key === 'excerpt' || key === 'tags') {
      frontMatter[key] = value;
    }
  }

  return { frontMatter, content };
}

function toPost(slug: string, raw: string, lastModified?: string): BlogPost {
  const { frontMatter, content } = parseFrontMatter(raw);
  const readingTimeMinutes = estimateReadingTimeMinutes(`${frontMatter.excerpt || ''} ${content}`);

  return {
    slug,
    title: frontMatter.title || slug,
    date: frontMatter.date || '1970-01-01',
    lastModified,
    excerpt: frontMatter.excerpt || 'No excerpt available.',
    tags: (frontMatter.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    readingTimeMinutes,
    content,
  };
}

function estimateReadingTimeMinutes(input: string): number {
  const plainText = input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!plainText) {
    return 1;
  }

  const words = plainText.split(' ').length;
  return Math.max(1, Math.ceil(words / 220));
}

function compareByDateDescending(a: BlogPostMeta, b: BlogPostMeta): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

type RemoteJsonPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags?: string[];
  content: string;
};

const localMarkdownAdapter: BlogSourceAdapter = {
  async listPosts() {
    if (!fs.existsSync(BLOG_DIR)) {
      return [];
    }

    const entries = await fs.promises.readdir(BLOG_DIR, { withFileTypes: true });
    const markdownEntries = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md'));

    const posts = await Promise.all(
      markdownEntries.map(async (entry) => {
        const slug = entry.name.replace(/\.md$/, '');
        const filePath = path.join(BLOG_DIR, entry.name);
        const [raw, stats] = await Promise.all([
          fs.promises.readFile(filePath, 'utf8'),
          fs.promises.stat(filePath),
        ]);
        const post = toPost(slug, raw, stats.mtime.toISOString());
        return {
          slug: post.slug,
          title: post.title,
          date: post.date,
          lastModified: post.lastModified,
          excerpt: post.excerpt,
          tags: post.tags,
          readingTimeMinutes: post.readingTimeMinutes,
        };
      }),
    );

    return posts
      .filter((post) => isSafeBlogSlug(post.slug))
      .sort(compareByDateDescending);
  },
  async getPostBySlug(slug: string) {
    if (!isSafeBlogSlug(slug)) {
      return null;
    }

    const filePath = path.join(BLOG_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const [raw, stats] = await Promise.all([
      fs.promises.readFile(filePath, 'utf8'),
      fs.promises.stat(filePath),
    ]);
    return toPost(slug, raw, stats.mtime.toISOString());
  },
};

const remoteJsonAdapter: BlogSourceAdapter = {
  async listPosts() {
    const remoteUrl = process.env.BLOG_REMOTE_JSON_URL;
    if (!remoteUrl) {
      return [];
    }

    try {
      const response = await fetch(remoteUrl, {
        next: {
          revalidate: BLOG_REVALIDATE_SECONDS,
          tags: ['blog-content'],
        },
      });
      if (!response.ok) {
        return [];
      }

      const posts = (await response.json()) as RemoteJsonPost[];
      return posts
        .filter((post) => isSafeBlogSlug(post.slug))
        .map((post) => ({
          slug: post.slug,
          title: post.title,
          date: post.date,
          lastModified: post.date,
          excerpt: post.excerpt,
          tags: post.tags ?? [],
          readingTimeMinutes: estimateReadingTimeMinutes(`${post.excerpt} ${post.content}`),
        }))
        .sort(compareByDateDescending);
    } catch {
      return [];
    }
  },
  async getPostBySlug(slug: string) {
    if (!isSafeBlogSlug(slug)) {
      return null;
    }

    const remoteUrl = process.env.BLOG_REMOTE_JSON_URL;
    if (!remoteUrl) {
      return null;
    }

    try {
      const response = await fetch(remoteUrl, {
        next: {
          revalidate: BLOG_REVALIDATE_SECONDS,
          tags: ['blog-content'],
        },
      });
      if (!response.ok) {
        return null;
      }

      const posts = (await response.json()) as RemoteJsonPost[];
      const match = posts.find((post) => post.slug === slug);

      if (!match) {
        return null;
      }

      return {
        slug: match.slug,
        title: match.title,
        date: match.date,
        lastModified: match.date,
        excerpt: match.excerpt,
        tags: match.tags ?? [],
        readingTimeMinutes: estimateReadingTimeMinutes(`${match.excerpt} ${match.content}`),
        content: match.content,
      };
    } catch {
      return null;
    }
  },
};

function getAdapter(): BlogSourceAdapter {
  const source = process.env.BLOG_SOURCE ?? 'local-markdown';
  if (source === 'remote-json') {
    return remoteJsonAdapter;
  }

  return localMarkdownAdapter;
}

export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  if (!allPostsPromise) {
    allPostsPromise = getAdapter().listPosts();
  }

  return allPostsPromise;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!postBySlugPromise.has(slug)) {
    postBySlugPromise.set(slug, getAdapter().getPostBySlug(slug));
  }

  return postBySlugPromise.get(slug) as Promise<BlogPost | null>;
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  return posts.map((post) => post.slug);
}

export async function getRelatedBlogPosts(
  currentSlug: string,
  tags: string[],
  limit = 3,
): Promise<BlogPostMeta[]> {
  const posts = await getAllBlogPosts();
  const currentTags = new Set(tags.map((tag) => tag.toLowerCase()));

  const scored = posts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      const sharedTagCount = post.tags.filter((tag) => currentTags.has(tag.toLowerCase())).length;
      return { post, sharedTagCount };
    })
    .sort((a, b) => {
      if (b.sharedTagCount !== a.sharedTagCount) {
        return b.sharedTagCount - a.sharedTagCount;
      }
      return compareByDateDescending(a.post, b.post);
    });

  return scored.slice(0, limit).map((entry) => entry.post);
}
