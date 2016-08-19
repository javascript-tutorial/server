const fse = require('fs-extra');
const gp = require('gulp-load-plugins')();
const gulp = require('gulp');

module.exports = function(options) {

  return function(callback) {

    fse.ensureDirSync(options.dst);

    return gulp.src(options.src)
      .pipe(gp.flatten())
      .pipe(gp.newer(options.dst))
      .pipe(gulp.dest(options.dst));

  };
};
