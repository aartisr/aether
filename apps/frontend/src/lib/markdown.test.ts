import { markdownToHtml } from './markdown';

describe('markdownToHtml', () => {
  it('escapes unsafe inline HTML', () => {
    expect(markdownToHtml('<script>alert("xss")</script>')).toContain(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });

  it('rejects javascript and protocol-relative links', () => {
    const html = markdownToHtml('[bad](javascript:alert(1)) [also bad](//evil.example)');

    expect(html).toContain('<a href="#">bad</a>');
    expect(html).toContain('<a href="#">also bad</a>');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('//evil.example');
  });

  it('marks external http links as isolated new tabs', () => {
    const html = markdownToHtml('[site](HTTPS://example.com)');

    expect(html).toContain('href="HTTPS://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });
});
