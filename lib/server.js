/**
 * Http Server
 */
const http = require('http');
const { StringDecoder } = require('string_decoder');

const handlers = require('./handlers');
const helpers = require('./helpers');
const config = require('./config');

const server = {};

// Http Server
server.httpServer = http.createServer((req, res) => {
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

// Routers
server.router = {
  'users': handlers.users,
  'tokens': handlers.tokens,
  'items': handlers.items,
  'carts': handlers.carts,
  'orders': handlers.orders,
  'notFound': handlers.notFound
}

// Starts the server
server.init = () => {
  server.httpServer.listen(config.httpPort, () => {
    console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode`);
  });
};

module.exports = server;