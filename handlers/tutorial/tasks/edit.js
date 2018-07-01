'use strict';

let fs = require('fs');
let path = require('path');
let log = require('log')();
let Article = require('../models/article');
let Task = require('../models/task');
let url = require('url');
let execSync = require('child_process').execSync;

module.exports = function(options) {

  return function() {

    return async function() {

      let args = require('yargs')
        .usage("tutorial url is required.")
        .example("gulp tutorial:edit --url http://javascript.local/memory-leaks-jquery --root /js/javascript-tutorial")
        .demand(['url', 'root'])
        .argv;

      let urlPath = url.parse(args.url).pathname.split('/').filter(Boolean);

      if (urlPath.length == 1) {
        let article = await Article.findOne({slug: urlPath[0]});
        if (!article) {
          console.log("Not found!");
          return;
        }

        let weight = article.weight + '';
        if (weight.length < 2) weight = 0 + weight;

        let dirName = weight + '-' + article.slug;
        let cmd = "find '" + args.root + "' -path '*/" + dirName + "/article.md'";
        console.log(cmd);

        let result = execSync(cmd, {encoding: 'utf8'}).trim();

        if (!result) {
          return;
        }

        console.log(path.dirname(result));
        execSync('s ' + result);
      }

      if (urlPath[0] == 'task') {
        let task = await Task.findOne({slug: urlPath[1]});
        if (!task) {
          return;
        }

        let dirName = task.weight + '-' + task.slug;
        let result = execSync("find /js/javascript-tutorial -path '*/" + dirName + "/task.md'", {encoding: 'utf8'}).trim();

        if (!result) {
          return;
        }

        console.log(path.dirname(result));
        execSync('s ' + result + ' ' + result.replace('task.md', 'solution.md'));
      }

    }();
  };
};
