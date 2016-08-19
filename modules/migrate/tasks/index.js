module.exports = function(gulp) {
  gulp.task('migrate:up', lazyRequireTask('migrate/tasks/up'));
  gulp.task('migrate:down', lazyRequireTask('migrate/tasks/down'));
  gulp.task('migrate:create', lazyRequireTask('migrate/tasks/create'));
}
