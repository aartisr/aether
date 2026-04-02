function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:|\/)/i.test(trimmed)) {
    return trimmed;
  }
  return '#';
}

function formatInlineMarkdown(text: string): string {
  const escaped = escapeHtml(text);

  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, url: string) => {
      const safeUrl = sanitizeUrl(url);
      const rel = safeUrl.startsWith('http') ? ' rel="noopener noreferrer" target="_blank"' : '';
      return `<a href="${escapeHtml(safeUrl)}"${rel}>${label}</a>`;
    });
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];

  let paragraph: string[] = [];
  let listItems: string[] = [];
  let inCode = false;
  let codeFence: string[] = [];

  function flushParagraph() {
    if (paragraph.length === 0) {
      return;
    }
    blocks.push(`<p>${formatInlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (listItems.length === 0) {
      return;
    }
    blocks.push(`<ul>${listItems.map((item) => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</ul>`);
    listItems = [];
  }

  function flushCode() {
    if (codeFence.length === 0) {
      return;
    }
    blocks.push(`<pre><code>${escapeHtml(codeFence.join('\n'))}</code></pre>`);
    codeFence = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('```')) {
      flushParagraph();
      flushList();

      if (!inCode) {
        inCode = true;
      } else {
        inCode = false;
        flushCode();
      }
      continue;
    }

    if (inCode) {
      codeFence.push(rawLine);
      continue;
    }

    if (line.length === 0) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line === '---') {
      flushParagraph();
      flushList();
      blocks.push('<hr />');
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      flushList();
      blocks.push(`<h1>${formatInlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push(`<h2>${formatInlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push(`<h3>${formatInlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      listItems.push(line.slice(2));
      continue;
    }

    if (line.startsWith('> ')) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote>${formatInlineMarkdown(line.slice(2))}</blockquote>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();

  if (inCode) {
    flushCode();
  }

  return blocks.join('\n');
}
