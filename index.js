const http = require('http');
const { StringDecoder } = require('string_decoder');

const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
const config = require('./lib/config');

const server = http.createServer((req, res) => {
  const urlObject = new URL(req.url, config.baseDomain);
  
  const trimmedPath = urlObject.pathname.replace(/^\/+|\/+$/g, '');
  const method = req.method.toLowerCase();
  const headers = req.headers;
  const queryStringObject = urlObject.searchParams;

  //Get the payload
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  //Streams
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  req.on('end', () => {
    const handler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    const data = {
      trimmedPath,
      method,
      headers,
      queryStringObject,
      'payload': helpers.parseJsonToObject(buffer)
    };

    handler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      payload = typeof(payload) == 'object' ? payload : {};

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(JSON.stringify(payload));
    });
  });
});

server.router = {
  'users': handlers.users,
  'notFound': handlers.notFound
}

server.listen(config.httpPort, () => {
  console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode`);
});