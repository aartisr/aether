import { createDefaultCmsPageData } from './puck-config';
import { getCmsEditablePageById, getCmsEditablePageByPath } from './page-registry';

describe('puck-config interactive route defaults', () => {
  const assertRouteContainsBlock = (pageId: string, expectedBlockType: string) => {
    const page = getCmsEditablePageById(pageId);
    expect(page).toBeDefined();

    const data = createDefaultCmsPageData(page!);
    const content = Array.isArray(data.content) ? data.content : [];

    expect(content.some((block) => block.type === expectedBlockType)).toBe(true);

    content.forEach((block) => {
      expect(typeof block.props?.id).toBe('string');
      expect((block.props?.id as string).length).toBeGreaterThan(0);
    });
  };

  it('seeds /ask with AskAssistantBlock', () => {
    assertRouteContainsBlock('ask', 'AskAssistantBlock');
  });

  it('seeds /echo with EchoStudioBlock', () => {
    assertRouteContainsBlock('echo', 'EchoStudioBlock');
  });

  it('seeds /feedback with FeedbackFormBlock', () => {
    assertRouteContainsBlock('feedback', 'FeedbackFormBlock');
  });

  it('seeds /fairness-governance with FairnessDashboardBlock', () => {
    assertRouteContainsBlock('fairness-governance', 'FairnessDashboardBlock');
  });

  it('seeds /resilience-pathway with ResilienceToolkitBlock', () => {
    assertRouteContainsBlock('resilience-pathway', 'ResilienceToolkitBlock');
  });
});

describe('cms interactive route mapping', () => {
  it('maps /ask to ask page', () => {
    expect(getCmsEditablePageByPath('/ask')?.id).toBe('ask');
  });

  it('maps /echo to echo page', () => {
    expect(getCmsEditablePageByPath('/echo')?.id).toBe('echo');
  });

  it('maps /feedback to feedback page', () => {
    expect(getCmsEditablePageByPath('/feedback')?.id).toBe('feedback');
  });

  it('maps /fairness-governance to fairness-governance page', () => {
    expect(getCmsEditablePageByPath('/fairness-governance')?.id).toBe('fairness-governance');
  });

  it('maps /resilience-pathway to resilience-pathway page', () => {
    expect(getCmsEditablePageByPath('/resilience-pathway')?.id).toBe('resilience-pathway');
  });
});
