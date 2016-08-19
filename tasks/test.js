const gulp = require('gulp');
const mocha = require('gulp-mocha');
const assert = require('assert');

require('should');
require('co-mocha');

module.exports = function(options) {

  return function() {
    // config needs the right env
    assert(process.env.NODE_ENV == 'test', "NODE_ENV=test must be set");

    return gulp.src(options.src, {read: false})
      .pipe(mocha(options));
  };

};

