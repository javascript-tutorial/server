let mountHandlerMiddleware = require('jsengine/koa/mountHandlerMiddleware');

exports.init = function(app) {
  app.use( mountHandlerMiddleware('/dev', __dirname) );
};

