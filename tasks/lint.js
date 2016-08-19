const gp = require('gulp-load-plugins')();

module.exports = function(options) {

  return function(callback) {
    return gp.jshintCache(options).apply(this, arguments);
  };
};
