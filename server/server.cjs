const http = require('node:http');
const { dayStatus } = require('./dayPolicy.cjs');

const port = Number(process.env.PORT || 8766);
const host = process.env.HOST || '127.0.0.1';
const allowedOrigin = process.env.AURORA_ALLOWED_ORIGIN || 'http://127.0.0.1:8765';

http.createServer((request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    return response.end();
  }
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (request.method !== 'GET' || url.pathname !== '/api/day-access') {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ error: 'Not found' }));
  }
  try {
    const status = dayStatus(url.searchParams.get('date'), url.searchParams.get('timeZone'));
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(status));
  } catch (error) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: error.message }));
  }
}).listen(port, host, () => console.log(`Aurora day gate listening on http://${host}:${port}`));
