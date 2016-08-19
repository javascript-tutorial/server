exports.CacheEntry = require('./models/cacheEntry');

var mountHandlerMiddleware = require('lib/mountHandlerMiddleware');

exports.init = function(app) {
  app.use(mountHandlerMiddleware('/cache', __dirname));
};
