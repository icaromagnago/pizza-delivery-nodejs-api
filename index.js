const server = require('./lib/server');

const app = {};

app.init = () => {
  server.init();
};

app.init();

module.exports = app;
