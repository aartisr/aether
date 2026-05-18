import FeedbackIntake from '../../components/feedback/FeedbackIntake';
import { JsonLd } from '../../components/page/PagePrimitives';
import { assertPageEnabledForRequest } from '../../lib/page-flags';
import { createPageMetadata, createWebPageJsonLd, siteName } from '../../lib/site';

const feedbackTitle = 'Feedback Observatory';
const feedbackDescription =
  'A structured, privacy-aware page for reporting issues, requesting fixes, and suggesting useful additions for Aether.';

export const metadata = createPageMetadata({
  title: `${feedbackTitle} | ${siteName}`,
  description: feedbackDescription,
  path: '/feedback',
  keywords: [
    'product feedback',
    'website feedback form',
    'feature request',
    'bug report',
    'accessibility feedback',
    'student wellbeing product feedback',
  ],
});

export default function FeedbackPage() {
  assertPageEnabledForRequest('feedback');

  const webPageJsonLd = createWebPageJsonLd({
    name: feedbackTitle,
    path: '/feedback',
    description: feedbackDescription,
    about: [
      'product feedback',
      'bug reporting',
      'feature requests',
      'accessibility feedback',
      'privacy feedback',
      'student resilience platform improvement',
    ],
  });

  const contactPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: feedbackTitle,
    description: feedbackDescription,
    url: webPageJsonLd.url,
    isPartOf: webPageJsonLd.isPartOf,
    potentialAction: {
      '@type': 'CommunicateAction',
      name: 'Submit structured product feedback',
      target: webPageJsonLd.url,
    },
  };

  return (
    <>
      <JsonLd idPrefix="feedback-jsonld" data={[webPageJsonLd, contactPageJsonLd]} />
      <FeedbackIntake
        productName={siteName}
        title={feedbackTitle}
        description="Help improve a page, report an issue, or suggest what Aether should support next. The form turns rough thoughts into clear product signals without needing an account."
      />
    </>
  );
}
