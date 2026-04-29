export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface ResearchReference {
  name: string;
  url: string;
  category: 'institute' | 'platform' | 'framework' | 'crisis-service';
  evidenceSignal: string;
}

export interface CheckInQuestion {
  id: string;
  prompt: string;
  domain: 'stress' | 'safety' | 'connection' | 'sleep' | 'focus';
}

export interface SupportResource {
  id: string;
  title: string;
  type: 'crisis' | 'peer' | 'self-guided' | 'professional' | 'campus';
  description: string;
  tags: string[];
  availability: string;
  actionLabel: string;
  actionHref: string;
}

export interface HabitTemplate {
  id: string;
  title: string;
  minutes: number;
  tags: string[];
  rationale: string;
}

export interface PeerCircle {
  id: string;
  name: string;
  audience: string;
  focus: string[];
  format: string;
}

export const resiliencePathwayStages = [
  {
    title: 'Early Signal Detection',
    description: 'Weekly check-in identifies stress, connection, sleep, and safety trends early.',
  },
  {
    title: 'Immediate Stabilization',
    description: 'Students can create a practical safety plan and activate crisis support in one click.',
  },
  {
    title: 'Right-Sized Support',
    description: 'Resource navigator routes students to peer, self-guided, campus, or urgent options.',
  },
  {
    title: 'Social Reinforcement',
    description: 'Peer circles reduce isolation and create identity-safe belonging pathways.',
  },
  {
    title: 'Sustainable Growth',
    description: 'Habit planning builds long-term resilience through short, repeatable daily actions.',
  },
];

export const researchReferences: ResearchReference[] = [
  {
    name: 'The Jed Foundation',
    url: 'https://jedfoundation.org/',
    category: 'institute',
    evidenceSignal: 'School systems strengthening + youth suicide prevention pathway.',
  },
  {
    name: 'Active Minds',
    url: 'https://activeminds.org/',
    category: 'institute',
    evidenceSignal: 'Peer-led campus chapters and ASK model for early support.',
  },
  {
    name: 'NAMI',
    url: 'https://www.nami.org/',
    category: 'institute',
    evidenceSignal: 'Helpline, local affiliate routing, education and support groups.',
  },
  {
    name: 'Mental Health America',
    url: 'https://mhanational.org/',
    category: 'institute',
    evidenceSignal: 'Early screening and prevention resources at population scale.',
  },
  {
    name: 'SAMHSA 988',
    url: 'https://www.samhsa.gov/find-help/988',
    category: 'crisis-service',
    evidenceSignal: '24/7 free, confidential crisis response and implementation guidance.',
  },
  {
    name: '988 Lifeline',
    url: 'https://988lifeline.org/',
    category: 'crisis-service',
    evidenceSignal: 'Multi-channel urgent support (call/text/chat) and accessibility options.',
  },
  {
    name: 'WHO Mental Health',
    url: 'https://www.who.int/health-topics/mental-health',
    category: 'framework',
    evidenceSignal: 'Resilience framing with social determinants and systems-level response.',
  },
  {
    name: 'APA Resilience',
    url: 'https://www.apa.org/topics/resilience',
    category: 'framework',
    evidenceSignal: 'Trainable coping skills and social support as key resilience drivers.',
  },
  {
    name: 'NIMH Child and Adolescent Mental Health',
    url: 'https://www.nimh.nih.gov/health/topics/child-and-adolescent-mental-health',
    category: 'framework',
    evidenceSignal: 'Early warning signs and prompt intervention reduce long-term harm.',
  },
  {
    name: 'CDC Mental Health',
    url: 'https://www.cdc.gov/mental-health/index.html',
    category: 'framework',
    evidenceSignal: 'Population-level mental health education, stigma reduction, and data channels.',
  },
  {
    name: 'Healthy Minds Network',
    url: 'https://healthymindsnetwork.org/',
    category: 'institute',
    evidenceSignal: 'Campus mental health survey benchmarks and action toolkit.',
  },
  {
    name: 'ACHA-NCHA',
    url: 'https://www.acha.org/NCHA',
    category: 'institute',
    evidenceSignal: 'Institutional student health measurement and implementation toolkits.',
  },
  {
    name: 'SOS Signs of Suicide',
    url: 'https://sossignsofsuicide.org/',
    category: 'institute',
    evidenceSignal: 'Evidence-based student and staff training with risk reduction outcomes.',
  },
  {
    name: 'Togetherall',
    url: 'https://togetherall.com/',
    category: 'platform',
    evidenceSignal: 'Anonymous community-based support with moderated safety model.',
  },
  {
    name: 'Kooth',
    url: 'https://www.kooth.com/',
    category: 'platform',
    evidenceSignal: 'Anonymous journaling, mini-activities, moderated peer forum, and chat support.',
  },
  {
    name: 'Sonar Mental Health',
    url: 'https://www.sonarmentalhealth.com/',
    category: 'platform',
    evidenceSignal: 'Human-in-the-loop coaching with school escalation and care navigation.',
  },
  {
    name: 'SilverCloud by Amwell',
    url: 'https://silvercloud.amwell.com/',
    category: 'platform',
    evidenceSignal: 'Evidence-based digital CBT-style pathways and higher-ed support models.',
  },
  {
    name: 'Headspace',
    url: 'https://www.headspace.com/',
    category: 'platform',
    evidenceSignal: 'Large content library for stress, sleep, and guided practice adherence.',
  },
  {
    name: 'Calm',
    url: 'https://www.calm.com/',
    category: 'platform',
    evidenceSignal: 'Behavioral routines for stress and sleep with high daily engagement design.',
  },
  {
    name: 'Befrienders Worldwide',
    url: 'https://www.befrienders.org/',
    category: 'crisis-service',
    evidenceSignal: 'Anonymous emotional support and multilingual global access model.',
  },
];

export const checkInQuestions: CheckInQuestion[] = [
  { id: 'overwhelm', prompt: 'I felt overwhelmed by daily demands today.', domain: 'stress' },
  { id: 'sleep', prompt: 'My sleep quality has made functioning difficult this week.', domain: 'sleep' },
  { id: 'focus', prompt: 'Concentration problems disrupted my studies or work.', domain: 'focus' },
  { id: 'connection', prompt: 'I felt disconnected from people who matter to me.', domain: 'connection' },
  { id: 'hopeless', prompt: 'I felt stuck or hopeless about things improving.', domain: 'safety' },
  { id: 'support', prompt: 'I know at least one trusted person I can reach out to.', domain: 'connection' },
];

export const supportResources: SupportResource[] = [
  {
    id: 'crisis-988',
    title: 'Urgent Crisis Support (988)',
    type: 'crisis',
    description: 'Immediate support if you feel in danger or unable to stay safe.',
    tags: ['crisis', 'safety', 'urgent'],
    availability: '24/7',
    actionLabel: 'Call or Text 988',
    actionHref: 'https://988lifeline.org/',
  },
  {
    id: 'peer-circle',
    title: 'Peer Support Circle',
    type: 'peer',
    description: 'Speak with trained peer listeners in a low-stigma, non-judgmental setting.',
    tags: ['peer', 'loneliness', 'belonging'],
    availability: 'Daily sessions',
    actionLabel: 'Open Peer Navigator',
    actionHref: '/peer-navigator',
  },
  {
    id: 'self-guided-sleep',
    title: 'Sleep Reset Plan',
    type: 'self-guided',
    description: '10-minute nightly protocol to lower arousal and improve next-day focus.',
    tags: ['sleep', 'focus', 'stress'],
    availability: 'On-demand',
    actionLabel: 'Start Habit Planner',
    actionHref: '#habit-planner',
  },
  {
    id: 'campus-counseling',
    title: 'Campus Counseling Linkout',
    type: 'campus',
    description: 'Create a referral packet with concerns, goals, and preferred support format.',
    tags: ['campus', 'professional', 'therapy'],
    availability: 'Campus hours',
    actionLabel: 'Build Referral Notes',
    actionHref: '#safety-plan',
  },
  {
    id: 'guided-journal',
    title: 'Guided Reflection Journal',
    type: 'self-guided',
    description: 'Structured prompts to process emotions and identify practical next steps.',
    tags: ['journal', 'stress', 'self-awareness'],
    availability: 'On-demand',
    actionLabel: 'Open Echo Chamber',
    actionHref: '/echo',
  },
  {
    id: 'care-navigation',
    title: 'Care Navigation Checklist',
    type: 'professional',
    description: 'Action list to move from concern to care without getting stuck in uncertainty.',
    tags: ['navigation', 'care', 'professional'],
    availability: 'On-demand',
    actionLabel: 'Open Safety Plan',
    actionHref: '#safety-plan',
  },
];

export const habitTemplates: HabitTemplate[] = [
  {
    id: 'breathing-reset',
    title: 'Breathing Reset',
    minutes: 4,
    tags: ['stress', 'anxiety'],
    rationale: 'Down-regulates physiological arousal before tasks or sleep.',
  },
  {
    id: 'connection-ping',
    title: 'Connection Ping',
    minutes: 5,
    tags: ['belonging', 'loneliness'],
    rationale: 'Micro-social connection reduces isolation and improves resilience.',
  },
  {
    id: 'focus-sprint',
    title: 'Focus Sprint',
    minutes: 15,
    tags: ['focus', 'academics'],
    rationale: 'Short, bounded work lowers avoidance and builds momentum.',
  },
  {
    id: 'night-shutdown',
    title: 'Night Shutdown',
    minutes: 10,
    tags: ['sleep', 'stress'],
    rationale: 'Evening wind-down protects recovery and cognitive performance.',
  },
  {
    id: 'gratitude-log',
    title: 'Gratitude Log',
    minutes: 3,
    tags: ['mood', 'resilience'],
    rationale: 'Positive appraisal training supports emotional flexibility.',
  },
];

export const peerCircles: PeerCircle[] = [
  {
    id: 'first-year-transition',
    name: 'First-Year Transition Circle',
    audience: 'New students adapting to campus life',
    focus: ['belonging', 'routines', 'academic stress'],
    format: 'Weekly peer cohort',
  },
  {
    id: 'identity-safe-space',
    name: 'Identity-Affirming Support Circle',
    audience: 'Students seeking identity-aware support',
    focus: ['identity', 'stigma', 'community'],
    format: 'Facilitated peer dialogue',
  },
  {
    id: 'exam-pressure',
    name: 'Exam Pressure Lab',
    audience: 'Students facing high assessment pressure',
    focus: ['focus', 'sleep', 'anxiety'],
    format: 'Structured peer + coach playbook',
  },
  {
    id: 'recovery-track',
    name: 'Recovery and Re-entry Circle',
    audience: 'Students returning from disruption or leave',
    focus: ['care navigation', 'confidence', 're-engagement'],
    format: 'Small-group accountability',
  },
];
