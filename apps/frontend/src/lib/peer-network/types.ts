export type PeerNetworkRole = "seeker" | "navigator";

export type PeerContactModality = "chat" | "phone" | "video" | "in_person";

export type PeerSupportStyle = "listening" | "planning" | "accountability" | "resources" | "encouragement";

export type PeerUrgencyBand = "not_urgent" | "soon" | "high_concern" | "immediate_danger";

export type PeerNavigatorStatus =
  | "applied"
  | "training"
  | "verified"
  | "active"
  | "paused"
  | "suspended"
  | "retired";

export type PeerTrainingStatus = "not_started" | "in_progress" | "complete" | "expired";

export type PeerVerificationStatus = "not_started" | "pending" | "approved" | "rejected";

export interface PeerAvailabilityWindow {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startMinute: number;
  endMinute: number;
  timezone: string;
}

export interface PeerPrivacySettings {
  useSensitiveForMatching: boolean;
  showSensitiveToMatch: boolean;
}

export interface PeerMatchBoundaries {
  avoidParticipantIds?: string[];
  avoidTopics?: string[];
}

export interface PeerSeekerState {
  currentNeed: string;
  urgencyBand: PeerUrgencyBand;
  desiredPeerTraits?: string[];
  fallbackPreference?: "auto_backup" | "ask_first" | "resources";
}

export interface PeerNavigatorState {
  status: PeerNavigatorStatus;
  trainingStatus: PeerTrainingStatus;
  verificationStatus: PeerVerificationStatus;
  topicsCanSupport: string[];
  topicsCannotSupport: string[];
  maxActiveMatches: number;
  currentActiveMatches: number;
  responseSlaHours?: number;
}

export interface PeerNetworkProfile {
  id: string;
  roles: PeerNetworkRole[];
  displayName?: string;
  languages: string[];
  modalities: PeerContactModality[];
  availabilityWindows: PeerAvailabilityWindow[];
  supportGoals: string[];
  supportStyles: PeerSupportStyle[];
  identityTags?: string[];
  livedExperienceTags?: string[];
  boundaries?: PeerMatchBoundaries;
  privacy: PeerPrivacySettings;
  seeker?: PeerSeekerState;
  navigator?: PeerNavigatorState;
  isAvailable?: boolean;
}

export interface PeerNetworkMatchAttributes {
  roles: PeerNetworkRole[];
  languages: string[];
  modalities: PeerContactModality[];
  availabilityWindows: PeerAvailabilityWindow[];
  supportGoals: string[];
  supportStyles: PeerSupportStyle[];
  identityTags: string[];
  livedExperienceTags: string[];
  useSensitiveForMatching: boolean;
  showSensitiveToMatch: boolean;
  avoidParticipantIds: string[];
  avoidTopics: string[];
  urgencyBand?: PeerUrgencyBand;
  navigatorStatus?: PeerNavigatorStatus;
  trainingStatus?: PeerTrainingStatus;
  verificationStatus?: PeerVerificationStatus;
  topicsCanSupport: string[];
  topicsCannotSupport: string[];
  maxActiveMatches: number;
  currentActiveMatches: number;
}
