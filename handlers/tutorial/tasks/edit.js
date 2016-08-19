'use strict';

var co = require('co');
var fs = require('fs');
var path = require('path');
var log = require('log')();
var Article = require('../models/article');
var Task = require('../models/task');
var url = require('url');
var execSync = require('child_process').execSync;

module.exports = function(options) {

  return function() {

    return co(function* () {

      var args = require('yargs')
        .usage("tutorial url is required.")
        .example("gulp tutorial:edit --url http://javascript.in/memory-leaks-jquery --root /js/javascript-tutorial")
        .demand(['url', 'root'])
        .argv;

      var urlPath = url.parse(args.url).pathname.split('/').filter(Boolean);

      if (urlPath.length == 1) {
        var article = yield Article.findOne({slug: urlPath[0]}).exec();
        if (!article) {
          console.log("Not found!");
          return;
        }

        let weight = article.weight + '';
        if (weight.length < 2) weight = 0 + weight;

        var dirName = weight + '-' + article.slug;
        let cmd = "find '" + args.root + "' -path '*/" + dirName + "/article.md'";
        console.log(cmd);

        var result = execSync(cmd, {encoding: 'utf8'}).trim();

        if (!result) {
          return;
        }

        console.log(path.dirname(result));
        execSync('s ' + result);
      }

      if (urlPath[0] == 'task') {
        var task = yield Task.findOne({slug: urlPath[1]}).exec();
        if (!task) {
          return;
        }

        var dirName = task.weight + '-' + task.slug;
        var result = execSync("find /js/javascript-tutorial -path '*/" + dirName + "/task.md'", {encoding: 'utf8'}).trim();

        if (!result) {
          return;
        }

        console.log(path.dirname(result));
        execSync('s ' + result + ' ' + result.replace('task.md', 'solution.md'));
      }

    });
  };
};
