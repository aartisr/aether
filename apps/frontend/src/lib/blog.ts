import fs from 'node:fs';
import path from 'node:path';

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
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

function toPost(slug: string, raw: string): BlogPost {
  const { frontMatter, content } = parseFrontMatter(raw);

  return {
    slug,
    title: frontMatter.title || slug,
    date: frontMatter.date || '1970-01-01',
    excerpt: frontMatter.excerpt || 'No excerpt available.',
    tags: (frontMatter.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    content,
  };
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

    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => {
        const slug = entry.name.replace(/\.md$/, '');
        const raw = fs.readFileSync(path.join(BLOG_DIR, entry.name), 'utf8');
        const post = toPost(slug, raw);
        return {
          slug: post.slug,
          title: post.title,
          date: post.date,
          excerpt: post.excerpt,
          tags: post.tags,
        };
      })
      .sort(compareByDateDescending);
  },
  async getPostBySlug(slug: string) {
    const filePath = path.join(BLOG_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const raw = await fs.promises.readFile(filePath, 'utf8');
    return toPost(slug, raw);
  },
};

const remoteJsonAdapter: BlogSourceAdapter = {
  async listPosts() {
    const remoteUrl = process.env.BLOG_REMOTE_JSON_URL;
    if (!remoteUrl) {
      return [];
    }

    try {
      const response = await fetch(remoteUrl, { cache: 'force-cache' });
      if (!response.ok) {
        return [];
      }

      const posts = (await response.json()) as RemoteJsonPost[];
      return posts
        .map((post) => ({
          slug: post.slug,
          title: post.title,
          date: post.date,
          excerpt: post.excerpt,
          tags: post.tags ?? [],
        }))
        .sort(compareByDateDescending);
    } catch {
      return [];
    }
  },
  async getPostBySlug(slug: string) {
    const remoteUrl = process.env.BLOG_REMOTE_JSON_URL;
    if (!remoteUrl) {
      return null;
    }

    try {
      const response = await fetch(remoteUrl, { cache: 'force-cache' });
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
        excerpt: match.excerpt,
        tags: match.tags ?? [],
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
  return getAdapter().listPosts();
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return getAdapter().getPostBySlug(slug);
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  return posts.map((post) => post.slug);
}
