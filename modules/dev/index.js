let mountHandlerMiddleware = require('engine/koa/mountHandlerMiddleware');

exports.init = function(app) {
  app.use( mountHandlerMiddleware('/dev', __dirname) );
};

