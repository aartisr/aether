import {
  clampScore,
  createEntityMatchingEngine,
  createMatchProfileAdapter,
  toMatchProfile,
  type EntityMatchEngineConfig,
  type MatchProfile,
  type Phase1Config,
} from "../peer-matching";
import type {
  PeerAvailabilityWindow,
  PeerNetworkMatchAttributes,
  PeerNetworkProfile,
} from "./types";

type PeerNetworkMatchProfile = MatchProfile<PeerNetworkMatchAttributes>;

export type PeerNetworkMatchingConfig = Omit<
  Partial<EntityMatchEngineConfig<PeerNetworkProfile, PeerNetworkMatchAttributes>>,
  "adapter"
>;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function normalizeList(values: string[] | undefined) {
  return [...new Set((values ?? []).map(normalize).filter(Boolean))];
}

function overlapCount(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value)).length;
}

function hasOverlap(left: string[], right: string[]) {
  return overlapCount(left, right) > 0;
}

function hasAvailabilityOverlap(left: PeerAvailabilityWindow[], right: PeerAvailabilityWindow[]) {
  return left.some((leftWindow) =>
    right.some((rightWindow) => {
      if (leftWindow.dayOfWeek !== rightWindow.dayOfWeek) {
        return false;
      }

      const startsBeforeOtherEnds = leftWindow.startMinute < rightWindow.endMinute;
      const endsAfterOtherStarts = leftWindow.endMinute > rightWindow.startMinute;
      return startsBeforeOtherEnds && endsAfterOtherStarts;
    })
  );
}

function hasRole(profile: PeerNetworkMatchProfile, role: "seeker" | "navigator") {
  return profile.attributes.roles.includes(role);
}

function remainingNavigatorCapacity(attributes: PeerNetworkMatchAttributes) {
  return Math.max(0, attributes.maxActiveMatches - attributes.currentActiveMatches);
}

function isNavigatorEligible(profile: PeerNetworkMatchProfile) {
  const attributes = profile.attributes;
  return (
    hasRole(profile, "navigator") &&
    attributes.navigatorStatus === "active" &&
    attributes.trainingStatus === "complete" &&
    attributes.verificationStatus === "approved" &&
    remainingNavigatorCapacity(attributes) > 0
  );
}

function isImmediateHelpFlow(profile: PeerNetworkMatchProfile) {
  return profile.attributes.urgencyBand === "immediate_danger";
}

function hasBlockedParticipant(source: PeerNetworkMatchProfile, target: PeerNetworkMatchProfile) {
  return source.attributes.avoidParticipantIds.includes(target.id);
}

function hasTopicExclusion(source: PeerNetworkMatchProfile, target: PeerNetworkMatchProfile) {
  return (
    hasOverlap(source.attributes.supportGoals, target.attributes.topicsCannotSupport) ||
    hasOverlap(source.attributes.avoidTopics, target.attributes.topicsCanSupport)
  );
}

function scoreRatio(matches: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return clampScore(matches / total);
}

function scoreSeekerToNavigator(source: PeerNetworkMatchProfile, target: PeerNetworkMatchProfile) {
  const sourceAttributes = source.attributes;
  const targetAttributes = target.attributes;
  const goalFit = scoreRatio(
    overlapCount(sourceAttributes.supportGoals, targetAttributes.topicsCanSupport),
    Math.max(1, sourceAttributes.supportGoals.length)
  );
  const styleFit = scoreRatio(
    overlapCount(sourceAttributes.supportStyles, targetAttributes.supportStyles),
    Math.max(1, sourceAttributes.supportStyles.length)
  );
  const languageFit = hasOverlap(sourceAttributes.languages, targetAttributes.languages) ? 1 : 0;
  const modalityFit = hasOverlap(sourceAttributes.modalities, targetAttributes.modalities) ? 1 : 0;
  const availabilityFit = hasAvailabilityOverlap(
    sourceAttributes.availabilityWindows,
    targetAttributes.availabilityWindows
  )
    ? 1
    : 0;
  const sensitiveFit =
    sourceAttributes.useSensitiveForMatching && targetAttributes.useSensitiveForMatching
      ? Math.min(
          1,
          overlapCount(sourceAttributes.identityTags, targetAttributes.identityTags) +
            overlapCount(sourceAttributes.livedExperienceTags, targetAttributes.livedExperienceTags)
        )
      : 0;

  return clampScore(
    0.24 * goalFit +
      0.16 * styleFit +
      0.18 * languageFit +
      0.14 * modalityFit +
      0.18 * availabilityFit +
      0.1 * sensitiveFit
  );
}

function scoreNavigatorToSeeker(source: PeerNetworkMatchProfile, target: PeerNetworkMatchProfile) {
  const sourceAttributes = source.attributes;
  const targetAttributes = target.attributes;

  if (hasTopicExclusion(target, source)) {
    return 0;
  }

  const goalFit = scoreRatio(
    overlapCount(targetAttributes.supportGoals, sourceAttributes.topicsCanSupport),
    Math.max(1, targetAttributes.supportGoals.length)
  );
  const styleFit = scoreRatio(
    overlapCount(sourceAttributes.supportStyles, targetAttributes.supportStyles),
    Math.max(1, targetAttributes.supportStyles.length)
  );
  const languageFit = hasOverlap(sourceAttributes.languages, targetAttributes.languages) ? 1 : 0;
  const modalityFit = hasOverlap(sourceAttributes.modalities, targetAttributes.modalities) ? 1 : 0;
  const availabilityFit = hasAvailabilityOverlap(
    sourceAttributes.availabilityWindows,
    targetAttributes.availabilityWindows
  )
    ? 1
    : 0;
  const capacityFit = remainingNavigatorCapacity(sourceAttributes) > 0 ? 1 : 0;

  return clampScore(
    0.3 * goalFit +
      0.15 * styleFit +
      0.15 * languageFit +
      0.12 * modalityFit +
      0.18 * availabilityFit +
      0.1 * capacityFit
  );
}

function directedPeerNetworkScore(source: PeerNetworkMatchProfile, target: PeerNetworkMatchProfile) {
  if (hasRole(source, "seeker") && hasRole(target, "navigator")) {
    return scoreSeekerToNavigator(source, target);
  }

  if (hasRole(source, "navigator") && hasRole(target, "seeker")) {
    return scoreNavigatorToSeeker(source, target);
  }

  return 0;
}

function hardPeerNetworkFilter(source: PeerNetworkMatchProfile, target: PeerNetworkMatchProfile) {
  if (source.id === target.id) {
    return false;
  }

  if (!hasRole(source, "seeker") || !isNavigatorEligible(target)) {
    return false;
  }

  if (isImmediateHelpFlow(source) || hasBlockedParticipant(source, target) || hasTopicExclusion(source, target)) {
    return false;
  }

  return (
    hasOverlap(source.attributes.languages, target.attributes.languages) &&
    hasOverlap(source.attributes.modalities, target.attributes.modalities) &&
    hasAvailabilityOverlap(source.attributes.availabilityWindows, target.attributes.availabilityWindows)
  );
}

export const peerNetworkProfileAdapter = createMatchProfileAdapter<
  PeerNetworkProfile,
  PeerNetworkMatchAttributes
>({
  id: (profile) => profile.id,
  isAvailable: (profile) => profile.isAvailable !== false,
  capacity: (profile) =>
    profile.navigator
      ? Math.max(0, profile.navigator.maxActiveMatches - profile.navigator.currentActiveMatches)
      : 1,
  attributes: (profile) => ({
    roles: profile.roles,
    languages: normalizeList(profile.languages),
    modalities: profile.modalities,
    availabilityWindows: profile.availabilityWindows,
    supportGoals: normalizeList(profile.supportGoals),
    supportStyles: profile.supportStyles,
    identityTags: normalizeList(profile.identityTags),
    livedExperienceTags: normalizeList(profile.livedExperienceTags),
    useSensitiveForMatching: profile.privacy.useSensitiveForMatching,
    showSensitiveToMatch: profile.privacy.showSensitiveToMatch,
    avoidParticipantIds: profile.boundaries?.avoidParticipantIds ?? [],
    avoidTopics: normalizeList(profile.boundaries?.avoidTopics),
    urgencyBand: profile.seeker?.urgencyBand,
    navigatorStatus: profile.navigator?.status,
    trainingStatus: profile.navigator?.trainingStatus,
    verificationStatus: profile.navigator?.verificationStatus,
    topicsCanSupport: normalizeList(profile.navigator?.topicsCanSupport),
    topicsCannotSupport: normalizeList(profile.navigator?.topicsCannotSupport),
    maxActiveMatches: profile.navigator?.maxActiveMatches ?? 1,
    currentActiveMatches: profile.navigator?.currentActiveMatches ?? 0,
  }),
});

export function createPeerNetworkMatchingEngine(config: PeerNetworkMatchingConfig = {}) {
  const phase1: Phase1Config<PeerNetworkMatchProfile> = {
    maxCandidatesPerProfile: 50,
    minReciprocalScore: 0.2,
    hardFilter: hardPeerNetworkFilter,
    directedScore: directedPeerNetworkScore,
    ...config.phase1,
  };

  return createEntityMatchingEngine<PeerNetworkProfile, PeerNetworkMatchAttributes>({
    adapter: peerNetworkProfileAdapter,
    defaults: {
      phase: "phase3",
      maxAssignments: 3,
      ...config.defaults,
    },
    capacity: (profile) =>
      hasRole(profile, "navigator") ? remainingNavigatorCapacity(profile.attributes) : profile.capacity,
    initialState: config.initialState,
    phase1,
    phase2: config.phase2,
    phase3: {
      qualityFloor: 0.25,
      explorationWeight: 0.12,
      uncertaintyWeight: 0.08,
      randomJitter: 0.01,
      ...config.phase3,
    },
  });
}

export function explainPeerNetworkMatch(seeker: PeerNetworkProfile, navigator: PeerNetworkProfile) {
  const seekerProfile = toMatchProfile(seeker, peerNetworkProfileAdapter);
  const navigatorProfile = toMatchProfile(navigator, peerNetworkProfileAdapter);
  const factors: string[] = [];

  if (hasOverlap(seekerProfile.attributes.supportGoals, navigatorProfile.attributes.topicsCanSupport)) {
    factors.push("Supports your selected goals");
  }

  if (hasOverlap(seekerProfile.attributes.supportStyles, navigatorProfile.attributes.supportStyles)) {
    factors.push("Matches your preferred support style");
  }

  if (hasOverlap(seekerProfile.attributes.languages, navigatorProfile.attributes.languages)) {
    factors.push("Shares a preferred language");
  }

  if (hasOverlap(seekerProfile.attributes.modalities, navigatorProfile.attributes.modalities)) {
    factors.push("Available in your preferred contact format");
  }

  if (
    hasAvailabilityOverlap(
      seekerProfile.attributes.availabilityWindows,
      navigatorProfile.attributes.availabilityWindows
    )
  ) {
    factors.push("Has overlapping availability");
  }

  if (
    seekerProfile.attributes.useSensitiveForMatching &&
    navigatorProfile.attributes.useSensitiveForMatching &&
    (hasOverlap(seekerProfile.attributes.identityTags, navigatorProfile.attributes.identityTags) ||
      hasOverlap(seekerProfile.attributes.livedExperienceTags, navigatorProfile.attributes.livedExperienceTags))
  ) {
    factors.push("Matches an optional lived-context preference");
  }

  return factors;
}
