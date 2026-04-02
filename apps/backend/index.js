const http = require('node:http');

function createRequestListener() {
  return function requestListener(request, response) {
    if (request.url === '/health' && request.method === 'GET') {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(
        JSON.stringify({
          status: 'ok',
          service: 'backend',
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: 'Not Found' }));
  };
}

function createServer() {
  return http.createServer(createRequestListener());
}

module.exports = {
  createRequestListener,
  createServer,
};
