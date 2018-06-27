let co = require('co');
let app = require('app');
let config = require('config');

module.exports = function() {
  return function(callback) {
    // this tasks never ends, because it runs the server
    co(app.waitBootAndListen(config.server.host, config.server.port));

  };
};

