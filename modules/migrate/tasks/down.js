var MigrationManager = require('../lib/migrationManager');
var co = require('co');
var gutil = require('gulp-util');

module.exports = function() {

  return function() {

    return co(function*() {
      var migrationManager = new MigrationManager();
      yield* migrationManager.loadState();
      var migrated = yield* migrationManager.migrate(-1);
      if (!migrated) {
        gutil.log("Migration not found.");
      }
    });

  };

};
