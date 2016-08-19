"use strict";

var path = require('path');
var MigrationState = require('../models/migrationState');
var migrationsRoot = require('config').migrationsRoot;
var moment = require('moment');
var glob = require('glob');
var log = require('log')();

class MigrationManager {

  *loadState() {
    // current migration date, 0 at start
    var migrationState = yield MigrationState.findOne({});
    if (!migrationState) {
      migrationState = yield MigrationState.create({
        currentMigration: 0
      });
    }

    this.state = migrationState;
  }

  /**
   * Looks for the next migration file
   * @param direction 1 or -1
   * @returns file path & date, or null if not exists
   */
  findNextMigration(direction) {

    var lastMigrationDate = this.state.currentMigration;

    log.debug("look for migration since", lastMigrationDate);

    var migrationFiles = glob.sync(path.join(migrationsRoot, '*')).filter(function(migrationFile) {
      return parseInt(path.basename(migrationFile)); // only files like 20150505...
    });

    if (!migrationFiles.length) {
      return;
    }

    var migrationFile, migrationDate;

    if (direction > 0) {
      for (let i = 0; i < migrationFiles.length; i++) {
        migrationFile = migrationFiles[i];
        migrationDate = parseInt(path.basename(migrationFile));
        if (migrationDate > lastMigrationDate) {
          return {
            date: migrationDate,
            file: migrationFile
          };
        }
      }

    } else {
      for (let i = migrationFiles.length - 1; i >= 0; i--) {
        migrationFile = migrationFiles[i];
        migrationDate = parseInt(path.basename(migrationFile));
        if (migrationDate == lastMigrationDate) {
          return {
            date: migrationDate,
            file: migrationFile,
            datePrev: i > 0 ? parseInt(path.basename(migrationFiles[i - 1])) : 0
          };
        }
      }
    }


  }

  *migrate(direction) {

    var migration = this.findNextMigration(direction);
    if (!migration) {
      return false;
    }

    log.debug("Apply migration", migration.file, direction);

    var migrate = direction > 0 ? require(migration.file).up : require(migration.file).down;

    yield *migrate();

    yield this.state.persist({
      currentMigration: direction > 0 ? migration.date : migration.datePrev
    });

    return true;

  }

  /**
   * Apply all up migrations one by one
   */
  *migrateAllUp() {
    while(true) {
      var migrated = yield this.migrate(1);
      if (!migrated) break;
    }
  }

}

module.exports = MigrationManager;
