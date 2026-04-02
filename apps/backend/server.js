const { createServer } = require('./index');

const port = Number(process.env.BACKEND_PORT || process.env.PORT || 8080);
const server = createServer();

server.listen(port, '0.0.0.0', () => {
  console.log(`Aether backend listening on http://0.0.0.0:${port}`);
});
