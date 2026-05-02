import { getPrimaryNavigationForRequest, getSecondaryNavigationForRequest, trustSignals } from '../../lib/navigation';
import { shareTagline, siteName } from '../../lib/site';
import SiteHeaderClient from './SiteHeaderClient';

export default function SiteHeader() {
  return (
    <SiteHeaderClient
      primaryNavigation={getPrimaryNavigationForRequest()}
      secondaryNavigation={getSecondaryNavigationForRequest()}
      trustSignals={trustSignals}
      shareTagline={shareTagline}
      siteName={siteName}
    />
  );
}
