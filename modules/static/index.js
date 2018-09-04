const serve = require('koa-static');
const config = require('config');

exports.init = function(app) {
  app.use(serve(config.publicRoot, {
    maxage: 86400 * 1e3 // 1 day cache static
  }));
};

