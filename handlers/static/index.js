const serve = require('koa-static');
const config = require('config');

exports.init = function(app) {
  app.use(serve(config.publicRoot));
};

