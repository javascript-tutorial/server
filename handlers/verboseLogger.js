const VerboseLogger = require('lib/verboseLogger');

exports.init = function(app) {

  app.verboseLogger = new VerboseLogger();
  app.use(app.verboseLogger.middleware());

};
