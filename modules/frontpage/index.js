const mountHandlerMiddleware = require('jsengine/koa/mountHandlerMiddleware');

exports.init = function(app) {
  app.use(mountHandlerMiddleware('/', __dirname));
};

