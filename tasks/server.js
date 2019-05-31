let app = require('engine/koa/app');
let config = require('config');

module.exports = async function() {
  // this tasks never ends, because it runs the server
  await app.waitBootAndListen(config.server.host, config.server.port);
};
