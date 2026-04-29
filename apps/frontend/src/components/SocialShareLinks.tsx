import { createShareUrls, shareTagline } from '../lib/site';

type SocialShareLinksProps = {
  path: string;
  title: string;
  text?: string;
  compact?: boolean;
};

const shareTargets = [
  { key: 'x', label: 'X' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'email', label: 'Email' },
] as const;

export default function SocialShareLinks({
  path,
  title,
  text = shareTagline,
  compact = false,
}: SocialShareLinksProps) {
  const shareUrls = createShareUrls({ path, title, text });

  return (
    <nav aria-label={`Share ${title}`} className={compact ? 'social-share social-share-compact' : 'social-share'}>
      <span className="social-share-label">Share</span>
      {shareTargets.map((target) => (
        <a
          key={target.key}
          href={shareUrls[target.key]}
          target={target.key === 'email' ? undefined : '_blank'}
          rel={target.key === 'email' ? undefined : 'noopener noreferrer'}
          className="social-share-link"
        >
          {target.label}
        </a>
      ))}
    </nav>
  );
}
