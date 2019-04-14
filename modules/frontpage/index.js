const mountHandlerMiddleware = require('engine/koa/mountHandlerMiddleware');

exports.init = function(app) {
  app.use(mountHandlerMiddleware('/', __dirname));
};

