// Usage: require('log')()
// NB: this file is RELOADED for EVERY REQUIRE
// (cleared from cache, to get parent filename every time)

let bunyan = require('./bunyan');
let requestSerializer = require('./requestSerializer');
let requestVerboseSerializer = require('./requestVerboseSerializer');
let resSerializer = require('./resSerializer');
let errSerializer = require('./errSerializer');
let httpErrorSerializer = require('./httpErrorSerializer');
let path = require('path');


// log.debug({req: ...})
// exported => new serializers can be added by other modules
let serializers = exports.serializers = {
  requestVerbose: requestVerboseSerializer,
  request:        requestSerializer,
  res:            resSerializer,
  err:            errSerializer,
  httpError:      httpErrorSerializer
};

let streams = require('./streams');

// if no name, then name is a parent module filename (or it's directory if index)
module.exports = function(name) {
  if (!name) {
    name = path.basename(module.parent.filename, '.js');
    if (name == 'index') {
      name = path.basename(path.dirname(module.parent.filename)) + '/index';
    }
  }

  let logger = bunyan.createLogger({
    name:        name,
    streams:     streams,
    serializers: serializers
  });

  return logger;
};


delete require.cache[__filename];
