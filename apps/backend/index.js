const http = require('node:http');

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

function writeJson(response, statusCode, payload, headers = {}, includeBody = true) {
  response.writeHead(statusCode, { ...jsonHeaders, ...headers });
  response.end(includeBody ? JSON.stringify(payload) : '');
}

function createRequestListener() {
  return function requestListener(request, response) {
    const requestUrl = new URL(request.url || '/', 'http://localhost');

    if (requestUrl.pathname === '/health') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        writeJson(response, 405, { error: 'Method Not Allowed' }, { Allow: 'GET, HEAD' });
        return;
      }

      writeJson(
        response,
        200,
        {
          status: 'ok',
          service: 'backend',
          timestamp: new Date().toISOString(),
        },
        {},
        request.method !== 'HEAD',
      );
      return;
    }

    writeJson(response, 404, { error: 'Not Found' });
  };
}

function createServer() {
  return http.createServer(createRequestListener());
}

module.exports = {
  createRequestListener,
  createServer,
};
