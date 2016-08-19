const gp = require('gulp-load-plugins')();

module.exports = function(options) {

  return function(callback) {
    gp.nodemon(options);
  };

};
