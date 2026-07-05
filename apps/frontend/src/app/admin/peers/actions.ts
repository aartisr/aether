'use server';

import { redirect } from 'next/navigation';
import { canAccessAdminSection, getAdminRoleForRequest } from '../../../lib/admin-auth';
import {
  parseCreatePeerInputFromBody,
  parseUpdatePeerInputFromBody,
  PeerRecordValidationError,
} from '../../../lib/peer-recruitment/peer-records';
import { PeerLifecycleTransitionError } from '../../../lib/peer-recruitment/lifecycle';
import {
  activateRecruitmentPeer,
  createRecruitmentPeer,
  deleteRecruitmentPeer,
  openPeerIncidentCase,
  pauseRecruitmentPeer,
  resolvePeerIncidentCase,
  suspendRecruitmentPeer,
  updateRecruitmentPeer,
  updatePeerScreeningStatus,
  updatePeerTrainingStatus,
  updatePeerVerificationStatus,
} from '../../../lib/peer-recruitment/store';
import type { IncidentSeverity, ScreeningStatus, TrainingStatus, VerificationStatus } from '../../../lib/peer-recruitment/types';

async function assertAdminSessionOrRedirect(): Promise<void> {
  const role = await getAdminRoleForRequest();
  if (!role) {
    redirect('/admin/login?next=/admin/peers');
  }

  if (!canAccessAdminSection(role, 'peers')) {
    redirect('/admin/peers?error=forbidden');
  }
}

export async function activatePeerAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  const peerId = String(formData.get('peerId') ?? '').trim();
  const reason = String(formData.get('reason') ?? '').trim();

  if (!peerId) {
    redirect('/admin/peers?error=missing-peer');
  }

  try {
    await activateRecruitmentPeer(peerId, 'admin-action', reason || undefined);
    redirect('/admin/peers?saved=activated');
  } catch (error) {
    if (error instanceof PeerLifecycleTransitionError) {
      redirect(`/admin/peers?error=${error.code}`);
    }
    redirect('/admin/peers?error=transition-failed');
  }
}

export async function pausePeerAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  const peerId = String(formData.get('peerId') ?? '').trim();
  const reason = String(formData.get('reason') ?? '').trim();

  if (!peerId) {
    redirect('/admin/peers?error=missing-peer');
  }

  try {
    await pauseRecruitmentPeer(peerId, 'admin-action', reason || undefined);
    redirect('/admin/peers?saved=paused');
  } catch (error) {
    if (error instanceof PeerLifecycleTransitionError) {
      redirect(`/admin/peers?error=${error.code}`);
    }
    redirect('/admin/peers?error=transition-failed');
  }
}

export async function suspendPeerAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  const peerId = String(formData.get('peerId') ?? '').trim();
  const reason = String(formData.get('reason') ?? '').trim();

  if (!peerId) {
    redirect('/admin/peers?error=missing-peer');
  }

  try {
    await suspendRecruitmentPeer(peerId, 'admin-action', reason || undefined);
    redirect('/admin/peers?saved=suspended');
  } catch (error) {
    if (error instanceof PeerLifecycleTransitionError) {
      redirect(`/admin/peers?error=${error.code}`);
    }
    redirect('/admin/peers?error=transition-failed');
  }
}

function asEnum<T extends string>(value: FormDataEntryValue | null, allowed: T[]): T | undefined {
  if (typeof value !== 'string') return undefined;
  return allowed.includes(value as T) ? (value as T) : undefined;
}

export async function updateScreeningAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  const peerId = String(formData.get('peerId') ?? '').trim();
  const status = asEnum<ScreeningStatus>(formData.get('screeningStatus'), ['not_started', 'passed', 'held', 'failed']);
  const reason = String(formData.get('reason') ?? '').trim();

  if (!peerId || !status) {
    redirect('/admin/peers?error=invalid-screening');
  }

  try {
    await updatePeerScreeningStatus(peerId, status, 'admin-action', reason || undefined);
    redirect('/admin/peers?saved=screening');
  } catch (error) {
    if (error instanceof PeerLifecycleTransitionError) {
      redirect(`/admin/peers?error=${error.code}`);
    }
    redirect('/admin/peers?error=screening-failed');
  }
}

export async function updateTrainingAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  const peerId = String(formData.get('peerId') ?? '').trim();
  const status = asEnum<TrainingStatus>(formData.get('trainingStatus'), ['not_started', 'in_progress', 'complete', 'expired']);
  const reason = String(formData.get('reason') ?? '').trim();

  if (!peerId || !status) {
    redirect('/admin/peers?error=invalid-training');
  }

  try {
    await updatePeerTrainingStatus(peerId, status, 'admin-action', reason || undefined);
    redirect('/admin/peers?saved=training');
  } catch (error) {
    if (error instanceof PeerLifecycleTransitionError) {
      redirect(`/admin/peers?error=${error.code}`);
    }
    redirect('/admin/peers?error=training-failed');
  }
}

export async function updateVerificationAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  const peerId = String(formData.get('peerId') ?? '').trim();
  const status = asEnum<VerificationStatus>(formData.get('verificationStatus'), ['not_started', 'pending', 'verified', 'rejected']);
  const reason = String(formData.get('reason') ?? '').trim();

  if (!peerId || !status) {
    redirect('/admin/peers?error=invalid-verification');
  }

  try {
    await updatePeerVerificationStatus(peerId, status, 'admin-action', reason || undefined);
    redirect('/admin/peers?saved=verification');
  } catch (error) {
    if (error instanceof PeerLifecycleTransitionError) {
      redirect(`/admin/peers?error=${error.code}`);
    }
    redirect('/admin/peers?error=verification-failed');
  }
}

export async function openIncidentAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  const peerId = String(formData.get('peerId') ?? '').trim();
  const severity = asEnum<IncidentSeverity>(formData.get('severity'), ['p0', 'p1', 'p2', 'p3']);
  const summary = String(formData.get('summary') ?? '').trim();

  if (!peerId || !severity || !summary) {
    redirect('/admin/peers?error=invalid-incident');
  }

  await openPeerIncidentCase({
    peerId,
    severity,
    summary,
    actorId: 'admin-action',
  });

  redirect('/admin/peers?saved=incident-opened');
}

export async function resolveIncidentAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  const caseId = String(formData.get('caseId') ?? '').trim();
  const resolutionNote = String(formData.get('resolutionNote') ?? '').trim();
  const restoreToPaused = formData.get('restoreToPaused') === 'true';

  if (!caseId || !resolutionNote) {
    redirect('/admin/peers?error=invalid-resolution');
  }

  await resolvePeerIncidentCase({
    caseId,
    resolutionNote,
    actorId: 'admin-action',
    restoreToPaused,
  });

  redirect('/admin/peers?saved=incident-resolved');
}

function formDataToBody(formData: FormData): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const goals = formData.getAll('goals').filter((item): item is string => typeof item === 'string');
  const modalities = formData.getAll('modalities').filter((item): item is string => typeof item === 'string');

  for (const [key, value] of formData.entries()) {
    if (key === 'goals' || key === 'modalities') continue;
    body[key] = typeof value === 'string' ? value : undefined;
  }

  if (goals.length > 0) body.goals = goals;
  if (modalities.length > 0) body.modalities = modalities;
  return body;
}

export async function createPeerRecordAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  try {
    const body = formDataToBody(formData);
    const input = parseCreatePeerInputFromBody(body);
    await createRecruitmentPeer(input, 'admin-action', 'peer created in admin');
    redirect('/admin/peers?saved=peer-created');
  } catch (error) {
    if (error instanceof PeerRecordValidationError) {
      redirect(`/admin/peers?error=${encodeURIComponent(error.message)}`);
    }

    redirect('/admin/peers?error=peer-create-failed');
  }
}

export async function updatePeerRecordAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  const peerId = String(formData.get('peerId') ?? '').trim();
  if (!peerId) {
    redirect('/admin/peers?error=missing-peer');
  }

  try {
    const body = formDataToBody(formData);
    const patch = parseUpdatePeerInputFromBody(body);
    await updateRecruitmentPeer(peerId, patch, 'admin-action', 'peer updated in admin');
    redirect('/admin/peers?saved=peer-updated');
  } catch (error) {
    if (error instanceof PeerRecordValidationError) {
      redirect(`/admin/peers?error=${encodeURIComponent(error.message)}`);
    }

    redirect('/admin/peers?error=peer-update-failed');
  }
}

export async function deletePeerRecordAction(formData: FormData) {
  await assertAdminSessionOrRedirect();

  const peerId = String(formData.get('peerId') ?? '').trim();
  if (!peerId) {
    redirect('/admin/peers?error=missing-peer');
  }

  try {
    await deleteRecruitmentPeer(peerId, 'admin-action', 'peer deleted in admin');
    redirect('/admin/peers?saved=peer-deleted');
  } catch (error) {
    if ((error as Error).message.includes('open incidents')) {
      redirect('/admin/peers?error=peer-has-open-incidents');
    }

    redirect('/admin/peers?error=peer-delete-failed');
  }
}
