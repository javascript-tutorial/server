var fs = require('fs');
var fse = require('fs-extra');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var migrationsRoot = require('config').migrationsRoot;
var yargs = require('yargs');
var moment = require('moment');

var migrationTemplate = fs.readFileSync(path.join(__dirname, '../lib/migrationTemplate.js'));
/**
 * Usage:
 * --create name
 * @returns {Function}
 */
module.exports = function() {

  var argv = require('yargs')
    .usage('gulp migrate:create --name migrationName')
    .demand(['name'])
    .argv;

  return function() {

    return co(function*() {

      var filepath = path.join(migrationsRoot, moment().format('YYYYMMDDHHmmss') + '-' + argv.name + '.js');
      fs.writeFileSync(filepath, migrationTemplate);
      gutil.log("creating", filepath);
    });

  };

};
