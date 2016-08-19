'use strict';

var fs = require('fs');
var fse = require('fs-extra');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var glob = require('glob');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var projectRoot = require('config').projectRoot;
var migrate = require('markit/migrate');

module.exports = function() {
  return function() {

    return co(function*() {

      let entities = glob.sync('/js/javascript-tutorial/**/{task,article,solution}.md');

      //entities = ['/js/javascript-tutorial/1-js/2-first-steps/17-function-basics/article.md'];

      for (var i = 0; i < entities.length; i++) {
        var entityPath = entities[i];

        console.log('----------->', entityPath);
        let migration = migrate(fs.readFileSync(entityPath, 'utf-8'));

        let text = migration.text;
        let head = migration.head;

        console.log(entityPath, head, text, "\n\n\n\n\n");

        fs.writeFileSync(entityPath, text);

        if (head.trim()) {
          fs.writeFileSync(path.dirname(entityPath) + '/head.html', head);
        }

      }

    });

  };
};

