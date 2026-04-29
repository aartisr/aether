import { isSafeBlogSlug } from './blog';

describe('blog slug safety', () => {
  it('allows canonical lowercase hyphenated slugs', () => {
    expect(isSafeBlogSlug('practical-path-01-stabilize-your-baseline')).toBe(true);
  });

  it('rejects slugs that could escape the content directory or create ambiguous routes', () => {
    expect(isSafeBlogSlug('../README')).toBe(false);
    expect(isSafeBlogSlug('nested/path')).toBe(false);
    expect(isSafeBlogSlug('Mixed-Case')).toBe(false);
    expect(isSafeBlogSlug('trailing-')).toBe(false);
  });
});
