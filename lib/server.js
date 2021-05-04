/**
 * Http Server
 */
const http = require('http');
const url = require('url');
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
    let handler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // If the request is within the public directory, use public handler instead
    handler = trimmedPath.indexOf('public/') > -1 ? handlers.public : handler;

    const data = {
      trimmedPath,
      method,
      headers,
      queryStringObject,
      'payload': helpers.parseJsonToObject(buffer)
    };

    handler(data, (statusCode, payload, contentType) => {

      // Determine the type of the response (fallback to JSON)
      contentType = typeof(contentType) == 'string' ? contentType : 'json';

      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      
      // Return the response parts that are content specific
      let payloadString = '';
      if (contentType == 'json') {
        res.setHeader('Content-Type', 'application/json');
        payload = typeof(payload) == 'object' ? payload : {};
        payloadString = JSON.stringify(payload);
      }

      if (contentType == 'html') {
        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof(payload) == 'string' ? payload : '';
      }

      if (contentType == 'favicon') {
        res.setHeader('Content-Type', 'image/x-icon');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if (contentType == 'css') {
        res.setHeader('Content-Type', 'text/css');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if (contentType == 'png') {
        res.setHeader('Content-Type', 'image/png');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if (contentType == 'jpg') {
        res.setHeader('Content-Type', 'image/jpeg');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      if (contentType == 'plain') {
        res.setHeader('Content-Type', 'text/plain');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
      }

      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
});

// Routers
server.router = {
  '': handlers.index,
  'favicon.ico': handlers.favicon,
  'public': handlers.public,
  'account/create': handlers.accountCreate,
  'session/create': handlers.sessionCreate,
  'menu/items': handlers.getMenuItems,
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'api/items': handlers.items,
  'api/carts': handlers.carts,
  'api/orders': handlers.orders,
  'notFound': handlers.notFound
}

// Starts the server
server.init = () => {
  server.httpServer.listen(config.httpPort, () => {
    console.log(`The server is listening on port ${config.httpPort} in ${config.envName} mode`);
  });
};

module.exports = server;