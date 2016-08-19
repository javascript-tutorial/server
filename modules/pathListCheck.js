const log = require('log')();
const pathToRegexp = require('path-to-regexp');

function PathListCheck() {
  this.paths = [];
}

PathListCheck.prototype.add = function(path) {
  if (path instanceof RegExp) {
    this.paths.push(path);
  } else if (typeof path == 'string') {
    this.paths.push(pathToRegexp(path));
  } else {
    throw new Error("unsupported path type: " + path);
  }
};

PathListCheck.prototype.check = function(path) {

  for (var i = 0; i < this.paths.length; i++) {
    log.trace("path test " + path + " against " + this.paths[i]);
    if (this.paths[i].test(path)) {
      log.trace("path match found");
      return true;
    }
  }

  return false;
};

module.exports = PathListCheck;
