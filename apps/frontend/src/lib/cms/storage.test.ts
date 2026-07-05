import path from 'path';

describe('cms storage', () => {
  const originalCwd = process.cwd();
  const frontendRoot = path.resolve(__dirname, '../../..');

  afterEach(() => {
    process.chdir(originalCwd);
    jest.resetModules();
  });

  it('reads the app-local puck page file even when the workspace root is the cwd', async () => {
    process.chdir(frontendRoot);

    const { readCmsPageData } = await import('./storage');
    const data = await readCmsPageData('mentors');

    expect(data?.root?.props?.title).toBe('Mentors');
    expect(data?.content?.[0]?.type).toBe('HeroBlock');
    expect(data?.content?.[0]?.props?.title).toBe('The Mentors Behind Aether');
  });
});
