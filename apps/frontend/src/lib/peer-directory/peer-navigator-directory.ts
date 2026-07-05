export type PeerContactModality = 'chat' | 'phone' | 'video';

export type PeerNavigatorRecord = {
  id: string;
  name: string;
  background: string;
  pronouns: string;
  goals: string[];
  modalities: PeerContactModality[];
};

const peerNavigatorDirectory: PeerNavigatorRecord[] = [
  {
    id: 'nav-alex',
    name: 'Alex',
    background: 'LGBTQ+',
    pronouns: 'they/them',
    goals: ['belonging', 'campus resources'],
    modalities: ['chat', 'video'],
  },
  {
    id: 'nav-priya',
    name: 'Priya',
    background: 'International Student',
    pronouns: 'she/her',
    goals: ['belonging', 'career navigation', 'campus resources'],
    modalities: ['chat', 'phone'],
  },
  {
    id: 'nav-jordan',
    name: 'Jordan',
    background: 'First-generation College Student',
    pronouns: 'he/him',
    goals: ['academic stress', 'focus and study rhythm', 'career navigation'],
    modalities: ['chat', 'video'],
  },
  {
    id: 'nav-samira',
    name: 'Samira',
    background: 'Student of Color',
    pronouns: 'she/her',
    goals: ['belonging', 'sleep routines', 'academic stress'],
    modalities: ['chat', 'phone', 'video'],
  },
  {
    id: 'nav-taylor',
    name: 'Taylor',
    background: 'Neurodivergent',
    pronouns: 'they/them',
    goals: ['focus and study rhythm', 'sleep routines', 'academic stress'],
    modalities: ['chat'],
  },
  {
    id: 'nav-chris',
    name: 'Chris',
    background: 'Veteran',
    pronouns: 'he/him',
    goals: ['career navigation', 'belonging'],
    modalities: ['chat', 'phone'],
  },
];

export function listPeerNavigators(): PeerNavigatorRecord[] {
  return peerNavigatorDirectory.map((peer) => ({
    ...peer,
    goals: [...peer.goals],
    modalities: [...peer.modalities],
  }));
}
