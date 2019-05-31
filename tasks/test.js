const gulp = require('gulp');
const mocha = require('gulp-mocha');
const assert = require('assert');

require('should');
require('co-mocha');

module.exports = async function(options) {

  // config needs the right env
  assert(process.env.NODE_ENV === 'test', "NODE_ENV=test must be set");

  return new Promise(resolve => {
    return gulp.src(options.src, {read: false, follow: true})
      .pipe(mocha(options))
      .on('finish', resolve);
  })
};

