/** @jest-environment node */

import { NextRequest } from 'next/server';

type PeersRoute = typeof import('./peers/route');
type PeerRecordRoute = typeof import('./peers/[peerId]/route');
type LifecycleRoute = typeof import('./peers/[peerId]/suspend/route');
type ScreeningRoute = typeof import('./peers/[peerId]/screening/route');
type IncidentRoute = typeof import('./incidents/route');
type IncidentResolveRoute = typeof import('./incidents/[caseId]/resolve/route');
type AuditEventsRoute = typeof import('./audit/events/route');
type AuditExportRoute = typeof import('./audit/export/route');
type WorkerJobsRoute = typeof import('./workers/jobs/route');
type WorkerRunRoute = typeof import('./workers/run/route');

type LoadedRoutes = {
  peersRoute: PeersRoute;
  peerRecordRoute: PeerRecordRoute;
  suspendRoute: LifecycleRoute;
  activateRoute: LifecycleRoute;
  screeningRoute: ScreeningRoute;
  incidentsRoute: IncidentRoute;
  resolveIncidentRoute: IncidentResolveRoute;
  auditEventsRoute: AuditEventsRoute;
  auditExportRoute: AuditExportRoute;
  workerJobsRoute: WorkerJobsRoute;
  workerRunRoute: WorkerRunRoute;
};

async function loadRoutes(): Promise<LoadedRoutes> {
  process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER = 'memory';

  return {
    peersRoute: await import('./peers/route'),
    peerRecordRoute: await import('./peers/[peerId]/route'),
    suspendRoute: await import('./peers/[peerId]/suspend/route'),
    activateRoute: await import('./peers/[peerId]/activate/route'),
    screeningRoute: await import('./peers/[peerId]/screening/route'),
    incidentsRoute: await import('./incidents/route'),
    resolveIncidentRoute: await import('./incidents/[caseId]/resolve/route'),
    auditEventsRoute: await import('./audit/events/route'),
    auditExportRoute: await import('./audit/export/route'),
    workerJobsRoute: await import('./workers/jobs/route'),
    workerRunRoute: await import('./workers/run/route'),
  };
}

function makeJsonRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  });
}

describe('peer recruitment API contracts', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    delete process.env.PEER_RECRUITMENT_PERSISTENCE_DRIVER;
  });

  it('returns peers and supports lifecycle, incident, and audit workflow', async () => {
    const {
      peersRoute,
      suspendRoute,
      activateRoute,
      incidentsRoute,
      resolveIncidentRoute,
      auditEventsRoute,
      auditExportRoute,
    } = await loadRoutes();

    const initialPeersResponse = await peersRoute.GET();
    expect(initialPeersResponse.status).toBe(200);
    const initialPeersPayload = (await initialPeersResponse.json()) as {
      ok: boolean;
      count: number;
      peers: Array<{ id: string; lifecycleState: string }>;
    };

    expect(initialPeersPayload.ok).toBe(true);
    expect(initialPeersPayload.count).toBeGreaterThan(0);

    const peerId = initialPeersPayload.peers[0].id;

    const suspendResponse = await suspendRoute.POST(
      makeJsonRequest(`http://localhost/api/peer-recruitment/peers/${peerId}/suspend`, {
        actorId: 'contract-test',
        reason: 'workflow validation',
      }),
      { params: { peerId } }
    );
    expect(suspendResponse.status).toBe(200);

    const openIncidentResponse = await incidentsRoute.POST(
      makeJsonRequest('http://localhost/api/peer-recruitment/incidents', {
        peerId,
        severity: 'p1',
        summary: 'contract workflow incident',
        actorId: 'contract-test',
      })
    );
    expect(openIncidentResponse.status).toBe(201);
    const openIncidentPayload = (await openIncidentResponse.json()) as {
      incident: { caseId: string; status: string };
    };
    expect(openIncidentPayload.incident.status).toBe('open');

    const resolveIncidentResponse = await resolveIncidentRoute.POST(
      makeJsonRequest(
        `http://localhost/api/peer-recruitment/incidents/${openIncidentPayload.incident.caseId}/resolve`,
        {
          resolutionNote: 'resolved in contract test',
          actorId: 'contract-test',
          restoreToPaused: true,
        }
      ),
      { params: { caseId: openIncidentPayload.incident.caseId } }
    );
    expect(resolveIncidentResponse.status).toBe(200);

    const activateResponse = await activateRoute.POST(
      makeJsonRequest(`http://localhost/api/peer-recruitment/peers/${peerId}/activate`, {
        actorId: 'contract-test',
        reason: 'restore availability',
      }),
      { params: { peerId } }
    );
    expect(activateResponse.status).toBe(200);

    const finalPeersResponse = await peersRoute.GET();
    const finalPeersPayload = (await finalPeersResponse.json()) as {
      peers: Array<{ id: string; lifecycleState: string }>;
    };
    const updatedPeer = finalPeersPayload.peers.find((peer) => peer.id === peerId);
    expect(updatedPeer?.lifecycleState).toBe('active');

    const auditEventsResponse = await auditEventsRoute.GET(
      new NextRequest(`http://localhost/api/peer-recruitment/audit/events?peerId=${peerId}`)
    );
    expect(auditEventsResponse.status).toBe(200);
    const auditEventsPayload = (await auditEventsResponse.json()) as {
      count: number;
      events: Array<{ eventType: string }>;
    };

    expect(auditEventsPayload.count).toBeGreaterThan(0);
    expect(auditEventsPayload.events.some((event) => event.eventType === 'incident.opened')).toBe(true);
    expect(auditEventsPayload.events.some((event) => event.eventType === 'incident.resolved')).toBe(true);

    const auditExportResponse = await auditExportRoute.GET(
      new NextRequest(`http://localhost/api/peer-recruitment/audit/export?peerId=${peerId}`)
    );

    expect(auditExportResponse.status).toBe(200);
    expect(auditExportResponse.headers.get('content-type')).toContain('text/csv');

    const csv = await auditExportResponse.text();
    expect(csv).toContain('eventId,eventType,peerId');
    expect(csv).toContain(peerId);
  });

  it('rejects invalid screening status payload', async () => {
    const { peersRoute, screeningRoute } = await loadRoutes();

    const peersResponse = await peersRoute.GET();
    const peersPayload = (await peersResponse.json()) as { peers: Array<{ id: string }> };
    const peerId = peersPayload.peers[0].id;

    const response = await screeningRoute.POST(
      makeJsonRequest(`http://localhost/api/peer-recruitment/peers/${peerId}/screening`, {
        status: 'invalid',
      }),
      { params: { peerId } }
    );

    expect(response.status).toBe(400);
    const payload = (await response.json()) as { ok: boolean; errorCode: string };
    expect(payload.ok).toBe(false);
    expect(payload.errorCode).toBe('validation_error');
  });

  it('supports peer record create/update/get/delete lifecycle', async () => {
    const { peersRoute, peerRecordRoute } = await loadRoutes();

    const createResponse = await peersRoute.POST(
      makeJsonRequest('http://localhost/api/peer-recruitment/peers', {
        name: 'Morgan',
        background: 'Transfer Student',
        pronouns: 'they/them',
        goals: 'belonging, academic stress',
        modalities: ['chat', 'phone'],
        maxActiveMatches: 4,
        responseSlaHours: 12,
      })
    );

    expect(createResponse.status).toBe(201);
    const createPayload = (await createResponse.json()) as { peer: { id: string; name: string } };
    expect(createPayload.peer.name).toBe('Morgan');

    const peerId = createPayload.peer.id;

    const updateResponse = await peerRecordRoute.PATCH(
      makeJsonRequest(`http://localhost/api/peer-recruitment/peers/${peerId}`, {
        goals: ['belonging', 'career navigation'],
        responseSlaHours: 18,
      }),
      { params: { peerId } }
    );
    expect(updateResponse.status).toBe(200);

    const getResponse = await peerRecordRoute.GET(new Request(`http://localhost/api/peer-recruitment/peers/${peerId}`), {
      params: { peerId },
    });
    expect(getResponse.status).toBe(200);
    const getPayload = (await getResponse.json()) as { peer: { responseSlaHours: number; goals: string[] } };
    expect(getPayload.peer.responseSlaHours).toBe(18);
    expect(getPayload.peer.goals).toContain('career navigation');

    const deleteResponse = await peerRecordRoute.DELETE(
      new Request(`http://localhost/api/peer-recruitment/peers/${peerId}`, { method: 'DELETE' }),
      { params: { peerId } }
    );
    expect(deleteResponse.status).toBe(200);

    const afterDelete = await peerRecordRoute.GET(new Request(`http://localhost/api/peer-recruitment/peers/${peerId}`), {
      params: { peerId },
    });
    expect(afterDelete.status).toBe(404);
  });

  it('supports worker queue job enqueue/list and authenticated run', async () => {
    const { workerJobsRoute, workerRunRoute } = await loadRoutes();
    process.env.PEER_RECRUITMENT_WORKER_API_KEY = 'worker-test-key';

    const enqueueResponse = await workerJobsRoute.POST(
      makeJsonRequest('http://localhost/api/peer-recruitment/workers/jobs', {
        type: 'refresh_forecast',
      })
    );
    expect(enqueueResponse.status).toBe(201);

    const listResponse = await workerJobsRoute.GET(
      new NextRequest('http://localhost/api/peer-recruitment/workers/jobs?status=queued')
    );
    expect(listResponse.status).toBe(200);
    const listPayload = (await listResponse.json()) as { count: number };
    expect(listPayload.count).toBeGreaterThan(0);

    const unauthorizedResponse = await workerRunRoute.GET(
      new NextRequest('http://localhost/api/peer-recruitment/workers/run?limit=5')
    );
    expect(unauthorizedResponse.status).toBe(403);

    const runResponse = await workerRunRoute.GET(
      new NextRequest('http://localhost/api/peer-recruitment/workers/run?limit=5', {
        headers: {
          authorization: 'Bearer worker-test-key',
        },
      })
    );
    expect(runResponse.status).toBe(200);
    const runPayload = (await runResponse.json()) as { ok: boolean; processed: number };
    expect(runPayload.ok).toBe(true);
    expect(runPayload.processed).toBeGreaterThanOrEqual(1);

    delete process.env.PEER_RECRUITMENT_WORKER_API_KEY;
  });
});
