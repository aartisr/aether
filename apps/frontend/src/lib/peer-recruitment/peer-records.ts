import type { PeerContactModality } from '../peer-directory/peer-navigator-directory';
import type { PeerCandidate } from './types';

export type CreatePeerRecordInput = {
  id?: string;
  name: string;
  background: string;
  pronouns: string;
  goals: string[];
  modalities: PeerContactModality[];
  source?: PeerCandidate['source'];
  roleIntent?: PeerCandidate['roleIntent'];
  maxActiveMatches?: number;
  responseSlaHours?: number;
};

export type UpdatePeerRecordInput = Partial<
  Omit<CreatePeerRecordInput, 'source' | 'roleIntent'> & {
    maxActiveMatches: number;
    currentActiveMatches: number;
    responseSlaHours: number;
  }
>;

const candidateSources: PeerCandidate['source'][] = ['seed', 'referral', 'campaign', 'event', 'other'];
const roleIntents: PeerCandidate['roleIntent'][] = ['navigator', 'seeker', 'both'];
const modalitiesAllowed: PeerContactModality[] = ['chat', 'phone', 'video'];

export class PeerRecordValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PeerRecordValidationError';
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42);
}

function asTrimmedString(value: unknown): string | undefined {
  return typeof value === 'string' ? value.trim() : undefined;
}

export function parseDelimitedList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => (typeof item === 'string' ? item.split(/[\n,]/g) : []))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseModalities(value: unknown): PeerContactModality[] {
  const parsed = parseDelimitedList(value)
    .map((item) => item.toLowerCase())
    .filter((item): item is PeerContactModality => modalitiesAllowed.includes(item as PeerContactModality));

  return Array.from(new Set(parsed));
}

function parseInteger(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return Math.round(parsed);
    }
  }

  return undefined;
}

export function validateCreatePeerRecordInput(input: CreatePeerRecordInput): Required<CreatePeerRecordInput> {
  const name = asTrimmedString(input.name);
  const background = asTrimmedString(input.background);
  const pronouns = asTrimmedString(input.pronouns);
  const goals = input.goals.map((item) => item.trim()).filter(Boolean);
  const modalities = Array.from(new Set(input.modalities.filter((item) => modalitiesAllowed.includes(item))));

  if (!name) throw new PeerRecordValidationError('name is required.');
  if (!background) throw new PeerRecordValidationError('background is required.');
  if (!pronouns) throw new PeerRecordValidationError('pronouns is required.');
  if (goals.length === 0) throw new PeerRecordValidationError('at least one goal is required.');
  if (modalities.length === 0) throw new PeerRecordValidationError('at least one contact modality is required.');

  const maxActiveMatches = parseInteger(input.maxActiveMatches) ?? 3;
  const responseSlaHours = parseInteger(input.responseSlaHours) ?? 24;

  if (maxActiveMatches < 1 || maxActiveMatches > 50) {
    throw new PeerRecordValidationError('maxActiveMatches must be between 1 and 50.');
  }

  if (responseSlaHours < 1 || responseSlaHours > 240) {
    throw new PeerRecordValidationError('responseSlaHours must be between 1 and 240.');
  }

  const source = candidateSources.includes(input.source ?? 'other') ? (input.source ?? 'other') : 'other';
  const roleIntent = roleIntents.includes(input.roleIntent ?? 'navigator') ? (input.roleIntent ?? 'navigator') : 'navigator';

  return {
    id: asTrimmedString(input.id) ?? '',
    name,
    background,
    pronouns,
    goals,
    modalities,
    source,
    roleIntent,
    maxActiveMatches,
    responseSlaHours,
  };
}

export function validateUpdatePeerRecordInput(input: UpdatePeerRecordInput): UpdatePeerRecordInput {
  const next: UpdatePeerRecordInput = {};

  if (input.id !== undefined) {
    const id = asTrimmedString(input.id);
    if (!id) throw new PeerRecordValidationError('id cannot be empty.');
    next.id = id;
  }

  if (input.name !== undefined) {
    const name = asTrimmedString(input.name);
    if (!name) throw new PeerRecordValidationError('name cannot be empty.');
    next.name = name;
  }

  if (input.background !== undefined) {
    const background = asTrimmedString(input.background);
    if (!background) throw new PeerRecordValidationError('background cannot be empty.');
    next.background = background;
  }

  if (input.pronouns !== undefined) {
    const pronouns = asTrimmedString(input.pronouns);
    if (!pronouns) throw new PeerRecordValidationError('pronouns cannot be empty.');
    next.pronouns = pronouns;
  }

  if (input.goals !== undefined) {
    const goals = input.goals.map((item) => item.trim()).filter(Boolean);
    if (goals.length === 0) throw new PeerRecordValidationError('goals cannot be empty.');
    next.goals = goals;
  }

  if (input.modalities !== undefined) {
    const modalities = Array.from(new Set(input.modalities.filter((item) => modalitiesAllowed.includes(item))));
    if (modalities.length === 0) throw new PeerRecordValidationError('modalities cannot be empty.');
    next.modalities = modalities;
  }

  if (input.maxActiveMatches !== undefined) {
    const max = parseInteger(input.maxActiveMatches);
    if (!max || max < 1 || max > 50) throw new PeerRecordValidationError('maxActiveMatches must be between 1 and 50.');
    next.maxActiveMatches = max;
  }

  if (input.currentActiveMatches !== undefined) {
    const current = parseInteger(input.currentActiveMatches);
    if (current === undefined || current < 0) throw new PeerRecordValidationError('currentActiveMatches must be >= 0.');
    next.currentActiveMatches = current;
  }

  if (input.responseSlaHours !== undefined) {
    const sla = parseInteger(input.responseSlaHours);
    if (!sla || sla < 1 || sla > 240) throw new PeerRecordValidationError('responseSlaHours must be between 1 and 240.');
    next.responseSlaHours = sla;
  }

  return next;
}

export function buildPeerId(name: string, fallback?: string): string {
  const slug = slugify(name);
  if (slug) {
    return `peer-${slug}`;
  }

  const fb = slugify(fallback ?? 'candidate');
  return `peer-${fb || 'candidate'}`;
}

export function parseCreatePeerInputFromBody(body: Record<string, unknown>): CreatePeerRecordInput {
  return {
    id: asTrimmedString(body.id),
    name: asTrimmedString(body.name) ?? '',
    background: asTrimmedString(body.background) ?? '',
    pronouns: asTrimmedString(body.pronouns) ?? '',
    goals: parseDelimitedList(body.goals),
    modalities: parseModalities(body.modalities),
    source: candidateSources.includes(body.source as PeerCandidate['source'])
      ? (body.source as PeerCandidate['source'])
      : undefined,
    roleIntent: roleIntents.includes(body.roleIntent as PeerCandidate['roleIntent'])
      ? (body.roleIntent as PeerCandidate['roleIntent'])
      : undefined,
    maxActiveMatches: parseInteger(body.maxActiveMatches),
    responseSlaHours: parseInteger(body.responseSlaHours),
  };
}

export function parseUpdatePeerInputFromBody(body: Record<string, unknown>): UpdatePeerRecordInput {
  const next: UpdatePeerRecordInput = {};

  if ('id' in body) next.id = asTrimmedString(body.id);
  if ('name' in body) next.name = asTrimmedString(body.name);
  if ('background' in body) next.background = asTrimmedString(body.background);
  if ('pronouns' in body) next.pronouns = asTrimmedString(body.pronouns);
  if ('goals' in body) next.goals = parseDelimitedList(body.goals);
  if ('modalities' in body) next.modalities = parseModalities(body.modalities);
  if ('maxActiveMatches' in body) next.maxActiveMatches = parseInteger(body.maxActiveMatches);
  if ('currentActiveMatches' in body) next.currentActiveMatches = parseInteger(body.currentActiveMatches);
  if ('responseSlaHours' in body) next.responseSlaHours = parseInteger(body.responseSlaHours);

  return next;
}
