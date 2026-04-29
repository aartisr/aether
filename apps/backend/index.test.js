const test = require('node:test');
const assert = require('node:assert/strict');
const { createRequestListener } = require('./index');

function invokeListener({ method = 'GET', url = '/' } = {}) {
  const response = {
    statusCode: undefined,
    headers: undefined,
    body: '',
    writeHead(statusCode, headers) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
    end(body = '') {
      this.body = body;
    },
  };

  createRequestListener()({ method, url }, response);
  return response;
}

test('GET /health returns service status', () => {
  const response = invokeListener({ url: '/health?from=test' });
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['Content-Type'], 'application/json; charset=utf-8');
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'backend');
  assert.match(body.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

test('unsupported /health methods return 405 with allowed methods', () => {
  const response = invokeListener({ method: 'POST', url: '/health' });
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, 'GET, HEAD');
  assert.deepEqual(body, { error: 'Method Not Allowed' });
});

test('HEAD /health returns status headers without a body', () => {
  const response = invokeListener({ method: 'HEAD', url: '/health' });

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['Content-Type'], 'application/json; charset=utf-8');
  assert.equal(response.body, '');
});

test('unknown routes return 404', () => {
  const response = invokeListener({ url: '/missing' });
  const body = JSON.parse(response.body);

  assert.equal(response.statusCode, 404);
  assert.equal(body.error, 'Not Found');
});
